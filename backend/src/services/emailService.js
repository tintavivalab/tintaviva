const RESEND_API_URL =
  "https://api.resend.com/emails";

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function precio(valor) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(valor || 0)
  );
}

function configuracionEmail() {
  return {
    apiKey:
      process.env.RESEND_API_KEY ||
      "",

    from:
      process.env.RESEND_FROM ||
      "TintaViva <onboarding@resend.dev>",

    adminEmail:
      process.env
        .ADMIN_NOTIFICATION_EMAIL ||
      "",

    frontendUrl:
      process.env
        .PUBLIC_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
  };
}

async function enviarConResend({
  to,
  subject,
  html,
  replyTo,
}) {
  const config =
    configuracionEmail();

  if (!config.apiKey) {
    console.warn(
      "📧 RESEND_API_KEY no configurada. Email omitido:",
      subject
    );

    return {
      ok: false,
      skipped: true,
      reason:
        "RESEND_API_KEY faltante",
    };
  }

  const destinatarios =
    Array.isArray(to)
      ? to.filter(Boolean)
      : [to].filter(Boolean);

  if (!destinatarios.length) {
    return {
      ok: false,
      skipped: true,
      reason:
        "Sin destinatario",
    };
  }

  const body = {
    from:
      config.from,

    to:
      destinatarios,

    subject,

    html,
  };

  if (replyTo) {
    body.reply_to =
      replyTo;
  }

  const respuesta =
    await fetch(
      RESEND_API_URL,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${config.apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            body
          ),
      }
    );

  const data =
    await respuesta
      .json()
      .catch(
        () => ({})
      );

  if (!respuesta.ok) {
    throw new Error(
      data?.message ||
        `Resend respondió ${respuesta.status}`
    );
  }

  return {
    ok: true,
    id:
      data.id,
  };
}

function layoutEmail({
  titulo,
  subtitulo,
  contenido,
  accionTexto,
  accionUrl,
}) {
  return `
  <!doctype html>

  <html lang="es">

    <body
      style="
        margin:0;
        background:#fff7e8;
        font-family:Arial,Helvetica,sans-serif;
        color:#151515;
      "
    >

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          background:#fff7e8;
          padding:28px 12px;
        "
      >

        <tr>

          <td align="center">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                max-width:620px;
                background:#ffffff;
                border:1px solid #151515;
              "
            >

              <tr>

                <td
                  style="
                    padding:22px 26px;
                    border-bottom:
                      1px solid #151515;
                  "
                >

                  <div
                    style="
                      font-size:11px;
                      font-weight:800;
                      letter-spacing:2px;
                    "
                  >
                    TINTAVIVA
                  </div>

                  <div
                    style="
                      margin-top:4px;
                      font-size:11px;
                      color:#666;
                    "
                  >
                    La tinta cobra vida
                  </div>

                </td>

              </tr>

              <tr>

                <td
                  style="
                    padding:30px 26px;
                  "
                >

                  <h1
                    style="
                      margin:0;
                      font-size:28px;
                      line-height:1.05;
                    "
                  >
                    ${titulo}
                  </h1>

                  ${
                    subtitulo
                      ? `
                        <p
                          style="
                            margin:10px 0 0;
                            color:#666;
                            font-size:14px;
                            line-height:1.5;
                          "
                        >
                          ${subtitulo}
                        </p>
                      `
                      : ""
                  }

                  <div
                    style="
                      margin-top:26px;
                      font-size:14px;
                      line-height:1.65;
                    "
                  >
                    ${contenido}
                  </div>

                  ${
                    accionTexto &&
                    accionUrl
                      ? `
                        <div
                          style="
                            margin-top:26px;
                          "
                        >

                          <a
                            href="${accionUrl}"

                            style="
                              display:inline-block;
                              background:#151515;
                              color:#fff;
                              text-decoration:none;
                              padding:13px 18px;
                              font-size:13px;
                              font-weight:700;
                            "
                          >
                            ${accionTexto}
                          </a>

                        </div>
                      `
                      : ""
                  }

                </td>

              </tr>

              <tr>

                <td
                  style="
                    padding:18px 26px;
                    border-top:
                      1px solid #e4e0d8;
                    color:#777;
                    font-size:11px;
                    line-height:1.5;
                  "
                >
                  Este mensaje fue generado automáticamente por TintaViva.
                </td>

              </tr>

            </table>

          </td>

        </tr>

      </table>

    </body>

  </html>
  `;
}

