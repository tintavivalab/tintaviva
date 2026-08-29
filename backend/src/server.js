require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const pool = require("./db");
const pedidosRoutes = require("./routes/pedidos");
const adminAuthRoutes = require("./routes/adminAuth");

const app = express();
const PORT = process.env.PORT || 4000;

const jwtSecret =
  process.env.JWT_SECRET || "";

/* =========================================================
   VALIDACIÓN JWT SECRET
========================================================= */

if (
  jwtSecret.length < 32
) {
  console.error(
    "❌ JWT_SECRET debe tener al menos 32 caracteres."
  );

  process.exit(1);
}

/* =========================================================
   SEGURIDAD GENERAL
========================================================= */

app.disable(
  "x-powered-by"
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "same-site",
    },
  })
);

if (
  process.env.NODE_ENV ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}

/* =========================================================
   CORS
========================================================= */

const origenesPermitidos =
  (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  )
    .split(",")
    .map((url) =>
      url.trim()
    )
    .filter(Boolean);

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      /*
        Permite requests sin origin
        como Postman / navegador directo.
      */
      if (
        !origin ||
        origenesPermitidos.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Origen no autorizado por CORS."
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =========================================================
   JSON
========================================================= */

app.use(
  express.json({
    limit: "1mb",
  })
);

/* =========================================================
   RATE LIMIT LOGIN / REGISTRO
========================================================= */

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    message: {
      error:
        "Demasiados intentos. Esperá unos minutos antes de volver a intentar.",
    },
  });

/* =========================================================
   RATE LIMIT GENERAL API
========================================================= */

const apiLimiter =
  rateLimit({
    windowMs:
      60 * 1000,

    limit: 120,

    standardHeaders:
      "draft-7",

    legacyHeaders:
      false,

    message: {
      error:
        "Demasiadas solicitudes. Intentá nuevamente en unos instantes.",
    },
  });

app.use(
  "/api",
  apiLimiter
);

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  async (
    _req,
    res,
    next
  ) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      return res.json({
        status: "ok",
        service:
          "TintaViva API",
        database: "ok",
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   AUTH ADMIN
========================================================= */

app.use(
  "/api/admin/auth",
  authLimiter,
  adminAuthRoutes
);

/* =========================================================
   PEDIDOS
========================================================= */

app.use(
  "/api/pedidos",
  pedidosRoutes
);

/*
  IMPORTANTE:

  NO dejamos:

  app.use("/uploads", express.static(...))

  porque los comprobantes no deben ser públicos.

  Los comprobantes solamente se abren mediante:

  GET /api/pedidos/:numero/comprobante

  y esa ruta está protegida con JWT.
*/

/* =========================================================
   RUTA NO ENCONTRADA
========================================================= */

app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        error:
          "Ruta no encontrada.",
      });
  }
);

/* =========================================================
   MANEJO GLOBAL DE ERRORES
========================================================= */

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    console.error(
      "❌ Error backend:",
      error.message
    );

    if (
      error.message ===
      "Origen no autorizado por CORS."
    ) {
      return res
        .status(403)
        .json({
          error:
            "Origen no autorizado.",
        });
    }

    return res
      .status(500)
      .json({
        error:
          process.env.NODE_ENV ===
          "production"
            ? "Error interno del servidor."
            : error.message ||
              "Error interno del servidor.",
      });
  }
);

/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `TintaViva API ejecutándose en http://localhost:${PORT}`
    );

    console.log(
      "🔐 Seguridad admin activa."
    );
  }
);