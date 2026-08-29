const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function crearToken(admin) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET debe existir y tener al menos 32 caracteres."
    );
  }

  return jwt.sign(
    {
      sub: String(admin.id),
      email: admin.email,
      role: "admin",
    },
    secret,
    {
      expiresIn: "12h",
      issuer: "tintaviva-api",
      audience: "tintaviva-admin",
    }
  );
}

router.get("/registration-status", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS cantidad FROM admin_users"
    );

    res.json({
      ok: true,
      registrationAvailable:
        result.rows[0].cantidad === 0,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const nombre = String(
      req.body?.nombre || ""
    ).trim();

    const email = normalizarEmail(
      req.body?.email
    );

    const password = String(
      req.body?.password || ""
    );

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error:
          "Nombre, email y contraseña son obligatorios.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS cantidad FROM admin_users"
    );

    if (
      countResult.rows[0].cantidad > 0
    ) {
      return res.status(403).json({
        error:
          "El administrador inicial ya fue creado. El registro público está cerrado.",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO admin_users (
        nombre,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        nombre,
        email,
        activo,
        created_at
      `,
      [nombre, email, passwordHash]
    );

    return res.status(201).json({
      ok: true,
      mensaje:
        "Administrador creado correctamente.",
      admin: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error:
          "Ya existe una cuenta con ese email.",
      });
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = normalizarEmail(
      req.body?.email
    );

    const password = String(
      req.body?.password || ""
    );

    if (!email || !password) {
      return res.status(400).json({
        error:
          "Email y contraseña son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        email,
        password_hash,
        activo
      FROM admin_users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        error:
          "Email o contraseña incorrectos.",
      });
    }

    const admin = result.rows[0];

    if (!admin.activo) {
      return res.status(403).json({
        error:
          "La cuenta de administrador está desactivada.",
      });
    }

    const passwordCorrecta =
      await bcrypt.compare(
        password,
        admin.password_hash
      );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error:
          "Email o contraseña incorrectos.",
      });
    }

    await pool.query(
      `
      UPDATE admin_users
      SET last_login_at = NOW()
      WHERE id = $1
      `,
      [admin.id]
    );

    const token = crearToken(admin);

    return res.json({
      ok: true,
      mensaje:
        "Sesión iniciada correctamente.",
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/me",
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          nombre,
          email,
          activo,
          last_login_at
        FROM admin_users
        WHERE id = $1
        LIMIT 1
        `,
        [req.admin.id]
      );

      if (!result.rows.length) {
        return res.status(401).json({
          error:
            "La cuenta ya no existe.",
        });
      }

      const admin = result.rows[0];

      if (!admin.activo) {
        return res.status(403).json({
          error:
            "La cuenta está desactivada.",
        });
      }

      return res.json({
        ok: true,
        admin,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