const MENSAJES_ESTADO = {
  "Comprobante enviado": {
    titulo:
      "Recibimos tu comprobante",

    texto:
      "Tu pedido fue registrado y vamos a verificar el pago.",
  },

  "Pago confirmado": {
    titulo:
      "Pago confirmado",

    texto:
      "Confirmamos tu transferencia. Tu pedido ya puede pasar a producción.",
  },

  "En producción": {
    titulo:
      "Tu pedido está en producción",

    texto:
      "Estamos preparando y personalizando tus prendas.",
  },

  "Listo para entregar": {
    titulo:
      "Tu pedido está listo",

    texto:
      "Terminamos la producción. Tu pedido ya está listo para el siguiente paso de entrega.",
  },

  Enviado: {
    titulo:
      "Tu pedido fue enviado",

    texto:
      "Tu pedido ya salió para entrega.",
  },

  Entregado: {
    titulo:
      "Pedido entregado",

    texto:
      "Marcamos tu pedido como entregado. Gracias por elegir TintaViva.",
  },

  Cancelado: {
    titulo:
      "Pedido cancelado",

    texto:
      "Tu pedido fue marcado como cancelado. Si necesitás ayuda, respondé este email.",
  },
};

async function enviarEmailPedidoRecibido({
  numero,
  cliente,
  total,
  cantidadPrendas,
  entrega,
}) {
  const email =
    cliente?.email;

  if (!email) {
    return {
      ok: false,
      skipped: true,
      reason:
        "Cliente sin email",
    };
  }

  return enviarConResend({
    to:
      email,

    subject:
      `TintaViva · Recibimos tu pedido ${numero}`,

    html:
      layoutEmail({
        titulo:
          "¡Recibimos tu pedido!",

        subtitulo:
          "Tu comprobante quedó registrado y vamos a verificar el pago.",

        contenido: `
          <p>
            Hola
            <strong>
              ${escaparHtml(
                cliente?.nombre ||
                  ""
              )}
            </strong>.
          </p>

          <p>
            Tu número de pedido es:
          </p>

          <p
            style="
              font-size:20px;
              font-weight:800;
            "
          >
            ${escaparHtml(
              numero
            )}
          </p>

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              margin-top:18px;
              border-collapse:collapse;
            "
          >

            <tr>

              <td
                style="
                  padding:9px 0;
                  border-bottom:
                    1px solid #eee;
                  color:#777;
                "
              >
                Prendas
              </td>

              <td
                align="right"
                style="
                  padding:9px 0;
                  border-bottom:
                    1px solid #eee;
                  font-weight:700;
                "
              >
                ${escaparHtml(
                  cantidadPrendas ||
                    0
                )}
              </td>

            </tr>

            <tr>

              <td
                style="
                  padding:9px 0;
                  border-bottom:
                    1px solid #eee;
                  color:#777;
                "
              >
                Entrega
              </td>

              <td
                align="right"
                style="
                  padding:9px 0;
                  border-bottom:
                    1px solid #eee;
                  font-weight:700;
                "
              >
                ${escaparHtml(
                  entrega ||
                    "—"
                )}
              </td>

            </tr>

            <tr>

              <td
                style="
                  padding:9px 0;
                  color:#777;
                "
              >
                Total
              </td>

              <td
                align="right"
                style="
                  padding:9px 0;
                  font-weight:800;
                "
              >
                ${precio(
                  total
                )}
              </td>

            </tr>

          </table>

          <p
            style="
              margin-top:20px;
              color:#666;
            "
          >
            Te vamos a avisar por email cada vez que cambie el estado del pedido.
          </p>
        `,
      }),

    replyTo:
      process.env
        .CONTACT_EMAIL ||
      undefined,
  });
}

