const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const {
  enviarEmailPedidoRecibido,
  enviarEmailCambioEstado,
  enviarEmailNuevoPedidoAdmin,
} = require("../services/emailService");

const router = express.Router();

const uploadsDir = path.resolve(
  __dirname,
  "..",
  "uploads",
  "comprobantes"
);

fs.mkdirSync(uploadsDir, {
  recursive: true,
});

console.log(
  "📁 Carpeta de comprobantes:",
  uploadsDir
);

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadsDir, {
      recursive: true,
    });

    cb(null, uploadsDir);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(
      null,
      `${Date.now()}-${crypto.randomUUID()}${extension}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 8 * 1024 * 1024,
    fieldSize: 25 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const permitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!permitidos.includes(file.mimetype)) {
      return cb(
        new Error(
          "El comprobante debe ser JPG, PNG, WEBP o PDF."
        )
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   HELPERS
========================================================= */

function borrarArchivoSiExiste(file) {
  if (!file?.path) return;

  fs.unlink(file.path, (error) => {
    if (
      error &&
      error.code !== "ENOENT"
    ) {
      console.error(
        "No se pudo borrar el comprobante:",
        error.message
      );
    }
  });
}

function numeroSeguro(
  valor,
  fallback = 0
) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : fallback;
}

/* =========================================================
   POST /api/pedidos
   PÚBLICO
========================================================= */

router.post(
  "/",

  upload.single("comprobante"),

  async (req, res, next) => {
    let client;
    let transaccionIniciada = false;

    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "Falta el comprobante de transferencia.",
        });
      }

      if (!req.body?.pedido) {
        borrarArchivoSiExiste(req.file);

        return res.status(400).json({
          error:
            "Faltan los datos del pedido.",
        });
      }

      let pedido;

      try {
        pedido = JSON.parse(
          req.body.pedido
        );
      } catch {
        borrarArchivoSiExiste(req.file);

        return res.status(400).json({
          error:
            "Los datos del pedido no son válidos.",
        });
      }

      const {
        numero,
        cliente,
        items,
        total,
        cantidadPrendas,
        pago,
        entrega,
      } = pedido;

      if (
        !numero ||
        !cliente?.nombre ||
        !cliente?.email ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        borrarArchivoSiExiste(req.file);

        return res.status(400).json({
          error:
            "El pedido está incompleto.",
        });
      }

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      transaccionIniciada =
        true;

      const pedidoResult =
        await client.query(
          `
          INSERT INTO pedidos (
            numero,
            estado,
            cliente,
            entrega,
            total,
            cantidad_prendas,
            metodo_pago,
            remitente_transferencia,
            comprobante_nombre_original,
            comprobante_archivo,
            payload
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
          )
          RETURNING
            id,
            numero,
            estado,
            total,
            comprobante_nombre_original,
            comprobante_archivo,
            created_at
          `,
          [
            numero,

            "Comprobante enviado",

            cliente,

            entrega ||
              cliente?.entrega ||
              cliente?.tipoEntrega ||
              "envio",

            numeroSeguro(total),

            numeroSeguro(
              cantidadPrendas
            ),

            pago?.metodo ||
              "Transferencia bancaria",

            pago?.remitente ||
              null,

            req.file.originalname,

            req.file.filename,

            pedido,
          ]
        );

      const pedidoDb =
        pedidoResult.rows[0];

      /* =====================================================
         ITEMS
      ===================================================== */

      for (
        const item of items
      ) {
        await client.query(
          `
          INSERT INTO pedido_items (
            pedido_id,
            producto_id,
            nombre,
            color,
            talle,
            cantidad,
            precio_unitario,
            personalizacion
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )
          `,
          [
            pedidoDb.id,

            item.productoId ??
              item.producto_id ??
              item.id ??
              null,

            item.nombre ||
              "Producto TintaViva",

            item.color ||
              null,

            item.talle ||
              null,

            numeroSeguro(
              item.cantidad,
              1
            ),

            numeroSeguro(
              item.precioUnitario ??
                item.precio_unitario ??
                item.precio,
              0
            ),

            {
              imagenesProducto:
                item.imagenesProducto ||
                null,

              disenos:
                item.disenos ||
                null,

              capas:
                item.capas ||
                null,
            },
          ]
        );
      }

      await client.query(
        "COMMIT"
      );

      transaccionIniciada =
        false;

      /* =====================================================
         EMAILS AUTOMÁTICOS
      ===================================================== */

      Promise.allSettled([
        enviarEmailPedidoRecibido({
          numero,
          cliente,
          total,
          cantidadPrendas,

          entrega:
            entrega ||
            cliente?.entrega ||
            cliente?.tipoEntrega ||
            "envio",
        }),

        enviarEmailNuevoPedidoAdmin({
          numero,
          cliente,
          total,
          cantidadPrendas,
        }),
      ]).then((resultados) => {
        resultados.forEach(
          (resultado) => {
            if (
              resultado.status ===
              "rejected"
            ) {
              console.error(
                "📧 Error enviando email de pedido:",
                resultado.reason
                  ?.message ||
                  resultado.reason
              );
            }
          }
        );
      });

      return res
        .status(201)
        .json({
          ok: true,

          mensaje:
            "Pedido guardado correctamente.",

          pedido: {
            ...pedidoDb,

            comprobanteUrl:
              `/api/pedidos/${numero}/comprobante`,
          },
        });
    } catch (error) {
      if (
        client &&
        transaccionIniciada
      ) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      borrarArchivoSiExiste(
        req.file
      );

      if (
        error.code ===
        "23505"
      ) {
        return res
          .status(409)
          .json({
            error:
              "Ese número de pedido ya existe.",
          });
      }

      next(error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* =========================================================
   DESDE ACÁ:
   SOLO ADMIN AUTENTICADO
========================================================= */

router.use(
  requireAdmin
);

/* =========================================================
   GET /api/pedidos
========================================================= */

router.get(
  "/",

  async (
    _req,
    res,
    next
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            numero,
            estado,
            cliente,
            entrega,
            total,
            cantidad_prendas,
            metodo_pago,
            remitente_transferencia,
            comprobante_nombre_original,
            comprobante_archivo,
            created_at,
            updated_at
          FROM pedidos
          ORDER BY
            created_at DESC
          `
        );

      return res.json({
        ok: true,
        pedidos:
          result.rows,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   PATCH /api/pedidos/:numero/estado
========================================================= */

router.patch(
  "/:numero/estado",

  async (
    req,
    res,
    next
  ) => {
    try {
      const estadosPermitidos =
        [
          "Comprobante enviado",
          "Pago confirmado",
          "En producción",
          "Listo para entregar",
          "Enviado",
          "Entregado",
          "Cancelado",
        ];

      const estado =
        String(
          req.body?.estado ||
            ""
        ).trim();

      if (
        !estadosPermitidos.includes(
          estado
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "El estado seleccionado no es válido.",
          });
      }

      const result =
        await pool.query(
          `
          UPDATE pedidos
          SET
            estado = $1,
            updated_at =
              CURRENT_TIMESTAMP

          WHERE
            numero = $2

          RETURNING
            id,
            numero,
            estado,
            cliente,
            total,
            cantidad_prendas,
            updated_at
          `,
          [
            estado,
            req.params.numero,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res
          .status(404)
          .json({
            error:
              "Pedido no encontrado.",
          });
      }

      const pedidoActualizado =
        result.rows[0];

      /* =====================================================
         EMAIL CAMBIO DE ESTADO
      ===================================================== */

      enviarEmailCambioEstado({
        numero:
          pedidoActualizado.numero,

        estado:
          pedidoActualizado.estado,

        cliente:
          pedidoActualizado.cliente,

        total:
          pedidoActualizado.total,
      }).catch(
        (errorEmail) => {
          console.error(
            "📧 Error enviando cambio de estado:",
            errorEmail.message
          );
        }
      );

      return res.json({
        ok: true,
        pedido:
          pedidoActualizado,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   GET /api/pedidos/:numero/comprobante
========================================================= */

router.get(
  "/:numero/comprobante",

  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            comprobante_archivo,
            comprobante_nombre_original

          FROM pedidos

          WHERE
            numero = $1
          `,
          [
            req.params.numero,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res
          .status(404)
          .json({
            error:
              "Pedido no encontrado.",
          });
      }

      const pedido =
        result.rows[0];

      if (
        !pedido
          .comprobante_archivo
      ) {
        return res
          .status(404)
          .json({
            error:
              "Este pedido no tiene comprobante.",
          });
      }

      const nombreArchivo =
        path.basename(
          pedido
            .comprobante_archivo
        );

      const archivo =
        path.join(
          uploadsDir,
          nombreArchivo
        );

      if (
        !fs.existsSync(
          archivo
        )
      ) {
        return res
          .status(404)
          .json({
            error:
              "El comprobante figura en la base pero no existe el archivo.",
          });
      }

      return res.sendFile(
        archivo
      );
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   GET /api/pedidos/:numero
========================================================= */

router.get(
  "/:numero",

  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            p.*,

            COALESCE(
              json_agg(
                pi
                ORDER BY pi.id
              )
              FILTER (
                WHERE
                  pi.id IS NOT NULL
              ),
              '[]'::json
            ) AS items

          FROM pedidos p

          LEFT JOIN
            pedido_items pi

          ON
            pi.pedido_id =
            p.id

          WHERE
            p.numero = $1

          GROUP BY
            p.id
          `,
          [
            req.params.numero,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res
          .status(404)
          .json({
            error:
              "Pedido no encontrado.",
          });
      }

      const pedido =
        result.rows[0];

      pedido.comprobanteUrl =
        pedido.comprobante_archivo
          ? `/api/pedidos/${pedido.numero}/comprobante`
          : null;

      return res.json({
        ok: true,
        pedido,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   ERRORES MULTER
========================================================= */

router.use(
  (
    error,
    _req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            error:
              "El comprobante supera el máximo de 8 MB.",
          });
      }

      return res
        .status(400)
        .json({
          error:
            `Error al subir el comprobante: ${error.message}`,
        });
    }

    if (
      error?.message ===
      "El comprobante debe ser JPG, PNG, WEBP o PDF."
    ) {
      return res
        .status(400)
        .json({
          error:
            error.message,
        });
    }

    next(error);
  }
);

module.exports = router;