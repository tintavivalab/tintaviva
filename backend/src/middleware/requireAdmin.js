const jwt = require("jsonwebtoken");
const pool = require("../db");

async function requireAdmin(req, res, next) {
  try {
    const authorization =
      req.headers.authorization || "";

    if (
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        error:
          "Acceso restringido. Iniciá sesión como administrador.",
      });
    }

    const token =
      authorization
        .slice(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        error:
          "Token de sesión faltante.",
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (
      !secret ||
      secret.length < 32
    ) {
      console.error(
        "JWT_SECRET ausente o demasiado corto."
      );

      return res.status(500).json({
        error:
          "La seguridad del servidor no está correctamente configurada.",
      });
    }

    const payload =
      jwt.verify(
        token,
        secret,
        {
          issuer:
            "tintaviva-api",

          audience:
            "tintaviva-admin",
        }
      );

    if (
      payload.role !==
      "admin"
    ) {
      return res.status(403).json({
        error:
          "No tenés permisos de administrador.",
      });
    }

    const adminId =
      Number(
        payload.sub
      );

    if (
      !Number.isInteger(
        adminId
      ) ||
      adminId <= 0
    ) {
      return res.status(401).json({
        error:
          "La sesión no es válida. Volvé a iniciar sesión.",
      });
    }

    /*
      Verificamos que el administrador
      todavía exista y siga activo.
    */

    const result =
      await pool.query(
        `
        SELECT
          id,
          nombre,
          email,
          activo

        FROM admin_users

        WHERE
          id = $1

        LIMIT 1
        `,
        [
          adminId,
        ]
      );

    if (
      !result.rows.length
    ) {
      return res.status(401).json({
        error:
          "La cuenta de administrador ya no existe.",
      });
    }

    const admin =
      result.rows[0];

    if (
      !admin.activo
    ) {
      return res.status(401).json({
        error:
          "La cuenta de administrador ya no está habilitada.",
      });
    }

    /*
      Dejamos los datos del admin
      disponibles para las rutas
      que vienen después.
    */

    req.admin = {
      id:
        admin.id,

      nombre:
        admin.nombre,

      email:
        admin.email,

      role:
        "admin",
    };

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          "Tu sesión venció. Volvé a iniciar sesión.",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        error:
          "La sesión no es válida. Volvé a iniciar sesión.",
      });
    }

    next(error);
  }
}

module.exports = requireAdmin;