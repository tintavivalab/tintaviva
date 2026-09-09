const express = require("express");

const {
  MercadoPagoConfig,
  Preference,
} = require("mercadopago");

const router = express.Router();

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn(
    "⚠ MERCADOPAGO_ACCESS_TOKEN no está configurado."
  );
}

const client = new MercadoPagoConfig({
  accessToken:
    accessToken || "TOKEN_NO_CONFIGURADO",
});

const preference =
  new Preference(client);

/* =========================================================
   POST /api/mercadopago/preferencia
========================================================= */

router.post(
  "/preferencia",

  async (req, res, next) => {
    try {
      if (!accessToken) {
        return res
          .status(500)
          .json({
            error:
              "Mercado Pago no está configurado.",
          });
      }

      const {
        items,
        numeroPedido,
        cliente,
      } = req.body || {};

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "El carrito está vacío.",
          });
      }

      const itemsMercadoPago =
        items.map(
          (
            item,
            index
          ) => {
            const cantidad =
              Number(
                item.cantidad || 1
              );

            const precio =
              Number(
                item.precioUnitario ??
                  item.precio ??
                  0
              );

            if (
              !Number.isFinite(
                cantidad
              ) ||
              cantidad <= 0 ||
              !Number.isFinite(
                precio
              ) ||
              precio <= 0
            ) {
              throw new Error(
                `Datos inválidos en el producto ${
                  index + 1
                }.`
              );
            }

            return {
              id: String(
                item.productoId ??
                  item.id ??
                  index + 1
              ),

              title:
                item.nombre ||
                "Producto TintaViva",

              quantity:
                Math.trunc(
                  cantidad
                ),

              unit_price:
                precio,

              currency_id:
                "ARS",
            };
          }
        );

      const frontendUrl =
        (
          process.env
            .FRONTEND_PUBLIC_URL ||
          "https://tintaviva.ar"
        ).replace(
          /\/+$/,
          ""
        );

      const result =
        await preference.create({
          body: {
            items:
              itemsMercadoPago,

            external_reference:
              String(
                numeroPedido ||
                  `TV-${Date.now()}`
              ),

            payer:
              cliente?.email
                ? {
                    email:
                      String(
                        cliente.email
                      ).trim(),
                  }
                : undefined,

            back_urls: {
              success:
                `${frontendUrl}/?pago=success`,

              pending:
                `${frontendUrl}/?pago=pending`,

              failure:
                `${frontendUrl}/?pago=failure`,
            },

            auto_return:
              "approved",
          },
        });

      return res.json({
        ok: true,

        preferenceId:
          result.id,

        initPoint:
          result.init_point,

        sandboxInitPoint:
          result.sandbox_init_point,
      });
    } catch (error) {
      console.error(
        "Error creando preferencia Mercado Pago:",
        error
      );

      next(error);
    }
  }
);

module.exports = router;