async function enviarEmailCambioEstado({
  numero,
  estado,
  cliente,
  total,
}) {
  const email =
    cliente?.email;

  if (!email) {
    return {
      ok: false,
      skipped: true,
      reason:
        "Cliente sin email",
    };
  }

  const mensaje =
    MENSAJES_ESTADO[
      estado
    ] || {
      titulo:
        "Actualizamos tu pedido",

      texto:
        `El nuevo estado es: ${estado}.`,
    };

  return enviarConResend({
    to:
      email,

    subject:
      `TintaViva · ${mensaje.titulo} · ${numero}`,

    html:
      layoutEmail({
        titulo:
          mensaje.titulo,

        subtitulo:
          mensaje.texto,

        contenido: `
          <p>
            Hola
            <strong>
              ${escaparHtml(
                cliente?.nombre ||
                  ""
              )}
            </strong>.
          </p>

          <p>
            Pedido:
          </p>

          <p
            style="
              font-size:18px;
              font-weight:800;
            "
          >
            ${escaparHtml(
              numero
            )}
          </p>

          <div
            style="
              margin-top:18px;
              padding:14px;
              background:#fff7e8;
              border-left:
                4px solid #4169ff;
            "
          >

            <div
              style="
                font-size:10px;
                font-weight:800;
                letter-spacing:1px;
                color:#666;
              "
            >
              ESTADO ACTUAL
            </div>

            <div
              style="
                margin-top:5px;
                font-size:17px;
                font-weight:800;
              "
            >
              ${escaparHtml(
                estado
              )}
            </div>

          </div>

          <p
            style="
              margin-top:18px;
            "
          >
            Total del pedido:
            <strong>
              ${precio(
                total
              )}
            </strong>
          </p>
        `,
      }),

    replyTo:
      process.env
        .CONTACT_EMAIL ||
      undefined,
  });
}

async function enviarEmailNuevoPedidoAdmin({
  numero,
  cliente,
  total,
  cantidadPrendas,
}) {
  const {
    adminEmail,
    frontendUrl,
  } =
    configuracionEmail();

  if (!adminEmail) {
    return {
      ok: false,
      skipped: true,
      reason:
        "ADMIN_NOTIFICATION_EMAIL faltante",
    };
  }

  return enviarConResend({
    to:
      adminEmail,

    subject:
      `Nuevo pedido TintaViva · ${numero}`,

    html:
      layoutEmail({
        titulo:
          "Nuevo pedido recibido",

        subtitulo:
          "Hay un nuevo pedido esperando revisión del comprobante.",

        contenido: `
          <p>
            <strong>
              Pedido:
            </strong>
            ${escaparHtml(
              numero
            )}
          </p>

          <p>
            <strong>
              Cliente:
            </strong>
            ${escaparHtml(
              cliente?.nombre ||
                "—"
            )}
          </p>

          <p>
            <strong>
              Email:
            </strong>
            ${escaparHtml(
              cliente?.email ||
                "—"
            )}
          </p>

          <p>
            <strong>
              Prendas:
            </strong>
            ${escaparHtml(
              cantidadPrendas ||
                0
            )}
          </p>

          <p>
            <strong>
              Total:
            </strong>
            ${precio(
              total
            )}
          </p>
        `,

        accionTexto:
          "Abrir panel de administración",

        accionUrl:
          `${frontendUrl.replace(
            /\/$/,
            ""
          )}/admin`,
      }),
  });
}

module.exports = {
  enviarEmailPedidoRecibido,
  enviarEmailCambioEstado,
  enviarEmailNuevoPedidoAdmin,
};