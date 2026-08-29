import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const WHATSAPP_NUMBER = String(
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

const WHATSAPP_MESSAGE =
  "Hola, tengo una consulta sobre TintaViva.";


const LEGAL_EMAIL =
  import.meta.env.VITE_LEGAL_EMAIL || "";

const LEGAL_BUSINESS_NAME =
  import.meta.env.VITE_LEGAL_BUSINESS_NAME ||
  "TintaViva";

const LEGAL_CUIT =
  import.meta.env.VITE_LEGAL_CUIT ||
  "COMPLETAR CUIT";

const LEGAL_ADDRESS =
  import.meta.env.VITE_LEGAL_ADDRESS ||
  "COMPLETAR DOMICILIO";

const LEGAL_UPDATED =
  "29 de agosto de 2026";


const ESTADOS = [
  "Comprobante enviado",
  "Pago confirmado",
  "En producción",
  "Listo para entregar",
  "Enviado",
  "Entregado",
  "Cancelado",
];

const FLUJO_ESTADOS = [
  "Comprobante enviado",
  "Pago confirmado",
  "En producción",
  "Listo para entregar",
  "Enviado",
  "Entregado",
];

const ACCIONES_ESTADO = {
  "Comprobante enviado": {
    siguiente: "Pago confirmado",
    texto: "Confirmar pago",
    descripcion: "La transferencia ya fue verificada.",
  },
  "Pago confirmado": {
    siguiente: "En producción",
    texto: "Pasar a producción",
    descripcion: "El pedido puede comenzar a prepararse.",
  },
  "En producción": {
    siguiente: "Listo para entregar",
    texto: "Marcar como listo",
    descripcion: "Las prendas ya están terminadas.",
  },
  "Listo para entregar": {
    siguiente: "Enviado",
    texto: "Marcar como enviado",
    descripcion: "El pedido salió para entrega.",
  },
  "Enviado": {
    siguiente: "Entregado",
    texto: "Marcar como entregado",
    descripcion: "El cliente recibió el pedido.",
  },
};

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function formatearFecha(valor) {
  if (!valor) return "—";

  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(valor));
  } catch {
    return valor;
  }
}

function claseEstado(estado = "") {
  return `admin-status admin-status-${estado
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")}`;
}


function obtenerPersonalizacionItem(item) {
  return item?.personalizacion || {};
}

function obtenerImagenPrendaAdmin(item, lado) {
  const personalizacion = obtenerPersonalizacionItem(item);

  return (
    personalizacion?.imagenesProducto?.[lado] ||
    personalizacion?.imagenesProducto?.frente ||
    ""
  );
}

function obtenerDisenoAdmin(item, lado) {
  const personalizacion = obtenerPersonalizacionItem(item);
  return personalizacion?.disenos?.[lado] || {};
}

function obtenerCapasAdmin(item, lado) {
  const personalizacion = obtenerPersonalizacionItem(item);
  return personalizacion?.capas?.[lado] || {};
}

function VistaPrendaAdmin({ item, lado }) {
  const imagenPrenda = obtenerImagenPrendaAdmin(item, lado);
  const diseno = obtenerDisenoAdmin(item, lado);
  const capas = obtenerCapasAdmin(item, lado);

  const tieneImagen =
    Boolean(diseno?.imagen) &&
    capas?.imagen?.visible !== false;

  const texto = diseno?.texto;
  const tieneTexto =
    Boolean(texto?.contenido?.trim()) &&
    capas?.texto?.visible !== false;

  const tienePersonalizacion = tieneImagen || tieneTexto;

  return (
    <div className="admin-garment-view">
      <div className="admin-garment-label">
        <span>{lado === "frente" ? "FRENTE" : "ESPALDA"}</span>
        <small>
          {diseno?.areaImpresion ||
            (tienePersonalizacion
              ? "Personalizado"
              : "Sin diseño")}
        </small>
      </div>

      <div className="admin-garment-canvas">
        {imagenPrenda ? (
          <img
            src={imagenPrenda}
            alt={`${item.nombre} ${lado}`}
            className="admin-garment-base"
          />
        ) : (
          <div className="admin-garment-placeholder">
            Sin imagen de prenda
          </div>
        )}

        {tieneImagen && (
          <img
            src={diseno.imagen}
            alt={`Diseño ${lado}`}
            className="admin-garment-design"
            style={{
              left: `${diseno?.posicion?.x ?? 50}%`,
              top: `${diseno?.posicion?.y ?? 45}%`,
              width: `${Math.max(
                10,
                Math.min(70, Number(diseno?.tamano || 34))
              )}%`,
              transform: `translate(-50%, -50%) rotate(${
                diseno?.rotacion || 0
              }deg)`,
            }}
          />
        )}

        {tieneTexto && (
          <span
            className="admin-garment-text"
            style={{
              left: `${texto?.posicion?.x ?? 50}%`,
              top: `${texto?.posicion?.y ?? 52}%`,
              color: texto?.color || "#111111",
              fontFamily: texto?.fuente || "Arial",
              fontWeight: texto?.negrita ? 800 : 400,
              fontSize: `${Math.max(
                10,
                Math.min(28, Number(texto?.tamano || 32) * 0.55)
              )}px`,
              transform: `translate(-50%, -50%) rotate(${
                texto?.rotacion || 0
              }deg)`,
            }}
          >
            {texto.contenido}
          </span>
        )}

        {!tienePersonalizacion && (
          <span className="admin-no-design">
            Sin personalización en este lado
          </span>
        )}
      </div>
    </div>
  );
}


function AdminLogin() {
  const [credenciales, setCredenciales] = useState({
    email: "",
    password: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarCampoLogin = (event) => {
    const { name, value } = event.target;

    setCredenciales((actual) => ({
      ...actual,
      [name]: value,
    }));

    if (mensaje) setMensaje("");
  };

  const enviarLoginAdmin = async (event) => {
    event.preventDefault();

    if (!credenciales.email.trim() || !credenciales.password.trim()) {
      setMensaje("Completá email y contraseña.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await fetch(`${API_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credenciales.email.trim(),
          password: credenciales.password,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || "No se pudo iniciar sesión.");
      }

      localStorage.setItem(
        "tintaviva-admin-token",
        data.token
      );

      localStorage.setItem(
        "tintaviva-admin",
        JSON.stringify({
          id: data.admin.id,
          nombre: data.admin.nombre,
          email: data.admin.email,
          loginAt: new Date().toISOString(),
        })
      );

      window.location.href = "/admin";
    } catch (error) {
      setMensaje(error.message || "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <a href="/" className="admin-login-logo-link" aria-label="Volver a TintaViva">
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
            className="admin-login-logo"
          />
        </a>

        <span>ACCESO INTERNO</span>
      </div>

      <main className="admin-login-shell">
        <section className="admin-login-copy">
          <span className="admin-login-kicker">TINTAVIVA · ADMIN</span>

          <h1>
            Gestión simple.
            <br />
            Producción ordenada.
          </h1>

          <p>
            Accedé al panel para revisar pedidos, comprobantes,
            personalizaciones y estados de producción.
          </p>

          <div className="admin-login-features">
            <span>01 · Pedidos</span>
            <span>02 · Producción</span>
            <span>03 · Comprobantes</span>
          </div>
        </section>

        <section className="admin-login-card">
          <div className="admin-login-card-head">
            <small>PANEL INTERNO</small>
            <h2>Iniciar sesión</h2>
            <p>Ingresá con tu cuenta de administración.</p>
          </div>

          <form onSubmit={enviarLoginAdmin} className="admin-login-form">
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={credenciales.email}
                onChange={cambiarCampoLogin}
                placeholder="admin@tintaviva.ar"
                autoComplete="email"
              />
            </label>

            <label>
              <span>Contraseña</span>

              <div className="admin-password-field">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={credenciales.password}
                  onChange={cambiarCampoLogin}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword((actual) => !actual)
                  }
                >
                  {mostrarPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Entrar al panel →"}
            </button>

            {mensaje && (
              <div className="admin-login-message">
                {mensaje}
              </div>
            )}
          </form>

          <div className="admin-login-register">
            <span>¿Todavía no creaste el administrador?</span>
            <a href="/admin/register">Crear cuenta admin →</a>
          </div>
        </section>
      </main>

      <footer className="admin-login-footer">
        <span>© 2026 TintaViva</span>
        <a href="/">Volver a la tienda</a>
      </footer>
    </div>
  );
}

function AdminRegister() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    repetirPassword: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const cambiarCampoRegistro = (event) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    if (mensaje) setMensaje("");
  };

  const enviarRegistroAdmin = async (event) => {
    event.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.email.trim() ||
      !formulario.password ||
      !formulario.repetirPassword
    ) {
      setMensaje("Completá todos los campos.");
      return;
    }

    if (formulario.password.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formulario.password !== formulario.repetirPassword) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await fetch(`${API_URL}/api/admin/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          email: formulario.email.trim(),
          password: formulario.password,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || "No se pudo crear el administrador.");
      }

      setRegistroExitoso(true);
    } catch (error) {
      setMensaje(error.message || "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  if (registroExitoso) {
    return (
      <div className="admin-login-page">
        <main className="admin-register-success">
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
            className="admin-login-logo"
          />

          <span>CUENTA CREADA</span>
          <h1>Administrador registrado.</h1>
          <p>
            Ya podés iniciar sesión con el email y la contraseña que elegiste.
          </p>

          <a href="/admin/login">
            Ir a iniciar sesión →
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <a href="/" className="admin-login-logo-link">
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
            className="admin-login-logo"
          />
        </a>

        <span>REGISTRO INTERNO</span>
      </div>

      <main className="admin-login-shell admin-register-shell">
        <section className="admin-login-copy">
          <span className="admin-login-kicker">PRIMER ADMINISTRADOR</span>

          <h1>
            Creá tu acceso
            <br />
            a TintaViva.
          </h1>

          <p>
            Por seguridad, este registro permite crear solamente
            el primer administrador. Una vez creada la cuenta,
            el backend bloquea nuevos registros públicos.
          </p>
        </section>

        <section className="admin-login-card">
          <div className="admin-login-card-head">
            <small>NUEVA CUENTA</small>
            <h2>Registrarse</h2>
            <p>Los datos se guardan en PostgreSQL.</p>
          </div>

          <form onSubmit={enviarRegistroAdmin} className="admin-login-form">
            <label>
              <span>Nombre</span>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampoRegistro}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formulario.email}
                onChange={cambiarCampoRegistro}
                placeholder="admin@tintaviva.ar"
                autoComplete="email"
              />
            </label>

            <label>
              <span>Contraseña</span>
              <div className="admin-password-field">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={formulario.password}
                  onChange={cambiarCampoRegistro}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword((actual) => !actual)
                  }
                >
                  {mostrarPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            <label>
              <span>Repetir contraseña</span>
              <input
                type={mostrarPassword ? "text" : "password"}
                name="repetirPassword"
                value={formulario.repetirPassword}
                onChange={cambiarCampoRegistro}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Crear administrador →"}
            </button>

            {mensaje && (
              <div className="admin-login-message">
                {mensaje}
              </div>
            )}
          </form>

          <div className="admin-login-register">
            <span>¿Ya tenés una cuenta?</span>
            <a href="/admin/login">Iniciar sesión →</a>
          </div>
        </section>
      </main>

      <footer className="admin-login-footer">
        <span>© 2026 TintaViva</span>
        <a href="/admin/login">Volver al login</a>
      </footer>
    </div>
  );
}


function obtenerAdminToken() {
  return localStorage.getItem("tintaviva-admin-token") || "";
}

function headersAdmin(extra = {}) {
  const token = obtenerAdminToken();

  return {
    ...extra,
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}


async function fetchAdminSeguro(url, options = {}) {
  const respuesta = await fetch(url, {
    ...options,
    headers: headersAdmin(options.headers || {}),
  });

  if (respuesta.status === 401 || respuesta.status === 403) {
    localStorage.removeItem("tintaviva-admin-token");
    localStorage.removeItem("tintaviva-admin");

    if (
      !window.location.pathname.startsWith("/admin/login")
    ) {
      window.location.replace("/admin/login");
    }
  }

  return respuesta;
}

function cerrarSesionAdmin() {
  localStorage.removeItem("tintaviva-admin-token");
  localStorage.removeItem("tintaviva-admin");
  window.location.href = "/admin/login";
}

function AdminProtected() {
  const [estado, setEstado] = useState("validando");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const validarSesion = async () => {
      const token = obtenerAdminToken();

      if (!token) {
        window.location.replace("/admin/login");
        return;
      }

      try {
        const respuesta = await fetchAdminSeguro(
          `${API_URL}/api/admin/auth/me`
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            data.error || "La sesión no es válida."
          );
        }

        setAdmin(data.admin);
        setEstado("autorizado");
      } catch (error) {
        console.error(
          "TintaViva Admin: sesión inválida:",
          error
        );

        localStorage.removeItem("tintaviva-admin-token");
        localStorage.removeItem("tintaviva-admin");
        window.location.replace("/admin/login");
      }
    };

    validarSesion();
  }, []);

  if (estado !== "autorizado") {
    return (
      <div className="admin-auth-check">
        <img
          src="/logo-tintaviva.png"
          alt="TintaViva"
        />
        <span>Verificando sesión...</span>
      </div>
    );
  }

  return <Admin adminActual={admin} />;
}

function Admin({ adminActual }) {
  const [adminPerfil, setAdminPerfil] = useState(
    adminActual
  );
  const [mostrarPerfil, setMostrarPerfil] =
    useState(false);

  const [perfilForm, setPerfilForm] = useState({
    nombre: adminActual?.nombre || "",
    email: adminActual?.email || "",
    currentPassword: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [guardandoPerfil, setGuardandoPerfil] =
    useState(false);
  const [guardandoPassword, setGuardandoPassword] =
    useState(false);
  const [mensajePerfil, setMensajePerfil] =
    useState("");
  const [errorPerfil, setErrorPerfil] =
    useState("");

  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] =
    useState(false);

  const [actualizandoEstado, setActualizandoEstado] =
    useState(false);

  const [error, setError] = useState("");

  const cargarPedidos = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetchAdminSeguro(
        `${API_URL}/api/pedidos`
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            "No se pudieron cargar los pedidos."
        );
      }

      setPedidos(resultado.pedidos || []);
    } catch (err) {
      console.error(
        "TintaViva Admin: error cargando pedidos:",
        err
      );

      setError(
        err?.message ||
          "No se pudo conectar con el backend."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const coincideEstado =
        filtroEstado === "Todos" ||
        pedido.estado === filtroEstado;

      const cliente = pedido.cliente || {};

      const contenidoBusqueda = [
        pedido.numero,
        pedido.estado,
        cliente.nombre,
        cliente.apellido,
        cliente.email,
        cliente.telefono,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda =
        !texto || contenidoBusqueda.includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [pedidos, busqueda, filtroEstado]);

  const metricas = useMemo(() => {
    const totalPedidos = pedidos.length;

    const pendientes = pedidos.filter(
      (pedido) =>
        pedido.estado === "Comprobante enviado"
    ).length;

    const produccion = pedidos.filter(
      (pedido) => pedido.estado === "En producción"
    ).length;

    const facturacion = pedidos
      .filter((pedido) => pedido.estado !== "Cancelado")
      .reduce(
        (total, pedido) =>
          total + Number(pedido.total || 0),
        0
      );

    return {
      totalPedidos,
      pendientes,
      produccion,
      facturacion,
    };
  }, [pedidos]);

  const abrirPedido = async (numero) => {
    setCargandoDetalle(true);
    setError("");

    try {
      const respuesta = await fetchAdminSeguro(
        `${API_URL}/api/pedidos/${encodeURIComponent(
          numero
        )}`
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            "No se pudo abrir el pedido."
        );
      }

      setPedidoSeleccionado(resultado.pedido);
    } catch (err) {
      console.error(
        "TintaViva Admin: error abriendo pedido:",
        err
      );

      setError(
        err?.message ||
          "No se pudo cargar el detalle."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    if (!pedidoSeleccionado?.numero) return;

    setActualizandoEstado(true);
    setError("");

    try {
      const respuesta = await fetchAdminSeguro(
          `${API_URL}/api/pedidos/${encodeURIComponent(
            pedidoSeleccionado.numero
          )}/estado`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            "No se pudo actualizar el estado."
        );
      }

      setPedidoSeleccionado((actual) => ({
        ...actual,
        estado: resultado.pedido.estado,
        updated_at: resultado.pedido.updated_at,
      }));

      setPedidos((actual) =>
        actual.map((pedido) =>
          pedido.numero ===
          pedidoSeleccionado.numero
            ? {
                ...pedido,
                estado: resultado.pedido.estado,
                updated_at:
                  resultado.pedido.updated_at,
              }
            : pedido
        )
      );
    } catch (err) {
      console.error(
        "TintaViva Admin: error actualizando estado:",
        err
      );

      setError(
        err?.message ||
          "No se pudo actualizar el estado."
      );
    } finally {
      setActualizandoEstado(false);
    }
  };

  const cambiarEstadoRapido = async (nuevoEstado) => {
    if (
      nuevoEstado === "Cancelado" &&
      !window.confirm(
        "¿Seguro que querés cancelar este pedido?"
      )
    ) {
      return;
    }

    await cambiarEstado(nuevoEstado);
  };

  const imprimirFichaProduccion = () => {
    if (!pedidoSeleccionado) return;

    document.body.classList.add("admin-print-mode");

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove("admin-print-mode");
      }, 300);
    }, 50);
  };

  const verComprobante = async (numero) => {
    setError("");

    try {
      const respuesta = await fetchAdminSeguro(
        `${API_URL}/api/pedidos/${encodeURIComponent(
          numero
        )}/comprobante`
      );

      if (!respuesta.ok) {
        let mensaje = "No se pudo abrir el comprobante.";

        try {
          const data = await respuesta.json();
          mensaje = data.error || mensaje;
        } catch {}

        throw new Error(mensaje);
      }

      const archivo = await respuesta.blob();
      const url = URL.createObjectURL(archivo);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      setError(
        error.message ||
          "No se pudo abrir el comprobante."
      );
    }
  };

  const abrirPerfilAdmin = () => {
    setPerfilForm({
      nombre: adminPerfil?.nombre || "",
      email: adminPerfil?.email || "",
      currentPassword: "",
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMensajePerfil("");
    setErrorPerfil("");
    setMostrarPerfil(true);
  };

  const guardarPerfilAdmin = async (event) => {
    event.preventDefault();

    setGuardandoPerfil(true);
    setMensajePerfil("");
    setErrorPerfil("");

    try {
      const respuesta = await fetchAdminSeguro(
        `${API_URL}/api/admin/auth/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(perfilForm),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.error ||
            "No se pudo actualizar el perfil."
        );
      }

      if (data.token) {
        localStorage.setItem(
          "tintaviva-admin-token",
          data.token
        );
      }

      if (data.admin) {
        setAdminPerfil(data.admin);

        localStorage.setItem(
          "tintaviva-admin",
          JSON.stringify({
            id: data.admin.id,
            nombre: data.admin.nombre,
            email: data.admin.email,
          })
        );

        setPerfilForm((actual) => ({
          ...actual,
          nombre: data.admin.nombre,
          email: data.admin.email,
          currentPassword: "",
        }));
      }

      setMensajePerfil(
        data.mensaje ||
          "Perfil actualizado correctamente."
      );
    } catch (err) {
      setErrorPerfil(
        err.message ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarPasswordAdmin = async (event) => {
    event.preventDefault();

    setGuardandoPassword(true);
    setMensajePerfil("");
    setErrorPerfil("");

    try {
      const respuesta = await fetchAdminSeguro(
        `${API_URL}/api/admin/auth/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordForm),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.error ||
            "No se pudo cambiar la contraseña."
        );
      }

      if (data.token) {
        localStorage.setItem(
          "tintaviva-admin-token",
          data.token
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMensajePerfil(
        data.mensaje ||
          "Contraseña actualizada correctamente."
      );
    } catch (err) {
      setErrorPerfil(
        err.message ||
          "No se pudo cambiar la contraseña."
      );
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <a href="/" className="admin-brand">
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
          />
        </a>

        <div className="admin-topbar-title">
          <span>PANEL INTERNO</span>
          <strong>Administración</strong>
        </div>

        <div className="admin-session-actions">
          <div className="admin-session-user">
            <span>SESIÓN</span>
            <strong>
              {adminPerfil?.nombre || "Administrador"}
            </strong>
          </div>

          <button
            type="button"
            className="admin-profile-button"
            onClick={abrirPerfilAdmin}
          >
            Mi perfil
          </button>

          <a href="/" className="admin-store-link">
            Ver tienda ↗
          </a>

          <button
            type="button"
            className="admin-logout-button"
            onClick={cerrarSesionAdmin}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {mostrarPerfil && (
        <div
          className="admin-profile-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMostrarPerfil(false);
            }
          }}
        >
          <section
            className="admin-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-profile-title"
          >
            <div className="admin-profile-head">
              <div>
                <span>TINTAVIVA · CUENTA</span>
                <h2 id="admin-profile-title">
                  Mi perfil
                </h2>
                <p>
                  Actualizá tus datos y la seguridad de tu cuenta.
                </p>
              </div>

              <button
                type="button"
                className="admin-profile-close"
                onClick={() => setMostrarPerfil(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {(mensajePerfil || errorPerfil) && (
              <div
                className={`admin-profile-message ${
                  errorPerfil ? "is-error" : "is-success"
                }`}
              >
                {errorPerfil || mensajePerfil}
              </div>
            )}

            <div className="admin-profile-grid">
              <form
                className="admin-profile-section"
                onSubmit={guardarPerfilAdmin}
              >
                <div className="admin-profile-section-title">
                  <span>DATOS PERSONALES</span>
                  <strong>Perfil</strong>
                </div>

                <label>
                  Nombre
                  <input
                    type="text"
                    value={perfilForm.nombre}
                    onChange={(event) =>
                      setPerfilForm((actual) => ({
                        ...actual,
                        nombre: event.target.value,
                      }))
                    }
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={perfilForm.email}
                    onChange={(event) =>
                      setPerfilForm((actual) => ({
                        ...actual,
                        email: event.target.value,
                      }))
                    }
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  Contraseña actual
                  <input
                    type="password"
                    value={perfilForm.currentPassword}
                    onChange={(event) =>
                      setPerfilForm((actual) => ({
                        ...actual,
                        currentPassword: event.target.value,
                      }))
                    }
                    autoComplete="current-password"
                    placeholder="Necesaria para guardar"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="admin-profile-save"
                  disabled={guardandoPerfil}
                >
                  {guardandoPerfil
                    ? "Guardando..."
                    : "Guardar perfil"}
                </button>
              </form>

              <form
                className="admin-profile-section"
                onSubmit={cambiarPasswordAdmin}
              >
                <div className="admin-profile-section-title">
                  <span>SEGURIDAD</span>
                  <strong>Cambiar contraseña</strong>
                </div>

                <label>
                  Contraseña actual
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((actual) => ({
                        ...actual,
                        currentPassword: event.target.value,
                      }))
                    }
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label>
                  Nueva contraseña
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((actual) => ({
                        ...actual,
                        newPassword: event.target.value,
                      }))
                    }
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <small>Mínimo 8 caracteres.</small>
                </label>

                <label>
                  Repetir nueva contraseña
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((actual) => ({
                        ...actual,
                        confirmPassword: event.target.value,
                      }))
                    }
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="admin-profile-save"
                  disabled={guardandoPassword}
                >
                  {guardandoPassword
                    ? "Actualizando..."
                    : "Cambiar contraseña"}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      <main className="admin-main">
        <section className="admin-heading">
          <div>
            <span className="admin-kicker">
              TINTAVIVA · PEDIDOS
            </span>

            <h1>Panel de administración</h1>

            <p>
              Revisá comprobantes, pedidos y estados de
              producción desde un solo lugar.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={cargarPedidos}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </section>

        <section className="admin-metrics">
          <article>
            <small>PEDIDOS</small>
            <strong>{metricas.totalPedidos}</strong>
            <span>Total registrados</span>
          </article>

          <article>
            <small>POR VERIFICAR</small>
            <strong>{metricas.pendientes}</strong>
            <span>Comprobantes enviados</span>
          </article>

          <article>
            <small>EN PRODUCCIÓN</small>
            <strong>{metricas.produccion}</strong>
            <span>Pedidos activos</span>
          </article>

          <article>
            <small>VALOR DE PEDIDOS</small>
            <strong>
              {formatearPrecio(metricas.facturacion)}
            </strong>
            <span>Sin cancelados</span>
          </article>
        </section>

        <section className="admin-content-card">
          <div className="admin-toolbar">
            <div className="admin-search">
              <span>⌕</span>

              <input
                type="search"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                placeholder="Buscar pedido, cliente o email..."
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value)
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="admin-error">
              <strong>Algo salió mal</strong>
              <span>{error}</span>
            </div>
          )}

          {cargando ? (
            <div className="admin-empty">
              Cargando pedidos...
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="admin-empty">
              <strong>No hay pedidos para mostrar.</strong>
              <span>
                Cuando entren pedidos aparecerán acá.
              </span>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Prendas</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const cliente =
                      pedido.cliente || {};

                    return (
                      <tr key={pedido.id || pedido.numero}>
                        <td>
                          <strong>{pedido.numero}</strong>
                        </td>

                        <td>
                          <strong>
                            {cliente.nombre || "—"}{" "}
                            {cliente.apellido || ""}
                          </strong>
                          <small>
                            {cliente.email || "Sin email"}
                          </small>
                        </td>

                        <td>
                          {formatearFecha(
                            pedido.created_at
                          )}
                        </td>

                        <td>
                          {pedido.cantidad_prendas || 0}
                        </td>

                        <td>
                          <strong>
                            {formatearPrecio(pedido.total)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={claseEstado(
                              pedido.estado
                            )}
                          >
                            {pedido.estado}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              abrirPedido(pedido.numero)
                            }
                          >
                            Ver →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {(pedidoSeleccionado || cargandoDetalle) && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            !cargandoDetalle &&
            setPedidoSeleccionado(null)
          }
        >
          <aside
            className="admin-order-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {cargandoDetalle ? (
              <div className="admin-detail-loading">
                Cargando detalle...
              </div>
            ) : (
              <>
                <div className="admin-detail-head">
                  <div>
                    <span>PEDIDO</span>
                    <h2>
                      {pedidoSeleccionado.numero}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPedidoSeleccionado(null)
                    }
                    aria-label="Cerrar detalle"
                  >
                    ×
                  </button>
                </div>

                <div className="admin-detail-status">
                  <span
                    className={claseEstado(
                      pedidoSeleccionado.estado
                    )}
                  >
                    {pedidoSeleccionado.estado}
                  </span>

                  <small>
                    {formatearFecha(
                      pedidoSeleccionado.created_at
                    )}
                  </small>
                </div>

                <section className="admin-detail-section">
                  <div className="admin-section-title">
                    <span>01</span>
                    <strong>Cliente</strong>
                  </div>

                  <div className="admin-detail-grid">
                    <div>
                      <small>NOMBRE</small>
                      <strong>
                        {pedidoSeleccionado.cliente
                          ?.nombre || "—"}{" "}
                        {pedidoSeleccionado.cliente
                          ?.apellido || ""}
                      </strong>
                    </div>

                    <div>
                      <small>EMAIL</small>
                      <strong>
                        {pedidoSeleccionado.cliente
                          ?.email || "—"}
                      </strong>
                    </div>

                    <div>
                      <small>TELÉFONO</small>
                      <strong>
                        {pedidoSeleccionado.cliente
                          ?.telefono || "—"}
                      </strong>
                    </div>

                    <div>
                      <small>ENTREGA</small>
                      <strong>
                        {pedidoSeleccionado.entrega ===
                        "envio"
                          ? "Envío a domicilio"
                          : "Retiro"}
                      </strong>
                    </div>
                  </div>

                  {pedidoSeleccionado.entrega ===
                    "envio" && (
                    <div className="admin-address">
                      <small>DIRECCIÓN</small>

                      <strong>
                        {pedidoSeleccionado.cliente
                          ?.direccion || "—"}
                      </strong>

                      <span>
                        {pedidoSeleccionado.cliente
                          ?.localidad || ""}
                        {pedidoSeleccionado.cliente
                          ?.provincia
                          ? ` · ${pedidoSeleccionado.cliente.provincia}`
                          : ""}
                        {pedidoSeleccionado.cliente
                          ?.codigoPostal
                          ? ` · CP ${pedidoSeleccionado.cliente.codigoPostal}`
                          : ""}
                      </span>
                    </div>
                  )}
                </section>

                <section className="admin-detail-section">
                  <div className="admin-section-title">
                    <span>02</span>
                    <strong>Pago</strong>
                  </div>

                  <div className="admin-payment-card">
                    <div>
                      <small>IMPORTE</small>
                      <strong>
                        {formatearPrecio(
                          pedidoSeleccionado.total
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>TRANSFERENCIA DE</small>
                      <strong>
                        {pedidoSeleccionado.remitente_transferencia ||
                          "—"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        verComprobante(
                          pedidoSeleccionado.numero
                        )
                      }
                      disabled={
                        !pedidoSeleccionado.comprobante_archivo
                      }
                    >
                      Ver comprobante ↗
                    </button>

                    <button
                      type="button"
                      className="admin-print-button"
                      onClick={imprimirFichaProduccion}
                    >
                      Imprimir ficha
                    </button>
                  </div>
                </section>

                <section className="admin-detail-section">
                  <div className="admin-section-title">
                    <span>03</span>
                    <strong>Prendas</strong>
                  </div>

                  <div className="admin-order-items admin-order-items-visual">
                    {(pedidoSeleccionado.items || []).map(
                      (item) => (
                        <article
                          key={item.id}
                          className="admin-production-item"
                        >
                          <div className="admin-production-item-head">
                            <div>
                              <strong>{item.nombre}</strong>
                              <span>
                                {item.color || "—"} · Talle{" "}
                                {item.talle || "—"} · Cantidad{" "}
                                {item.cantidad}
                              </span>
                            </div>

                            <div className="admin-production-price">
                              <small>SUBTOTAL</small>
                              <strong>
                                {formatearPrecio(
                                  Number(
                                    item.precio_unitario || 0
                                  ) *
                                    Number(item.cantidad || 1)
                                )}
                              </strong>
                            </div>
                          </div>

                          <div className="admin-design-grid">
                            <VistaPrendaAdmin
                              item={item}
                              lado="frente"
                            />
                            <VistaPrendaAdmin
                              item={item}
                              lado="espalda"
                            />
                          </div>

                          <div className="admin-design-notes">
                            <div>
                              <small>PRODUCTO</small>
                              <strong>
                                ID {item.producto_id || "—"}
                              </strong>
                            </div>

                            <div>
                              <small>DISEÑO</small>
                              <strong>
                                {obtenerDisenoAdmin(item, "frente")
                                  ?.imagen ||
                                obtenerDisenoAdmin(item, "frente")
                                  ?.texto?.contenido ||
                                obtenerDisenoAdmin(item, "espalda")
                                  ?.imagen ||
                                obtenerDisenoAdmin(item, "espalda")
                                  ?.texto?.contenido
                                  ? "Personalizado"
                                  : "Sin personalización"}
                              </strong>
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </section>

                <section className="admin-production-sheet">
                  <div className="admin-production-sheet-header">
                    <div>
                      <span className="admin-production-brand">TINTAVIVA</span>
                      <h1>Ficha de producción</h1>
                      <p>La tinta cobra vida</p>
                    </div>

                    <div className="admin-production-order">
                      <small>PEDIDO</small>
                      <strong>{pedidoSeleccionado.numero}</strong>
                      <span>
                        {new Date(
                          pedidoSeleccionado.created_at
                        ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <div className="admin-production-meta">
                    <div>
                      <small>CLIENTE</small>
                      <strong>
                        {pedidoSeleccionado.cliente?.nombre || "—"}
                      </strong>
                      <span>
                        {pedidoSeleccionado.cliente?.email || "—"}
                      </span>
                      <span>
                        {pedidoSeleccionado.cliente?.telefono || "—"}
                      </span>
                    </div>

                    <div>
                      <small>ENTREGA</small>
                      <strong>
                        {pedidoSeleccionado.entrega || "—"}
                      </strong>
                      <span>
                        {pedidoSeleccionado.cliente?.direccion || "—"}
                      </span>
                    </div>

                    <div>
                      <small>ESTADO</small>
                      <strong>{pedidoSeleccionado.estado}</strong>
                      <span>
                        {pedidoSeleccionado.cantidad_prendas || 0} prenda
                        {Number(
                          pedidoSeleccionado.cantidad_prendas || 0
                        ) === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <div>
                      <small>TOTAL</small>
                      <strong>
                        {formatearPrecio(pedidoSeleccionado.total)}
                      </strong>
                      <span>
                        {pedidoSeleccionado.metodo_pago ||
                          "Transferencia bancaria"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-production-sheet-items">
                    {(pedidoSeleccionado.items || []).map(
                      (item, itemIndex) => (
                        <article
                          key={`print-${item.id}`}
                          className="admin-production-sheet-item"
                        >
                          <div className="admin-production-sheet-item-title">
                            <div>
                              <span>
                                PRENDA {String(itemIndex + 1).padStart(2, "0")}
                              </span>
                              <h2>{item.nombre}</h2>
                            </div>

                            <div className="admin-production-sheet-attributes">
                              <span>
                                <small>COLOR</small>
                                <strong>{item.color || "—"}</strong>
                              </span>
                              <span>
                                <small>TALLE</small>
                                <strong>{item.talle || "—"}</strong>
                              </span>
                              <span>
                                <small>CANT.</small>
                                <strong>{item.cantidad || 1}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="admin-production-sheet-views">
                            <VistaPrendaAdmin
                              item={item}
                              lado="frente"
                            />
                            <VistaPrendaAdmin
                              item={item}
                              lado="espalda"
                            />
                          </div>

                          <div className="admin-production-sheet-checklist">
                            <label>
                              <span className="admin-print-checkbox" />
                              Diseño verificado
                            </label>
                            <label>
                              <span className="admin-print-checkbox" />
                              Prenda preparada
                            </label>
                            <label>
                              <span className="admin-print-checkbox" />
                              Sublimación / estampado realizado
                            </label>
                            <label>
                              <span className="admin-print-checkbox" />
                              Control de calidad
                            </label>
                          </div>

                          <div className="admin-production-sheet-notes">
                            <strong>Notas de producción</strong>
                            <div />
                            <div />
                          </div>
                        </article>
                      )
                    )}
                  </div>

                  <div className="admin-production-sheet-footer">
                    <div>
                      <small>CONTROL FINAL</small>
                      <span>
                        <i /> Diseño
                      </span>
                      <span>
                        <i /> Talle
                      </span>
                      <span>
                        <i /> Color
                      </span>
                      <span>
                        <i /> Cantidad
                      </span>
                    </div>

                    <div className="admin-production-signature">
                      <span />
                      <small>Responsable de producción</small>
                    </div>
                  </div>
                </section>

                <section className="admin-detail-section admin-state-section">
                  <div className="admin-section-title">
                    <span>04</span>
                    <strong>Estado del pedido</strong>
                  </div>

                  {pedidoSeleccionado.estado === "Cancelado" ? (
                    <div className="admin-cancelled-state">
                      <span>×</span>
                      <div>
                        <strong>Pedido cancelado</strong>
                        <small>
                          Este pedido quedó fuera del flujo de producción.
                        </small>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-state-progress">
                        {FLUJO_ESTADOS.map((estado, index) => {
                          const indiceActual =
                            FLUJO_ESTADOS.indexOf(
                              pedidoSeleccionado.estado
                            );

                          const completado =
                            indiceActual >= index;

                          const actual =
                            pedidoSeleccionado.estado === estado;

                          return (
                            <div
                              key={estado}
                              className={`admin-state-step ${
                                completado ? "completed" : ""
                              } ${actual ? "current" : ""}`}
                            >
                              <span className="admin-state-dot">
                                {completado ? "✓" : index + 1}
                              </span>

                              <div>
                                <strong>{estado}</strong>
                                {actual && <small>Estado actual</small>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {ACCIONES_ESTADO[
                        pedidoSeleccionado.estado
                      ] && (
                        <div className="admin-next-action-card">
                          <div>
                            <small>SIGUIENTE PASO</small>
                            <strong>
                              {
                                ACCIONES_ESTADO[
                                  pedidoSeleccionado.estado
                                ].texto
                              }
                            </strong>
                            <span>
                              {
                                ACCIONES_ESTADO[
                                  pedidoSeleccionado.estado
                                ].descripcion
                              }
                            </span>
                          </div>

                          <button
                            type="button"
                            className="admin-next-state-button"
                            disabled={actualizandoEstado}
                            onClick={() =>
                              cambiarEstadoRapido(
                                ACCIONES_ESTADO[
                                  pedidoSeleccionado.estado
                                ].siguiente
                              )
                            }
                          >
                            {actualizandoEstado
                              ? "Guardando..."
                              : `${ACCIONES_ESTADO[
                                  pedidoSeleccionado.estado
                                ].texto} →`}
                          </button>
                        </div>
                      )}

                      {pedidoSeleccionado.estado === "Entregado" && (
                        <div className="admin-completed-state">
                          <span>✓</span>
                          <div>
                            <strong>Pedido completado</strong>
                            <small>
                              El pedido fue marcado como entregado.
                            </small>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="admin-state-manual">
                    <label>
                      <span>Cambiar estado manualmente</span>
                      <select
                        value={pedidoSeleccionado.estado}
                        onChange={(event) =>
                          cambiarEstadoRapido(event.target.value)
                        }
                        disabled={actualizandoEstado}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </label>

                    {pedidoSeleccionado.estado !== "Cancelado" &&
                      pedidoSeleccionado.estado !== "Entregado" && (
                        <button
                          type="button"
                          className="admin-cancel-order-button"
                          disabled={actualizandoEstado}
                          onClick={() =>
                            cambiarEstadoRapido("Cancelado")
                          }
                        >
                          Cancelar pedido
                        </button>
                      )}
                  </div>

                  {actualizandoEstado && (
                    <small className="admin-state-saving">
                      Guardando nuevo estado en PostgreSQL...
                    </small>
                  )}
                </section>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}



function LegalLayout({
  eyebrow,
  title,
  intro,
  children,
}) {
  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <a
          href="/"
          className="legal-brand"
          aria-label="Volver a TintaViva"
        >
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
          />
        </a>

        <a
          href="/"
          className="legal-back"
        >
          ← Volver a la tienda
        </a>
      </header>

      <main className="legal-shell">
        <div className="legal-heading">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <small>
            Última actualización: {LEGAL_UPDATED}
          </small>
        </div>

        <article className="legal-card">
          {children}
        </article>

        <div className="legal-contact-box">
          <strong>¿Necesitás contactarnos?</strong>
          <p>
            Podés hacerlo desde el botón de WhatsApp de la tienda
            o por nuestros canales de contacto informados al momento
            de la compra.
          </p>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <div>
        <img
          src="/logo-tintaviva.png"
          alt="TintaViva"
          className="legal-footer-logo"
        />
        <p>Diseñá. Vestilo. Hacelo tuyo.</p>
      </div>

      <nav aria-label="Información legal">
        <a href="/terminos">
          Términos y condiciones
        </a>
        <a href="/cambios-devoluciones">
          Cambios y devoluciones
        </a>
        <a href="/privacidad">
          Privacidad
        </a>
        <a href="/envios">
          Envíos
        </a>
        <a
          href="/arrepentimiento"
          className="legal-footer-regret"
        >
          BOTÓN DE ARREPENTIMIENTO
        </a>
      </nav>

      <span>© 2026 TintaViva</span>
    </footer>
  );
}

function TerminosPage() {
  return (
    <LegalLayout
      eyebrow="INFORMACIÓN LEGAL"
      title="Términos y condiciones"
      intro="Condiciones generales aplicables al uso de TintaViva y a las compras realizadas a través de la tienda."
    >
      <section>
        <h2>1. Identificación del proveedor</h2>
        <p>
          La tienda opera bajo el nombre comercial{" "}
          <strong>{LEGAL_BUSINESS_NAME}</strong>.
        </p>
        <ul>
          <li>
            CUIT: <strong>{LEGAL_CUIT}</strong>
          </li>
          <li>
            Domicilio: <strong>{LEGAL_ADDRESS}</strong>
          </li>
        </ul>
        <p className="legal-warning">
          Antes de publicar la tienda, reemplazá estos datos por
          los datos fiscales y de contacto reales del proveedor.
        </p>
      </section>

      <section>
        <h2>2. Productos</h2>
        <p>
          TintaViva comercializa prendas estándar y prendas que
          pueden personalizarse según las opciones elegidas por
          el cliente, incluyendo diseños, imágenes, textos,
          colores, talles, ubicación y otras características
          disponibles en el personalizador.
        </p>
        <p>
          Las imágenes de producto son ilustrativas. Pueden existir
          pequeñas variaciones de color entre la pantalla y el
          producto físico debido a dispositivos, telas, impresión
          y procesos de producción.
        </p>
      </section>

      <section>
        <h2>3. Personalización y responsabilidad del cliente</h2>
        <p>
          Antes de confirmar el pedido, el cliente debe revisar
          cuidadosamente textos, ortografía, imágenes, orientación,
          tamaño, color, talle y ubicación de cada personalización.
        </p>
        <p>
          El cliente declara contar con autorización suficiente
          para utilizar las imágenes, marcas, textos o diseños que
          cargue. TintaViva podrá rechazar contenidos cuya
          reproducción pueda resultar ilícita o vulnerar derechos
          de terceros.
        </p>
      </section>

      <section>
        <h2>4. Precio y pago</h2>
        <p>
          El precio informado al confirmar la compra será el
          aplicable al pedido, salvo error manifiesto que sea
          comunicado antes de iniciar la producción. Los costos
          adicionales de entrega, cuando correspondan, deben ser
          informados antes de completar la operación.
        </p>
        <p>
          Actualmente la tienda permite registrar pagos mediante
          transferencia bancaria y comprobante. El envío del
          comprobante no equivale por sí solo a la acreditación:
          el pago se considera confirmado cuando TintaViva lo
          verifica.
        </p>
      </section>

      <section>
        <h2>5. Confirmación y producción</h2>
        <p>
          El pedido se considera recibido cuando TintaViva confirma
          su registro. La producción de una prenda personalizada
          podrá comenzar una vez confirmado el pago.
        </p>
      </section>

      <section>
        <h2>6. Entrega</h2>
        <p>
          Las modalidades, plazos estimados y eventuales costos de
          entrega se informan en la tienda o durante el proceso de
          compra. Los plazos pueden variar según producción,
          ubicación y servicio logístico.
        </p>
      </section>

      <section>
        <h2>7. Cambios, devoluciones y arrepentimiento</h2>
        <p>
          Las compras a distancia se encuentran sujetas a los
          derechos previstos por la normativa argentina de defensa
          del consumidor. Para productos no personalizados, el
          consumidor puede ejercer el derecho de revocación dentro
          del plazo legal aplicable.
        </p>
        <p>
          El Código Civil y Comercial contempla una excepción para
          productos confeccionados conforme a especificaciones del
          consumidor o claramente personalizados, salvo pacto en
          contrario. Esto no elimina los derechos que correspondan
          por defectos, falta de conformidad o incumplimiento.
        </p>
        <p>
          Consultá nuestra sección de{" "}
          <a href="/cambios-devoluciones">
            Cambios y devoluciones
          </a>.
        </p>
      </section>

      <section>
        <h2>8. Atención al cliente</h2>
        <p>
          Las consultas vinculadas con pedidos pueden realizarse
          mediante los canales de atención publicados en la tienda.
          Para ejercer el derecho de arrepentimiento, cuando
          corresponda, está disponible un acceso específico,
          visible y sin requerir registración.
        </p>
      </section>

      <section>
        <h2>9. Legislación aplicable</h2>
        <p>
          Estas condiciones se interpretan conforme a la normativa
          vigente de la República Argentina, incluyendo las normas
          de defensa del consumidor que resulten aplicables.
        </p>
      </section>
    </LegalLayout>
  );
}

function CambiosPage() {
  return (
    <LegalLayout
      eyebrow="POSTVENTA"
      title="Cambios y devoluciones"
      intro="Qué hacer si necesitás solicitar un cambio, informar un problema o ejercer un derecho de devolución."
    >
      <section>
        <h2>Productos sin personalización</h2>
        <p>
          Cuando resulte aplicable el derecho de revocación de una
          compra a distancia, el consumidor podrá solicitarlo
          dentro del plazo legal correspondiente y sin penalidad,
          conforme a la normativa vigente.
        </p>
      </section>

      <section>
        <h2>Productos personalizados</h2>
        <p>
          Las prendas confeccionadas de acuerdo con especificaciones
          suministradas por el cliente o claramente personalizadas
          pueden encontrarse alcanzadas por la excepción al derecho
          de revocación prevista para este tipo de productos, salvo
          pacto en contrario.
        </p>
        <p>
          Por eso es importante revisar el diseño, talle, color,
          orientación, texto e imágenes antes de confirmar el
          pedido.
        </p>
      </section>

      <section>
        <h2>Producto con falla o pedido incorrecto</h2>
        <p>
          La personalización no impide reclamar cuando el producto
          presenta una falla, no coincide con lo contratado o
          existe un incumplimiento imputable al proveedor.
        </p>
        <p>
          En esos casos, contactanos indicando el número de pedido,
          una descripción del inconveniente y, cuando sea útil,
          fotografías que permitan evaluar el caso.
        </p>
      </section>

      <section>
        <h2>Talles</h2>
        <p>
          En prendas personalizadas, recomendamos verificar la tabla
          de medidas antes de comprar. La posibilidad de cambio por
          elección incorrecta de talle dependerá de si la prenda fue
          personalizada y de las circunstancias del caso, sin
          afectar los derechos legalmente irrenunciables del
          consumidor.
        </p>
      </section>

      <section>
        <h2>Cómo iniciar una solicitud</h2>
        <p>
          Podés contactarnos por WhatsApp o utilizar el{" "}
          <a href="/arrepentimiento">
            Botón de Arrepentimiento
          </a>{" "}
          cuando corresponda.
        </p>
      </section>
    </LegalLayout>
  );
}

function PrivacidadPage() {
  return (
    <LegalLayout
      eyebrow="DATOS PERSONALES"
      title="Política de privacidad"
      intro="Cómo utilizamos los datos necesarios para procesar pedidos, atender consultas y operar TintaViva."
    >
      <section>
        <h2>1. Datos que podemos recibir</h2>
        <p>
          Al realizar una compra o consulta podemos recibir datos
          como nombre, email, teléfono, domicilio o datos de
          entrega, información del pedido y comprobantes de pago.
        </p>
      </section>

      <section>
        <h2>2. Para qué los utilizamos</h2>
        <ul>
          <li>Procesar y gestionar pedidos.</li>
          <li>Verificar pagos.</li>
          <li>Coordinar producción y entrega.</li>
          <li>Enviar notificaciones sobre el estado del pedido.</li>
          <li>Responder consultas y reclamos.</li>
          <li>Cumplir obligaciones legales y administrativas.</li>
        </ul>
      </section>

      <section>
        <h2>3. Datos de pago</h2>
        <p>
          Los comprobantes enviados por el cliente se utilizan para
          verificar la transferencia asociada al pedido. TintaViva
          no solicita claves bancarias, contraseñas ni códigos de
          autenticación.
        </p>
      </section>

      <section>
        <h2>4. Conservación y seguridad</h2>
        <p>
          Aplicamos medidas razonables para limitar el acceso a los
          datos de pedidos y comprobantes. La información se
          conserva durante el tiempo necesario para gestionar la
          relación comercial y cumplir obligaciones aplicables.
        </p>
      </section>

      <section>
        <h2>5. Proveedores tecnológicos</h2>
        <p>
          Para operar la tienda pueden intervenir proveedores de
          infraestructura, alojamiento, base de datos, correo
          transaccional y almacenamiento. Estos servicios reciben
          únicamente la información necesaria para cumplir su
          función.
        </p>
      </section>

      <section>
        <h2>6. Derechos sobre tus datos</h2>
        <p>
          Podés solicitar acceso, actualización, rectificación o
          eliminación de tus datos cuando corresponda conforme a
          la legislación aplicable, utilizando los canales de
          contacto publicados por TintaViva.
        </p>
      </section>
    </LegalLayout>
  );
}

function EnviosPage() {
  return (
    <LegalLayout
      eyebrow="ENTREGAS"
      title="Política de envíos y retiros"
      intro="Información general sobre preparación, despacho, recepción y seguimiento de los pedidos."
    >
      <section>
        <h2>Preparación del pedido</h2>
        <p>
          Las prendas personalizadas requieren un proceso de
          producción previo al despacho. El plazo de preparación
          comienza luego de la confirmación del pago y puede variar
          según el producto, cantidad y complejidad de la
          personalización.
        </p>
      </section>

      <section>
        <h2>Plazos</h2>
        <p>
          El plazo informado es estimado. Una vez entregado el
          pedido al operador logístico, los tiempos de transporte
          dependen también del destino y del servicio seleccionado.
        </p>
      </section>

      <section>
        <h2>Dirección de entrega</h2>
        <p>
          El cliente debe verificar que la dirección, localidad,
          código postal, teléfono y demás datos de recepción sean
          correctos antes de confirmar la compra.
        </p>
      </section>

      <section>
        <h2>Costos</h2>
        <p>
          Cuando exista un costo de envío, debe informarse durante
          el proceso de compra antes de la confirmación del pedido.
        </p>
      </section>

      <section>
        <h2>Recepción</h2>
        <p>
          Recomendamos revisar el paquete al recibirlo y comunicar
          cualquier inconveniente lo antes posible, indicando el
          número de pedido.
        </p>
      </section>
    </LegalLayout>
  );
}

function ArrepentimientoPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    numero: "",
    detalle: "",
  });

  const enviarSolicitud = (event) => {
    event.preventDefault();

    if (!LEGAL_EMAIL) {
      alert(
        "Antes de publicar, configurá VITE_LEGAL_EMAIL en el .env del frontend."
      );
      return;
    }

    const asunto =
      `Solicitud de arrepentimiento - ${form.numero || "Pedido TintaViva"}`;

    const cuerpo = [
      "SOLICITUD DE ARREPENTIMIENTO",
      "",
      `Nombre: ${form.nombre}`,
      `Email: ${form.email}`,
      `Pedido: ${form.numero || "No informado"}`,
      "",
      "Detalle:",
      form.detalle || "Solicito ejercer el derecho de arrepentimiento cuando corresponda.",
    ].join("\n");

    window.location.href =
      `mailto:${LEGAL_EMAIL}` +
      `?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(cuerpo)}`;
  };

  return (
    <LegalLayout
      eyebrow="DEFENSA DEL CONSUMIDOR"
      title="Botón de arrepentimiento"
      intro="Acceso directo para solicitar la revocación de una compra a distancia cuando legalmente corresponda."
    >
      <section>
        <h2>Solicitud</h2>
        <p>
          No necesitás iniciar sesión para utilizar este acceso.
          Completá los datos necesarios para identificar la compra.
        </p>

        <div className="legal-notice">
          En compras a distancia existe un derecho de revocación
          dentro del plazo legal. La legislación contempla
          excepciones, entre ellas determinados productos
          confeccionados conforme a especificaciones del consumidor
          o claramente personalizados. Si existe una falla,
          incumplimiento o producto distinto de lo contratado,
          podés igualmente efectuar el reclamo correspondiente.
        </div>

        <form
          className="regret-form"
          onSubmit={enviarSolicitud}
        >
          <label>
            Nombre y apellido
            <input
              type="text"
              value={form.nombre}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  nombre: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Email utilizado en la compra
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  email: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Número de pedido
            <input
              type="text"
              value={form.numero}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  numero: event.target.value,
                }))
              }
              placeholder="Ej.: TV-2026-..."
            />
          </label>

          <label>
            Comentario
            <textarea
              value={form.detalle}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  detalle: event.target.value,
                }))
              }
              rows={5}
              placeholder="Podés agregar información para identificar tu compra."
            />
          </label>

          <button type="submit">
            Enviar solicitud
          </button>
        </form>

        {!LEGAL_EMAIL && (
          <p className="legal-warning">
            Configuración pendiente: agregá VITE_LEGAL_EMAIL al
            .env del frontend antes de publicar.
          </p>
        )}
      </section>
    </LegalLayout>
  );
}

function LegalFloatingButton() {
  return (
    <a
      href="/arrepentimiento"
      className="legal-floating-regret"
    >
      BOTÓN DE ARREPENTIMIENTO
    </a>
  );
}

function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) {
    return null;
  }

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      className="whatsapp-float"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp"
      title="Consultar por WhatsApp"
    >
      <span
        className="whatsapp-float-icon"
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M16.05 3C9.02 3 3.3 8.66 3.3 15.62c0 2.23.59 4.41 1.7 6.33L3 29l7.25-1.9a12.8 12.8 0 0 0 5.79 1.46h.01c7.02 0 12.75-5.66 12.75-12.62C28.8 8.97 23.08 3 16.05 3Zm0 23.42h-.01a10.61 10.61 0 0 1-5.42-1.49l-.39-.23-4.3 1.13 1.15-4.16-.25-.43a10.36 10.36 0 0 1-1.6-5.62c0-5.79 4.85-10.5 10.82-10.5 5.96 0 10.82 4.71 10.82 10.5 0 5.8-4.86 10.8-10.82 10.8Zm5.94-7.84c-.33-.16-1.94-.94-2.24-1.05-.3-.1-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.19.21-.38.24-.71.08-.33-.16-1.38-.5-2.63-1.6a9.64 9.64 0 0 1-1.82-2.24c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.16-.19.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.74-1.75-1.01-2.4-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.15 1.1-1.15 2.69s1.18 3.13 1.34 3.35c.16.21 2.32 3.48 5.62 4.88.79.34 1.4.54 1.88.69.79.24 1.5.21 2.07.13.63-.09 1.94-.78 2.21-1.53.27-.75.27-1.39.19-1.53-.08-.13-.3-.21-.63-.37Z"
          />
        </svg>
      </span>

      <span className="whatsapp-float-text">
        <strong>¿Necesitás ayuda?</strong>
        <small>Consultanos por WhatsApp</small>
      </span>
    </a>
  );
}

function App() {
  const pathname = window.location.pathname;

  if (pathname === "/terminos") {
    return <TerminosPage />;
  }

  if (pathname === "/privacidad") {
    return <PrivacidadPage />;
  }

  if (pathname === "/cambios-devoluciones") {
    return <CambiosPage />;
  }

  if (pathname === "/envios") {
    return <EnviosPage />;
  }

  if (pathname === "/arrepentimiento") {
    return <ArrepentimientoPage />;
  }

  if (window.location.pathname.startsWith("/admin/register")) {
    return <AdminRegister />;
  }

  if (window.location.pathname.startsWith("/admin/login")) {
    return <AdminLogin />;
  }

  if (window.location.pathname.startsWith("/admin")) {
    return <AdminProtected />;
  }

  const productos = [
    {
      id: 1,
      nombre: "Remera Clásica",
      categoria: "Remeras",
      descripcion: "Algodón premium · Corte clásico · Personalizable",
      detalle:
        "Remera clásica de algodón suave, ideal para estampados personalizados y uso diario.",
      precio: 15990,

      imagenes: {
        Blanco: {
          frente: "/productos/remera-clasica/blanco.png",
          espalda: "/productos/remera-clasica/blanco-espalda.png",
        },
        Negro: {
          frente: "/productos/remera-clasica/negro.png",
          espalda: "/productos/remera-clasica/negro-espalda.png",
        },
        Gris: {
          frente: "/productos/remera-clasica/gris.png",
          espalda: "/productos/remera-clasica/gris-espalda.png",
        },
      },

      colores: ["Blanco", "Negro", "Gris"],
      talles: ["S", "M", "L", "XL", "XXL"],
      personalizacion: {
        frente: {
          tamanoMin: 15,
          tamanoInicial: 30,
          tamanoMax: 48,
          centro: { x: 50, y: 42 },
          area: { xMin: 34, xMax: 66, yMin: 27, yMax: 60 },
          guia: { width: 32, height: 33, top: 43 },
          etiqueta: "Pecho frontal",
        },
        espalda: {
          tamanoMin: 15,
          tamanoInicial: 34,
          tamanoMax: 55,
          centro: { x: 50, y: 44 },
          area: { xMin: 32, xMax: 68, yMin: 26, yMax: 65 },
          guia: { width: 36, height: 39, top: 45.5 },
          etiqueta: "Espalda",
        },
      },
    },

    {
      id: 2,
      nombre: "Remera Oversize",
      categoria: "Remeras",
      descripcion: "Corte urbano · Oversize · Personalizable",
      detalle:
        "Remera oversize de calce amplio, pensada para diseños grandes y una estética urbana.",
      precio: 18990,

      imagenes: {
        Blanco: {
          frente: "/productos/remera-oversize/blanco.png",
          espalda: "/productos/remera-oversize/blanco-espalda.png",
        },
        Negro: {
          frente: "/productos/remera-oversize/negro.png",
          espalda: "/productos/remera-oversize/negro-espalda.png",
        },
        Gris: {
          frente: "/productos/remera-oversize/gris.png",
          espalda: "/productos/remera-oversize/gris-espalda.png",
        },
        Beige: {
          frente: "/productos/remera-oversize/beige.png",
          espalda: "/productos/remera-oversize/beige-espalda.png",
        },
      },

      colores: ["Blanco", "Negro", "Gris", "Beige"],
      talles: ["S", "M", "L", "XL"],
      personalizacion: {
        frente: {
          tamanoMin: 16,
          tamanoInicial: 36,
          tamanoMax: 62,
          centro: { x: 50, y: 43 },
          area: { xMin: 28, xMax: 72, yMin: 25, yMax: 63 },
          guia: { width: 44, height: 38, top: 44 },
          etiqueta: "Frente amplio",
        },
        espalda: {
          tamanoMin: 16,
          tamanoInicial: 40,
          tamanoMax: 66,
          centro: { x: 50, y: 45 },
          area: { xMin: 25, xMax: 75, yMin: 24, yMax: 68 },
          guia: { width: 50, height: 44, top: 46 },
          etiqueta: "Espalda amplia",
        },
      },
    },

    {
      id: 3,
      nombre: "Buzo Canguro",
      categoria: "Buzos",
      descripcion: "Con capucha · Bolsillo frontal · Personalizable",
      detalle:
        "Buzo canguro cómodo y abrigado, con capucha y amplio espacio frontal para personalizar.",
      precio: 32990,

      imagenes: {
        Blanco: {
          frente: "/productos/buzo-canguro/blanco.png",
          espalda: "/productos/buzo-canguro/blanco-espalda.png",
        },
        Negro: {
          frente: "/productos/buzo-canguro/negro.png",
          espalda: "/productos/buzo-canguro/negro-espalda.png",
        },
        Gris: {
          frente: "/productos/buzo-canguro/gris.png",
          espalda: "/productos/buzo-canguro/gris-espalda.png",
        },
        Azul: {
          frente: "/productos/buzo-canguro/azul.png",
          espalda: "/productos/buzo-canguro/azul-espalda.png",
        },
      },

      colores: ["Blanco", "Negro", "Gris", "Azul"],
      talles: ["S", "M", "L", "XL", "XXL"],
      personalizacion: {
        frente: {
          tamanoMin: 14,
          tamanoInicial: 28,
          tamanoMax: 44,
          centro: { x: 50, y: 35 },
          area: { xMin: 35, xMax: 65, yMin: 24, yMax: 47 },
          guia: { width: 30, height: 23, top: 35.5 },
          etiqueta: "Pecho · sobre el bolsillo",
        },
        espalda: {
          tamanoMin: 15,
          tamanoInicial: 36,
          tamanoMax: 55,
          centro: { x: 50, y: 47 },
          area: { xMin: 30, xMax: 70, yMin: 29, yMax: 68 },
          guia: { width: 40, height: 39, top: 48 },
          etiqueta: "Espalda · debajo de la capucha",
        },
      },
    },

    {
      id: 4,
      nombre: "Buzo Crewneck",
      categoria: "Buzos",
      descripcion: "Cuello redondo · Minimalista · Personalizable",
      detalle:
        "Buzo de cuello redondo con terminaciones cómodas, ideal para estampados centrales.",
      precio: 28990,

      imagenes: {
        Blanco: {
          frente: "/productos/buzo-crewneck/blanco.png",
          espalda: "/productos/buzo-crewneck/blanco-espalda.png",
        },
        Negro: {
          frente: "/productos/buzo-crewneck/negro.png",
          espalda: "/productos/buzo-crewneck/negro-espalda.png",
        },
        Gris: {
          frente: "/productos/buzo-crewneck/gris.png",
          espalda: "/productos/buzo-crewneck/gris-espalda.png",
        },
        Beige: {
          frente: "/productos/buzo-crewneck/beige.png",
          espalda: "/productos/buzo-crewneck/beige-espalda.png",
        },
      },

      colores: ["Blanco", "Negro", "Gris", "Beige"],
      talles: ["S", "M", "L", "XL"],
      personalizacion: {
        frente: {
          tamanoMin: 15,
          tamanoInicial: 34,
          tamanoMax: 56,
          centro: { x: 50, y: 41 },
          area: { xMin: 31, xMax: 69, yMin: 25, yMax: 60 },
          guia: { width: 38, height: 35, top: 42.5 },
          etiqueta: "Pecho frontal",
        },
        espalda: {
          tamanoMin: 15,
          tamanoInicial: 38,
          tamanoMax: 60,
          centro: { x: 50, y: 44 },
          area: { xMin: 28, xMax: 72, yMin: 25, yMax: 66 },
          guia: { width: 44, height: 41, top: 45.5 },
          etiqueta: "Espalda",
        },
      },
    },
  ];

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [talleSeleccionado, setTalleSeleccionado] = useState("");

  const [modoPersonalizar, setModoPersonalizar] = useState(false);
  const [ladoSeleccionado, setLadoSeleccionado] = useState("frente");
  const [personalizaciones, setPersonalizaciones] = useState({
    frente: {
      imagen: null,
      posicion: { x: 50, y: 42 },
      tamano: 34,
      texto: { contenido: "", posicion: { x: 50, y: 52 }, tamano: 32, rotacion: 0, color: "#111111", fuente: "Arial", negrita: false },
    },
    espalda: {
      imagen: null,
      posicion: { x: 50, y: 44 },
      tamano: 38,
      texto: { contenido: "", posicion: { x: 50, y: 54 }, tamano: 32, rotacion: 0, color: "#111111", fuente: "Arial", negrita: false },
    },
  });
  const [arrastrando, setArrastrando] = useState(false);
  const [herramientaActiva, setHerramientaActiva] = useState("diseno");

  const crearEstadoCapas = () => ({
    frente: {
      activa: "imagen",
      orden: ["imagen", "texto"],
      imagen: { visible: true, bloqueada: false, nombre: "Diseño" },
      texto: { visible: true, bloqueada: false, nombre: "Texto" },
    },
    espalda: {
      activa: "imagen",
      orden: ["imagen", "texto"],
      imagen: { visible: true, bloqueada: false, nombre: "Diseño" },
      texto: { visible: true, bloqueada: false, nombre: "Texto" },
    },
  });

  const [capas, setCapas] = useState(crearEstadoCapas);

  const normalizarCapasGuardadas = (capasGuardadas) => {
    const base = crearEstadoCapas();

    if (!capasGuardadas) return base;

    return {
      frente: {
        ...base.frente,
        ...capasGuardadas.frente,
        imagen: { ...base.frente.imagen, ...capasGuardadas.frente?.imagen },
        texto: { ...base.frente.texto, ...capasGuardadas.frente?.texto },
        orden: Array.isArray(capasGuardadas.frente?.orden)
          ? capasGuardadas.frente.orden
          : base.frente.orden,
      },
      espalda: {
        ...base.espalda,
        ...capasGuardadas.espalda,
        imagen: { ...base.espalda.imagen, ...capasGuardadas.espalda?.imagen },
        texto: { ...base.espalda.texto, ...capasGuardadas.espalda?.texto },
        orden: Array.isArray(capasGuardadas.espalda?.orden)
          ? capasGuardadas.espalda.orden
          : base.espalda.orden,
      },
    };
  };

  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [editandoCartId, setEditandoCartId] = useState(null);
  const [modoCheckout, setModoCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [checkoutListo, setCheckoutListo] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [modoTransferencia, setModoTransferencia] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(false);
  const [mostrarResumenFinal, setMostrarResumenFinal] = useState(false);
  const [copiado, setCopiado] = useState("");
  const [transferenciaDatos, setTransferenciaDatos] = useState({
    nombreRemitente: "",
    comprobanteNombre: "",
    comprobanteArchivo: null,
    enviado: false,
  });

  const datosBancarios = {
    banco: "Banco Santander Río",
    titular: "Anabel Gladys Trimarco",
    alias: "Yo.amo.a.River",
    cbu: "0720079388000036816972",
    cuit: "23209936704",
  };
  const [checkoutDatos, setCheckoutDatos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    entrega: "envio",
    direccion: "",
    localidad: "",
    provincia: "Buenos Aires",
    codigoPostal: "",
    referencias: "",
  });

  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem("tintaviva-carrito");
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("tintaviva-carrito", JSON.stringify(carrito));
    } catch (error) {
      console.warn(
        "TintaViva: no se pudo guardar el carrito completo en localStorage.",
        error
      );

      /*
       * Las imágenes subidas se guardan como Data URL y pueden superar
       * rápidamente el límite de localStorage del navegador.
       * No lanzamos el error para evitar que React deje la pantalla en blanco.
       * El carrito sigue funcionando durante la sesión actual.
       */
    }
  }, [carrito]);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(precio);

  const cantidadCarrito = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalCarrito = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  /* ================================= */
  /* PRECIO SEGÚN LADOS PERSONALIZADOS */
  /* ================================= */

  const RECARGO_DOBLE_ESTAMPA = 0.2;

  const ladoTieneDiseno = (lado) => {
    const personalizacion = personalizaciones?.[lado];
    const capasLado = capas?.[lado];

    const tieneImagen =
      Boolean(personalizacion?.imagen) &&
      capasLado?.imagen?.visible !== false;

    const tieneTexto =
      Boolean(personalizacion?.texto?.contenido?.trim()) &&
      capasLado?.texto?.visible !== false;

    return tieneImagen || tieneTexto;
  };

  const tieneDisenoFrente = ladoTieneDiseno("frente");
  const tieneDisenoEspalda = ladoTieneDiseno("espalda");
  const tieneDobleEstampa = tieneDisenoFrente && tieneDisenoEspalda;

  const calcularPrecioPersonalizado = (precioBase) => {
    const base = Number(precioBase || 0);

    if (!tieneDobleEstampa) {
      return base;
    }

    // Se redondea hacia arriba a decenas para garantizar como mínimo +20%.
    return Math.ceil((base * (1 + RECARGO_DOBLE_ESTAMPA)) / 10) * 10;
  };

  const precioPersonalizadoActual = productoSeleccionado
    ? calcularPrecioPersonalizado(productoSeleccionado.precio)
    : 0;

  const modelosCarrito = carrito.length;

  const colorClase = (color) =>
    `color-${color.toLowerCase().replaceAll(" ", "-")}`;

  const obtenerImagenProducto = (
    producto,
    color = null,
    lado = "frente"
  ) => {
    if (!producto) return "";

    const colorFinal =
      color ||
      colorSeleccionado ||
      producto.colores?.[0];

    const variante = producto.imagenes?.[colorFinal];

    if (typeof variante === "string") return variante;

    return (
      variante?.[lado] ||
      variante?.frente ||
      Object.values(producto.imagenes || {})[0]?.frente ||
      ""
    );
  };

  const obtenerConfigPersonalizacion = (
    producto = productoSeleccionado,
    lado = ladoSeleccionado
  ) =>
    producto?.personalizacion?.[lado] || {
      tamanoMin: 15,
      tamanoInicial: 34,
      tamanoMax: 55,
      centro: { x: 50, y: lado === "espalda" ? 44 : 42 },
      area: { xMin: 30, xMax: 70, yMin: 25, yMax: 65 },
      guia: { width: 40, height: 40, top: 45 },
      etiqueta: lado === "espalda" ? "Espalda" : "Área frontal",
    };

  const crearPersonalizacionesProducto = (producto) => {
    const frente = obtenerConfigPersonalizacion(producto, "frente");
    const espalda = obtenerConfigPersonalizacion(producto, "espalda");

    return {
      frente: {
        imagen: null,
        posicion: { ...frente.centro },
        tamano: frente.tamanoInicial,
        texto: { contenido: "", posicion: { x: frente.centro.x, y: Math.min(frente.area.yMax, frente.centro.y + 10) }, tamano: 32, rotacion: 0, color: "#111111", fuente: "Arial", negrita: false },
      },
      espalda: {
        imagen: null,
        posicion: { ...espalda.centro },
        tamano: espalda.tamanoInicial,
        texto: { contenido: "", posicion: { x: espalda.centro.x, y: Math.min(espalda.area.yMax, espalda.centro.y + 10) }, tamano: 32, rotacion: 0, color: "#111111", fuente: "Arial", negrita: false },
      },
    };
  };

  const personalizacionActual =
    personalizaciones[ladoSeleccionado] || personalizaciones.frente;

  const actualizarPersonalizacionActual = (cambios) => {
    setPersonalizaciones((actual) => ({
      ...actual,
      [ladoSeleccionado]: {
        ...actual[ladoSeleccionado],
        ...cambios,
      },
    }));
  };

  const actualizarTextoActual = (cambios) => {
    setPersonalizaciones((actual) => ({
      ...actual,
      [ladoSeleccionado]: {
        ...actual[ladoSeleccionado],
        texto: {
          ...actual[ladoSeleccionado].texto,
          ...cambios,
        },
      },
    }));
  };

  const ajustarPosicionAlArea = (
    x,
    y,
    producto = productoSeleccionado,
    lado = ladoSeleccionado
  ) => {
    const { area } = obtenerConfigPersonalizacion(producto, lado);

    return {
      x: Math.max(area.xMin, Math.min(area.xMax, x)),
      y: Math.max(area.yMin, Math.min(area.yMax, y)),
    };
  };

  const restablecerPersonalizacion = (
    producto = productoSeleccionado,
    lado = ladoSeleccionado
  ) => {
    const config = obtenerConfigPersonalizacion(producto, lado);

    setPersonalizaciones((actual) => ({
      ...actual,
      [lado]: {
        ...actual[lado],
        posicion: { ...config.centro },
        tamano: config.tamanoInicial,
      },
    }));
  };

  const capasActuales = capas[ladoSeleccionado];
  const capaActiva = capasActuales?.activa || "imagen";

  const capaExiste = (tipo) =>
    tipo === "imagen"
      ? Boolean(personalizacionActual.imagen)
      : Boolean(personalizacionActual.texto?.contenido.trim());

  const obtenerZCapa = (tipo) => {
    const indice = capasActuales?.orden?.indexOf(tipo) ?? 0;
    return 10 + indice;
  };

  const seleccionarCapa = (tipo) => {
    if (!capaExiste(tipo)) return;

    setCapas((actual) => ({
      ...actual,
      [ladoSeleccionado]: {
        ...actual[ladoSeleccionado],
        activa: tipo,
      },
    }));
  };

  const actualizarOpcionesCapa = (tipo, cambios) => {
    setCapas((actual) => ({
      ...actual,
      [ladoSeleccionado]: {
        ...actual[ladoSeleccionado],
        [tipo]: {
          ...actual[ladoSeleccionado][tipo],
          ...cambios,
        },
      },
    }));
  };

  const renombrarCapa = (tipo) => {
    const nombreActual = capasActuales?.[tipo]?.nombre || (tipo === "imagen" ? "Diseño" : "Texto");
    const nuevoNombre = window.prompt("Nombre de la capa", nombreActual);

    if (nuevoNombre === null) return;

    const limpio = nuevoNombre.trim().slice(0, 24);
    if (!limpio) return;

    actualizarOpcionesCapa(tipo, { nombre: limpio });
  };

  const alternarVisibilidadCapa = (tipo) => {
    const visible = capasActuales?.[tipo]?.visible !== false;
    actualizarOpcionesCapa(tipo, { visible: !visible });
  };

  const alternarBloqueoCapa = (tipo) => {
    const bloqueada = Boolean(capasActuales?.[tipo]?.bloqueada);
    actualizarOpcionesCapa(tipo, { bloqueada: !bloqueada });
  };

  const moverCapa = (tipo, direccion) => {
    setCapas((actual) => {
      const estadoLado = actual[ladoSeleccionado];
      const orden = [...estadoLado.orden];
      const indice = orden.indexOf(tipo);

      if (indice === -1) return actual;

      const nuevoIndice =
        direccion === "arriba"
          ? Math.min(orden.length - 1, indice + 1)
          : Math.max(0, indice - 1);

      if (nuevoIndice === indice) return actual;

      [orden[indice], orden[nuevoIndice]] = [orden[nuevoIndice], orden[indice]];

      return {
        ...actual,
        [ladoSeleccionado]: {
          ...estadoLado,
          activa: tipo,
          orden,
        },
      };
    });
  };

  const eliminarCapa = (tipo) => {
    if (tipo === "imagen") {
      actualizarPersonalizacionActual({ imagen: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      actualizarTextoActual({ contenido: "" });
    }

    actualizarOpcionesCapa(tipo, { visible: true, bloqueada: false });
  };

  const cambiarLado = (lado) => {
    setArrastrando(false);
    setLadoSeleccionado(lado);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const volverInicio = () => {
    setModoCheckout(false);
    setEditandoCartId(null);
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
    setCapas(crearEstadoCapas());
    setLadoSeleccionado("frente");
    setPersonalizaciones({
      frente: { imagen: null, posicion: { x: 50, y: 42 }, tamano: 34 },
      espalda: { imagen: null, posicion: { x: 50, y: 44 }, tamano: 38 },
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const abrirProducto = (producto) => {
    setModoCheckout(false);
    setEditandoCartId(null);
    setProductoSeleccionado(producto);
    setColorSeleccionado(producto.colores[0]);
    setTalleSeleccionado("");

    setModoPersonalizar(false);
    setCapas(crearEstadoCapas());
    setLadoSeleccionado("frente");
    setPersonalizaciones({
      frente: { imagen: null, posicion: { x: 50, y: 42 }, tamano: 34 },
      espalda: { imagen: null, posicion: { x: 50, y: 44 }, tamano: 38 },
    });

    setLadoSeleccionado("frente");
    setPersonalizaciones(crearPersonalizacionesProducto(producto));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cerrarProducto = () => {
    setModoCheckout(false);
    setEditandoCartId(null);
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
    setCapas(crearEstadoCapas());
    setLadoSeleccionado("frente");
    setPersonalizaciones({
      frente: { imagen: null, posicion: { x: 50, y: 42 }, tamano: 34 },
      espalda: { imagen: null, posicion: { x: 50, y: 44 }, tamano: 38 },
    });

    setTimeout(() => {
      document
        .getElementById("productos")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const iniciarPersonalizador = () => {
    if (!talleSeleccionado) return;

    setModoPersonalizar(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cargarImagen = (event) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      alert("Seleccioná una imagen PNG, JPG o WEBP.");
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const config = obtenerConfigPersonalizacion();

      actualizarPersonalizacionActual({
        imagen: lector.result,
        posicion: { ...config.centro },
        tamano: config.tamanoInicial,
      });

      setCapas((actual) => ({
        ...actual,
        [ladoSeleccionado]: {
          ...actual[ladoSeleccionado],
          activa: "imagen",
          imagen: { ...actual[ladoSeleccionado].imagen, visible: true, bloqueada: false },
        },
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    lector.readAsDataURL(archivo);
  };

  const eliminarDiseno = () => {
    actualizarPersonalizacionActual({ imagen: null });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const calcularPosicion = (clientX, clientY, tipo = arrastrando || "imagen") => {
    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const posicionAjustada = ajustarPosicionAlArea(x, y);

    if (tipo === "texto") {
      actualizarTextoActual({ posicion: posicionAjustada });
    } else {
      actualizarPersonalizacionActual({ posicion: posicionAjustada });
    }
  };

  const iniciarArrastre = (event, tipo = "imagen") => {
    if (tipo === "imagen" && !personalizacionActual.imagen) return;
    if (tipo === "texto" && !personalizacionActual.texto?.contenido.trim()) return;
    if (capasActuales?.[tipo]?.bloqueada) return;

    event.preventDefault();
    seleccionarCapa(tipo);
    setArrastrando(tipo);
  };

  const moverMouse = (event) => {
    if (!arrastrando) return;
    calcularPosicion(event.clientX, event.clientY, arrastrando);
  };

  const detenerArrastre = () => {
    setArrastrando(false);
  };

  const moverTouch = (event, tipo = arrastrando || "imagen") => {
    const touch = event.touches[0];
    if (!touch) return;
    calcularPosicion(touch.clientX, touch.clientY, tipo);
  };

  const editarItemCarrito = (item) => {
    const producto = productos.find((p) => p.id === item.productoId);

    if (!producto) return;

    setProductoSeleccionado(producto);
    setColorSeleccionado(item.color || producto.colores[0]);
    setTalleSeleccionado(item.talle || "");
    setPersonalizaciones({
      frente: {
        ...crearPersonalizacionesProducto(producto).frente,
        ...(item.disenos?.frente || {}),
        texto: {
          ...crearPersonalizacionesProducto(producto).frente.texto,
          ...(item.disenos?.frente?.texto || {}),
        },
      },
      espalda: {
        ...crearPersonalizacionesProducto(producto).espalda,
        ...(item.disenos?.espalda || {}),
        texto: {
          ...crearPersonalizacionesProducto(producto).espalda.texto,
          ...(item.disenos?.espalda?.texto || {}),
        },
      },
    });
    setCapas(normalizarCapasGuardadas(item.capas));
    setLadoSeleccionado("frente");
    setHerramientaActiva("diseno");
    setModoPersonalizar(true);
    setEditandoCartId(item.cartId);
    setCarritoAbierto(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelarEdicionCarrito = () => {
    setEditandoCartId(null);
    setModoPersonalizar(false);
    setCarritoAbierto(true);
  };

  const normalizarParaComparar = (valor) => {
    if (Array.isArray(valor)) {
      return valor.map(normalizarParaComparar);
    }

    if (valor && typeof valor === "object") {
      return Object.keys(valor)
        .sort()
        .reduce((resultado, clave) => {
          resultado[clave] = normalizarParaComparar(valor[clave]);
          return resultado;
        }, {});
    }

    return valor;
  };

  const firmaItemCarrito = (item) => {
    try {
      return JSON.stringify(
        normalizarParaComparar({
          productoId: item.productoId,
          color: item.color,
          talle: item.talle,
          disenos: item.disenos,
          capas: item.capas,
        })
      );
    } catch (error) {
      console.warn("TintaViva: no se pudo comparar el diseño.", error);
      return `${item.productoId}-${item.color}-${item.talle}-${item.cartId || ""}`;
    }
  };

  const sonItemsIguales = (a, b) =>
    firmaItemCarrito(a) === firmaItemCarrito(b);

  const duplicarItemCarrito = (item) => {
    const duplicado = {
      ...JSON.parse(JSON.stringify(item)),
      cartId: `${item.productoId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      cantidad: 1,
    };

    setCarrito((actual) => {
      const igual = actual.find((existente) =>
        sonItemsIguales(existente, duplicado)
      );

      if (igual) {
        return actual.map((existente) =>
          existente.cartId === igual.cartId
            ? {
                ...existente,
                cantidad: existente.cantidad + 1,
              }
            : existente
        );
      }

      return [...actual, duplicado];
    });
  };

  const agregarAlCarrito = () => {
    const tieneDiseno = tieneDisenoFrente || tieneDisenoEspalda;

    if (
      !productoSeleccionado ||
      !colorSeleccionado ||
      !talleSeleccionado ||
      !tieneDiseno
    ) {
      return;
    }

    const nuevoItem = {
      cartId: `${productoSeleccionado.id}-${Date.now()}`,
      productoId: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      imagenesProducto: {
        frente: obtenerImagenProducto(
          productoSeleccionado,
          colorSeleccionado,
          "frente"
        ),
        espalda: obtenerImagenProducto(
          productoSeleccionado,
          colorSeleccionado,
          "espalda"
        ),
      },
      precio: precioPersonalizadoActual,
      precioBase: productoSeleccionado.precio,
      dobleEstampa: tieneDobleEstampa,
      recargoDobleEstampa: tieneDobleEstampa
        ? RECARGO_DOBLE_ESTAMPA
        : 0,
      color: colorSeleccionado,
      talle: talleSeleccionado,
      disenos: {
        frente: {
          ...personalizaciones.frente,
          areaImpresion: obtenerConfigPersonalizacion(
            productoSeleccionado,
            "frente"
          ).etiqueta,
        },
        espalda: {
          ...personalizaciones.espalda,
          areaImpresion: obtenerConfigPersonalizacion(
            productoSeleccionado,
            "espalda"
          ).etiqueta,
        },
      },
      capas: JSON.parse(JSON.stringify(capas)),
      cantidad: editandoCartId
        ? carrito.find((item) => item.cartId === editandoCartId)?.cantidad || 1
        : 1,
    };

    if (editandoCartId) {
      setCarrito((actual) => {
        const itemEditado = actual.find(
          (item) => item.cartId === editandoCartId
        );

        const actualizado = {
          ...nuevoItem,
          cartId: editandoCartId,
          cantidad: itemEditado?.cantidad || 1,
        };

        const otroIgual = actual.find(
          (item) =>
            item.cartId !== editandoCartId &&
            sonItemsIguales(item, actualizado)
        );

        if (otroIgual) {
          return actual
            .filter((item) => item.cartId !== editandoCartId)
            .map((item) =>
              item.cartId === otroIgual.cartId
                ? {
                    ...item,
                    cantidad:
                      item.cantidad + (itemEditado?.cantidad || 1),
                  }
                : item
            );
        }

        return actual.map((item) =>
          item.cartId === editandoCartId ? actualizado : item
        );
      });

      setEditandoCartId(null);
    } else {
      setCarrito((actual) => {
        const igual = actual.find((item) =>
          sonItemsIguales(item, nuevoItem)
        );

        if (igual) {
          return actual.map((item) =>
            item.cartId === igual.cartId
              ? {
                  ...item,
                  cantidad: item.cantidad + 1,
                }
              : item
          );
        }

        return [...actual, nuevoItem];
      });
    }

    setCarritoAbierto(true);
  };

  const aumentarCantidad = (cartId) => {
    setCarrito((actual) =>
      actual.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              cantidad: item.cantidad + 1,
            }
          : item
      )
    );
  };

  const disminuirCantidad = (cartId) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (cartId) => {
    setCarrito((actual) =>
      actual.filter((item) => item.cartId !== cartId)
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const actualizarCheckoutDato = (campo, valor) => {
    setCheckoutDatos((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setCheckoutError("");
    setCheckoutListo(false);
  };

  const validarCheckout = () => {
    const requeridos = [
      ["nombre", "Ingresá tu nombre."],
      ["apellido", "Ingresá tu apellido."],
      ["email", "Ingresá tu email."],
      ["telefono", "Ingresá tu teléfono."],
    ];

    if (checkoutDatos.entrega === "envio") {
      requeridos.push(
        ["direccion", "Ingresá la dirección de entrega."],
        ["localidad", "Ingresá la localidad."],
        ["provincia", "Seleccioná la provincia."],
        ["codigoPostal", "Ingresá el código postal."]
      );
    }

    for (const [campo, mensaje] of requeridos) {
      if (!String(checkoutDatos[campo] || "").trim()) {
        return mensaje;
      }
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      checkoutDatos.email.trim()
    );

    if (!emailValido) {
      return "Ingresá un email válido.";
    }

    return "";
  };

  const continuarCompra = () => {
    if (carrito.length === 0) {
      setCarritoAbierto(true);
      return;
    }

    setCarritoAbierto(false);
    setEditandoCartId(null);
    setModoPersonalizar(false);
    setModoCheckout(true);
    setCheckoutError("");
    setCheckoutListo(false);
    setPedidoConfirmado(null);
    setModoTransferencia(false);
    setPedidoFinalizado(false);
    setMostrarResumenFinal(false);
    setTransferenciaDatos({
      nombreRemitente: "",
      comprobanteNombre: "",
      comprobanteArchivo: null,
      enviado: false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const volverAlCarritoDesdeCheckout = () => {
    setModoCheckout(false);
    setCheckoutListo(false);
    setCheckoutError("");
    setCarritoAbierto(true);
  };

  const copiarDatoBancario = async (tipo, valor) => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(tipo);
      window.setTimeout(() => setCopiado(""), 1600);
    } catch (error) {
      console.warn("TintaViva: no se pudo copiar al portapapeles.", error);
    }
  };

  const seleccionarComprobante = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    setTransferenciaDatos((actual) => ({
      ...actual,
      comprobanteArchivo: archivo,
      comprobanteNombre: archivo.name,
      enviado: false,
    }));
    setCheckoutError("");
  };

  const enviarComprobanteTransferencia = async () => {
    if (guardandoPedido) return;

    if (!pedidoConfirmado) {
      setCheckoutError("No se encontró el pedido para guardar.");
      return;
    }

    if (!transferenciaDatos.nombreRemitente.trim()) {
      setCheckoutError(
        "Ingresá el nombre de la persona que realizó la transferencia."
      );
      return;
    }

    if (!transferenciaDatos.comprobanteArchivo) {
      setCheckoutError("Adjuntá el comprobante de la transferencia.");
      return;
    }

    const pedidoActualizado = {
      ...pedidoConfirmado,
      estado: "Comprobante enviado",
      pago: {
        metodo: "Transferencia bancaria",
        remitente: transferenciaDatos.nombreRemitente.trim(),
        comprobante: transferenciaDatos.comprobanteNombre,
        enviadoEn: new Date().toISOString(),
      },
    };

    const formData = new FormData();

    // IMPORTANTE:
    // El backend espera exactamente estos dos nombres:
    // "pedido" y "comprobante".
    formData.append("pedido", JSON.stringify(pedidoActualizado));
    formData.append(
      "comprobante",
      transferenciaDatos.comprobanteArchivo
    );

    setGuardandoPedido(true);
    setCheckoutError("");

    try {
      console.log(
        "TintaViva: enviando pedido al backend:",
        `${API_URL}/api/pedidos`
      );

      const respuesta = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        body: formData,
      });

      let resultado = null;

      try {
        resultado = await respuesta.json();
      } catch {
        resultado = null;
      }

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            `No se pudo guardar el pedido. Error HTTP ${respuesta.status}.`
        );
      }

      const pedidoGuardado = {
        ...pedidoActualizado,
        backendId: resultado?.pedido?.id ?? null,
        comprobanteUrl:
          resultado?.pedido?.comprobanteUrl ?? null,
      };

      console.log(
        "TintaViva: pedido guardado correctamente:",
        resultado
      );

      setPedidoConfirmado(pedidoGuardado);

      setTransferenciaDatos((actual) => ({
        ...actual,
        enviado: true,
      }));

      try {
        localStorage.setItem(
          "tintaviva-ultimo-pedido",
          JSON.stringify(pedidoGuardado)
        );
      } catch (error) {
        console.warn(
          "TintaViva: no se pudo guardar el pedido en localStorage.",
          error
        );
      }

      // El carrito se vacía SOLAMENTE después de que
      // el backend confirmó que PostgreSQL guardó el pedido.
      setCarrito([]);
      setCarritoAbierto(false);
      setPedidoFinalizado(true);
      setMostrarResumenFinal(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "TintaViva: error al guardar el pedido:",
        error
      );

      // No mostramos la pantalla final y NO vaciamos el carrito.
      setTransferenciaDatos((actual) => ({
        ...actual,
        enviado: false,
      }));

      setCheckoutError(
        error?.message ||
          "No se pudo conectar con el servidor. Verificá que el backend esté funcionando."
      );
    } finally {
      setGuardandoPedido(false);
    }
  };

  const volverInicioDesdePedido = () => {
    setModoCheckout(false);
    setCheckoutListo(false);
    setModoTransferencia(false);
    setPedidoFinalizado(false);
    setMostrarResumenFinal(false);
    setPedidoConfirmado(null);
    setCheckoutError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const revisarPedido = (event) => {
    event.preventDefault();

    const error = validarCheckout();

    if (error) {
      setCheckoutError(error);
      setCheckoutListo(false);
      return;
    }

    const numeroPedido = `TV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const pedido = {
      numero: numeroPedido,
      estado: "Pendiente de pago",
      creadoEn: new Date().toISOString(),
      cliente: { ...checkoutDatos },
      cantidadPrendas: cantidadCarrito,
      total: totalCarrito,
      items: carrito.map((item) => ({
        cartId: item.cartId,
        productoId: item.productoId,
        nombre: item.nombre,
        color: item.color,
        talle: item.talle,
        cantidad: item.cantidad,
        precio: item.precio,
        imagenesProducto: item.imagenesProducto,
        disenos: item.disenos,
        capas: item.capas,
      })),
    };

    setPedidoConfirmado(pedido);

    try {
      localStorage.setItem("tintaviva-ultimo-pedido", JSON.stringify(pedido));
    } catch (error) {
      console.warn("TintaViva: no se pudo guardar el pedido temporalmente.", error);
    }

    setCheckoutError("");
    setCheckoutListo(true);
  };

  const Logo = () => (
    <button
      className="brand brand-button"
      onClick={volverInicio}
      aria-label="Volver al inicio"
    >
      <img
        src="/logo-tintaviva.png"
        alt="TintaViva"
        className="brand-logo"
      />
    </button>
  );

  const CartButton = () => (
    <button
      className="cart-button"
      onClick={() => setCarritoAbierto(true)}
    >
      <span>Carrito</span>

      <span className="cart-count">
        {cantidadCarrito}
      </span>
    </button>
  );

  const Header = ({ texto }) => (
    <header className="navbar">
      <Logo />

      {texto ? (
        texto.toLowerCase() === "checkout" ? (
          <button
            type="button"
            className="product-header-label checkout-header-button"
            onClick={continuarCompra}
            disabled={carrito.length === 0}
          >
            Checkout
          </button>
        ) : (
          <span className="product-header-label">
            {texto}
          </span>
        )
      ) : (
        <nav className="nav-links">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#como-funciona">Cómo funciona</a>
        </nav>
      )}

      <CartButton />
    </header>
  );

  const Carrito = () => {
    if (!carritoAbierto) return null;

    return (
      <div
        className="cart-overlay"
        onClick={() => setCarritoAbierto(false)}
      >
        <aside
          className="cart-drawer"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="cart-header">
            <div>
              <span className="cart-eyebrow">
                TU PEDIDO
              </span>

              <h2>Carrito</h2>
            </div>

            <button
              className="cart-close"
              onClick={() => setCarritoAbierto(false)}
            >
              ×
            </button>
          </div>

          {carrito.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-symbol">
                TV
              </div>

              <h3>Tu carrito está vacío</h3>

              <p>
                Personalizá una remera o un buzo y
                agregalo a tu pedido.
              </p>

              <button
                onClick={() => {
                  setCarritoAbierto(false);
                  cerrarProducto();
                }}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {carrito.map((item) => (
                  <article
                    className="cart-item"
                    key={item.cartId}
                  >
                    <div className="cart-item-preview">
                      {(() => {
                        const frentePersonalizado = Boolean(
                          item.disenos?.frente?.imagen ||
                          item.disenos?.frente?.texto?.contenido?.trim()
                        );

                        const espaldaPersonalizada = Boolean(
                          item.disenos?.espalda?.imagen ||
                          item.disenos?.espalda?.texto?.contenido?.trim()
                        );

                        const ladoPreview = frentePersonalizado
                          ? "frente"
                          : "espalda";

                        const disenoPreview = item.disenos?.[ladoPreview];
                        const imagenPrenda =
                          item.imagenesProducto?.[ladoPreview] ||
                          item.imagenProducto ||
                          "";

                        const textoPreview = disenoPreview?.texto;

                        return (
                          <>
                            <img
                              className="cart-garment"
                              src={imagenPrenda}
                              alt={`${item.nombre} ${ladoPreview}`}
                            />

                            {disenoPreview?.imagen && item.capas?.[ladoPreview]?.imagen?.visible !== false && (
                              <img
                                className="cart-design"
                                src={disenoPreview.imagen}
                                alt={`Diseño ${ladoPreview}`}
                                style={{
                                  left: `${disenoPreview.posicion.x}%`,
                                  top: `${disenoPreview.posicion.y}%`,
                                  width: `${Math.min(disenoPreview.tamano, 46)}%`,
                                }}
                              />
                            )}

                            {textoPreview?.contenido?.trim() && item.capas?.[ladoPreview]?.texto?.visible !== false && (
                              <span
                                className="cart-text-design"
                                style={{
                                  left: `${textoPreview.posicion?.x ?? 50}%`,
                                  top: `${textoPreview.posicion?.y ?? 50}%`,
                                  color: textoPreview.color || "#111111",
                                  fontFamily: textoPreview.fuente || "Arial",
                                  fontWeight: textoPreview.negrita ? 800 : 400,
                                  fontSize: `${Math.max(7, Math.min(13, (textoPreview.tamano || 32) * 0.28))}px`,
                                  transform: `translate(-50%, -50%) rotate(${textoPreview.rotacion || 0}deg)`,
                                }}
                              >
                                {textoPreview.contenido}
                              </span>
                            )}

                            <span className="cart-side-badge">
                              {frentePersonalizado && espaldaPersonalizada
                                ? "Frente + espalda"
                                : ladoPreview === "frente"
                                  ? "Frente"
                                  : "Espalda"}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <div className="cart-item-info">
                      <div className="cart-item-top">
                        <div>
                          <h3>{item.nombre}</h3>

                          <p>
                            {item.color} · Talle {item.talle}
                          </p>

                          <div className="cart-design-actions">
                            <button
                              type="button"
                              className="edit-cart-design-button"
                              onClick={() => editarItemCarrito(item)}
                            >
                              ✎ Editar
                            </button>

                            <button
                              type="button"
                              className="duplicate-cart-item-button"
                              onClick={() => duplicarItemCarrito(item)}
                            >
                              ⧉ Duplicar
                            </button>
                          </div>
                        </div>

                        <button
                          className="remove-cart-item"
                          onClick={() =>
                            eliminarDelCarrito(item.cartId)
                          }
                          title="Eliminar del carrito"
                          aria-label={`Eliminar ${item.nombre} del carrito`}
                        >
                          ×
                        </button>
                      </div>

                      <div className="cart-item-bottom smart-cart-bottom">
                        <div className="cart-quantity-block">
                          <small>CANTIDAD</small>
                          <div className="quantity-control">
                            <button
                              onClick={() =>
                                disminuirCantidad(item.cartId)
                              }
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>

                            <span>{item.cantidad}</span>

                            <button
                              onClick={() =>
                                aumentarCantidad(item.cartId)
                              }
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="cart-subtotal-block">
                          <small>
                            {item.cantidad > 1
                              ? `${formatearPrecio(item.precio)} c/u`
                              : "SUBTOTAL"}
                          </small>
                          <strong>
                            {formatearPrecio(
                              item.precio * item.cantidad
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cart-footer">
                <button
                  className="clear-cart-button"
                  onClick={vaciarCarrito}
                >
                  Vaciar carrito
                </button>

                <div className="smart-cart-summary">
                  <div>
                    <span>Prendas</span>
                    <strong>{cantidadCarrito}</strong>
                  </div>
                  <div>
                    <span>Diseños distintos</span>
                    <strong>{modelosCarrito}</strong>
                  </div>
                </div>

                <div className="cart-total-row">
                  <span>Total</span>

                  <strong>
                    {formatearPrecio(totalCarrito)}
                  </strong>
                </div>

                <p className="cart-shipping-note smart-cart-note">
                  Los diseños exactamente iguales se agrupan automáticamente en una sola tarjeta.
                </p>

                <p className="cart-shipping-note">
                  Envío calculado más adelante
                </p>

                <button
                  type="button"
                  className="checkout-button"
                  onClick={continuarCompra}
                >
                  Continuar compra
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    );
  };

  /* ================================= */
  /* CHECKOUT */
  /* ================================= */

  if (modoCheckout) {
    const provincias = [
      "Buenos Aires",
      "Ciudad Autónoma de Buenos Aires",
      "Catamarca",
      "Chaco",
      "Chubut",
      "Córdoba",
      "Corrientes",
      "Entre Ríos",
      "Formosa",
      "Jujuy",
      "La Pampa",
      "La Rioja",
      "Mendoza",
      "Misiones",
      "Neuquén",
      "Río Negro",
      "Salta",
      "San Juan",
      "San Luis",
      "Santa Cruz",
      "Santa Fe",
      "Santiago del Estero",
      "Tierra del Fuego",
      "Tucumán",
    ];

    return (
      <div className="app checkout-app">
        <Header texto="Checkout" />

        <main className="checkout-page">
          <div className="checkout-topbar">
            <button
              type="button"
              className="checkout-back-button"
              onClick={volverAlCarritoDesdeCheckout}
            >
              ← Volver al carrito
            </button>

            <div className="checkout-stepper" aria-label="Progreso de compra">
              <span className="done">01 Carrito</span>
              <span className={checkoutListo ? "done" : "active"}>02 Datos</span>
              <span className={modoTransferencia || pedidoFinalizado ? "done" : checkoutListo ? "active" : ""}>03 Confirmación</span>
              <span className={pedidoFinalizado ? "done" : modoTransferencia ? "active" : ""}>04 Transferencia</span>
            </div>
          </div>

          <div className="checkout-heading">
            <span className="checkout-kicker">
              {pedidoFinalizado
                ? "PEDIDO RECIBIDO"
                : modoTransferencia
                  ? "PAGO POR TRANSFERENCIA"
                  : checkoutListo
                    ? "REVISÁ TU PEDIDO"
                    : "CASI LISTO"}
            </span>
            <h1>
              {pedidoFinalizado
                ? "¡Gracias por tu compra!"
                : modoTransferencia
                  ? "Transferí y enviá tu comprobante."
                  : checkoutListo
                    ? "Confirmá que esté todo bien."
                    : "¿A dónde va tu TintaViva?"}
            </h1>
            <p>
              {pedidoFinalizado
                ? "Recibimos tu pedido y el comprobante. Ahora verificaremos la transferencia antes de comenzar la producción."
                : modoTransferencia
                  ? "Usá los datos bancarios, transferí el importe exacto y adjuntá el comprobante."
                  : checkoutListo
                    ? "Revisá tus datos y el resumen antes de continuar al pago."
                    : "Completá tus datos y elegí cómo querés recibir el pedido."}
            </p>
          </div>

          <div className={`checkout-layout ${pedidoFinalizado ? "checkout-layout-final" : ""}`}>
            {pedidoFinalizado ? (
              <section className="order-finished-card">
                <div className="order-finished-icon">✓</div>

                <span className="order-finished-eyebrow">COMPROBANTE ENVIADO</span>
                <h2>Recibimos tu pedido.</h2>
                <p className="order-finished-message">
                  Vamos a verificar la transferencia antes de comenzar la producción de tus prendas.
                </p>

                <div className="order-finished-number">
                  <small>NÚMERO DE PEDIDO</small>
                  <strong>{pedidoConfirmado?.numero}</strong>
                </div>

                <div className="order-finished-status-row">
                  <div>
                    <small>ESTADO</small>
                    <strong>Comprobante enviado</strong>
                  </div>
                  <div>
                    <small>IMPORTE</small>
                    <strong>{formatearPrecio(pedidoConfirmado?.total || 0)}</strong>
                  </div>
                  <div>
                    <small>ENTREGA</small>
                    <strong>{pedidoConfirmado?.cliente?.entrega === "envio" ? "Envío a domicilio" : "Retiro"}</strong>
                  </div>
                </div>

                <div className="order-finished-note">
                  <span>i</span>
                  <p>
                    El pedido todavía no figura como pagado. Primero vamos a comprobar que la transferencia se haya acreditado correctamente.
                  </p>
                </div>

                <button
                  type="button"
                  className="order-summary-toggle"
                  onClick={() => setMostrarResumenFinal((actual) => !actual)}
                >
                  {mostrarResumenFinal ? "Ocultar resumen" : "Ver resumen del pedido"}
                  <span>{mostrarResumenFinal ? "−" : "+"}</span>
                </button>

                {mostrarResumenFinal && (
                  <div className="order-final-summary">
                    <div className="order-final-customer">
                      <div>
                        <small>CLIENTE</small>
                        <strong>{pedidoConfirmado?.cliente?.nombre} {pedidoConfirmado?.cliente?.apellido}</strong>
                        <span>{pedidoConfirmado?.cliente?.email}</span>
                      </div>
                      <div>
                        <small>TRANSFERENCIA</small>
                        <strong>{pedidoConfirmado?.pago?.remitente}</strong>
                        <span>{pedidoConfirmado?.pago?.comprobante}</span>
                      </div>
                    </div>

                    <div className="order-final-items">
                      {pedidoConfirmado?.items?.map((item) => (
                        <div key={item.cartId} className="order-final-item">
                          <div>
                            <strong>{item.nombre}</strong>
                            <span>{item.color} · Talle {item.talle}</span>
                          </div>
                          <div className="order-final-item-price">
                            <span>x{item.cantidad}</span>
                            <strong>{formatearPrecio(item.precio * item.cantidad)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pedidoConfirmado?.cliente?.entrega === "envio" && (
                      <div className="order-final-address">
                        <small>ENTREGA</small>
                        <strong>{pedidoConfirmado?.cliente?.direccion}</strong>
                        <span>
                          {pedidoConfirmado?.cliente?.localidad} · {pedidoConfirmado?.cliente?.provincia} · CP {pedidoConfirmado?.cliente?.codigoPostal}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="order-finished-actions">
                  <button type="button" className="order-home-button" onClick={volverInicioDesdePedido}>
                    Volver al inicio
                  </button>
                </div>
              </section>
            ) : modoTransferencia ? (
              <section className="checkout-form-card bank-transfer-card">
                <div className="bank-transfer-head">
                  <div>
                    <span className="bank-transfer-kicker">PAGO SEGURO POR TRANSFERENCIA</span>
                    <h2>{formatearPrecio(totalCarrito)}</h2>
                    <p>
                      Pedido <strong>{pedidoConfirmado?.numero}</strong> · Transferí el importe exacto
                    </p>
                  </div>
                  <span className={`transfer-status ${transferenciaDatos.enviado ? "sent" : "pending"}`}>
                    {transferenciaDatos.enviado ? "Comprobante enviado" : "Pendiente de pago"}
                  </span>
                </div>

                <div className="transfer-section-heading">
                  <span>DATOS PARA TRANSFERIR</span>
                  <p>Copiá el alias o el CBU y realizá la transferencia por el importe exacto.</p>
                </div>

                <div className="bank-data-grid">
                  <div className="bank-data-row">
                    <small>BANCO</small>
                    <strong>{datosBancarios.banco}</strong>
                  </div>
                  <div className="bank-data-row">
                    <small>TITULAR</small>
                    <strong>{datosBancarios.titular}</strong>
                  </div>
                  <div className="bank-data-row copyable">
                    <div className="bank-copy-content">
                      <small>ALIAS</small>
                      <strong>{datosBancarios.alias}</strong>
                    </div>
                    <button type="button" onClick={() => copiarDatoBancario("alias", datosBancarios.alias)}>
                      {copiado === "alias" ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div className="bank-data-row copyable">
                    <div className="bank-copy-content">
                      <small>CBU</small>
                      <strong>{datosBancarios.cbu}</strong>
                    </div>
                    <button type="button" onClick={() => copiarDatoBancario("cbu", datosBancarios.cbu)}>
                      {copiado === "cbu" ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div className="bank-data-row">
                    <small>CUIT</small>
                    <strong>{datosBancarios.cuit}</strong>
                  </div>
                  <div className="bank-data-row total-row">
                    <small>IMPORTE EXACTO</small>
                    <strong>{formatearPrecio(totalCarrito)}</strong>
                  </div>
                </div>

                <div className="transfer-section-heading compact">
                  <span>PASOS</span>
                  <p>Seguí este orden para completar el pago sin confusiones.</p>
                </div>

                <div className="transfer-instructions">
                  <div>
                    <span>01</span>
                    <p>Transferí el importe exacto indicado arriba.</p>
                  </div>
                  <div>
                    <span>02</span>
                    <p>Usá como referencia <strong>{pedidoConfirmado?.numero}</strong>.</p>
                  </div>
                  <div>
                    <span>03</span>
                    <p>Adjuntá el comprobante para finalizar el pedido.</p>
                  </div>
                </div>

                {!transferenciaDatos.enviado ? (
                  <div className="transfer-proof-section">
                    <div className="transfer-section-heading compact">
                      <span>COMPROBANTE</span>
                      <p>Cuando termines la transferencia, cargá el comprobante para dejar el pedido registrado.</p>
                    </div>

                    <label className="transfer-name-label">
                      <span>¿Quién realizó la transferencia? *</span>
                      <input
                        type="text"
                        value={transferenciaDatos.nombreRemitente}
                        onChange={(event) => {
                          setTransferenciaDatos((actual) => ({
                            ...actual,
                            nombreRemitente: event.target.value,
                            enviado: false,
                          }));
                          setCheckoutError("");
                        }}
                        placeholder="Nombre y apellido"
                      />
                    </label>

                    <label className={`transfer-upload ${transferenciaDatos.comprobanteArchivo ? "ready" : ""}`}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={seleccionarComprobante}
                      />
                      <span className="transfer-upload-icon">↑</span>
                      <div>
                        <strong>{transferenciaDatos.comprobanteNombre || "Subir comprobante"}</strong>
                        <small>Formato JPG, PNG o PDF</small>
                      </div>
                    </label>

                    {checkoutError && (
                      <div className="checkout-error" role="alert">{checkoutError}</div>
                    )}

                    <button
                      type="button"
                      className="send-proof-button"
                      onClick={enviarComprobanteTransferencia}
                      disabled={guardandoPedido}
                    >
                      {guardandoPedido
                        ? "Guardando pedido..."
                        : "Enviar comprobante →"}
                    </button>
                  </div>
                ) : (
                  <div className="transfer-sent-success">
                    <span>✓</span>
                    <div>
                      <strong>Comprobante recibido</strong>
                      <p>
                        Recibimos el comprobante. Vamos a verificar la transferencia antes de preparar tu pedido.
                      </p>
                      <small>{transferenciaDatos.comprobanteNombre}</small>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="transfer-back-button"
                  onClick={() => setModoTransferencia(false)}
                >
                  ← Volver a la confirmación
                </button>
              </section>
            ) : !checkoutListo ? (
            <form className="checkout-form-card" onSubmit={revisarPedido}>
              <section className="checkout-section">
                <div className="checkout-section-title">
                  <span>01</span>
                  <div>
                    <strong>Datos de contacto</strong>
                    <small>Para identificar tu pedido y contactarte si hace falta.</small>
                  </div>
                </div>

                <div className="checkout-grid two-columns">
                  <label>
                    <span>Nombre *</span>
                    <input
                      type="text"
                      value={checkoutDatos.nombre}
                      onChange={(e) => actualizarCheckoutDato("nombre", e.target.value)}
                      placeholder="Nombre"
                      autoComplete="given-name"
                    />
                  </label>

                  <label>
                    <span>Apellido *</span>
                    <input
                      type="text"
                      value={checkoutDatos.apellido}
                      onChange={(e) => actualizarCheckoutDato("apellido", e.target.value)}
                      placeholder="Apellido"
                      autoComplete="family-name"
                    />
                  </label>

                  <label>
                    <span>Email *</span>
                    <input
                      type="email"
                      value={checkoutDatos.email}
                      onChange={(e) => actualizarCheckoutDato("email", e.target.value)}
                      placeholder="nombre@email.com"
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    <span>Teléfono *</span>
                    <input
                      type="tel"
                      value={checkoutDatos.telefono}
                      onChange={(e) => actualizarCheckoutDato("telefono", e.target.value)}
                      placeholder="11 1234 5678"
                      autoComplete="tel"
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-title">
                  <span>02</span>
                  <div>
                    <strong>Entrega</strong>
                    <small>Elegí envío a domicilio o retiro.</small>
                  </div>
                </div>

                <div className="delivery-options">
                  <button
                    type="button"
                    className={checkoutDatos.entrega === "envio" ? "active" : ""}
                    onClick={() => actualizarCheckoutDato("entrega", "envio")}
                  >
                    <span className="delivery-icon">⌂</span>
                    <div>
                      <strong>Envío a domicilio</strong>
                      <small>El costo se calculará antes del pago.</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={checkoutDatos.entrega === "retiro" ? "active" : ""}
                    onClick={() => actualizarCheckoutDato("entrega", "retiro")}
                  >
                    <span className="delivery-icon">◎</span>
                    <div>
                      <strong>Retiro</strong>
                      <small>Coordinamos el punto de retiro después de confirmar.</small>
                    </div>
                  </button>
                </div>

                {checkoutDatos.entrega === "envio" && (
                  <div className="checkout-address-block">
                    <div className="checkout-grid">
                      <label className="full">
                        <span>Dirección *</span>
                        <input
                          type="text"
                          value={checkoutDatos.direccion}
                          onChange={(e) => actualizarCheckoutDato("direccion", e.target.value)}
                          placeholder="Calle y número"
                          autoComplete="street-address"
                        />
                      </label>
                    </div>

                    <div className="checkout-grid three-columns">
                      <label>
                        <span>Localidad *</span>
                        <input
                          type="text"
                          value={checkoutDatos.localidad}
                          onChange={(e) => actualizarCheckoutDato("localidad", e.target.value)}
                          placeholder="Localidad"
                          autoComplete="address-level2"
                        />
                      </label>

                      <label>
                        <span>Provincia *</span>
                        <select
                          value={checkoutDatos.provincia}
                          onChange={(e) => actualizarCheckoutDato("provincia", e.target.value)}
                          autoComplete="address-level1"
                        >
                          {provincias.map((provincia) => (
                            <option key={provincia} value={provincia}>
                              {provincia}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Código postal *</span>
                        <input
                          type="text"
                          value={checkoutDatos.codigoPostal}
                          onChange={(e) => actualizarCheckoutDato("codigoPostal", e.target.value)}
                          placeholder="B1655"
                          autoComplete="postal-code"
                        />
                      </label>
                    </div>

                    <label className="checkout-textarea-label">
                      <span>Referencias para la entrega</span>
                      <textarea
                        value={checkoutDatos.referencias}
                        onChange={(e) => actualizarCheckoutDato("referencias", e.target.value)}
                        placeholder="Piso, departamento, entrecalles o indicaciones..."
                        rows="3"
                      />
                    </label>
                  </div>
                )}

                {checkoutDatos.entrega === "retiro" && (
                  <div className="pickup-note">
                    <strong>Retiro coordinado</strong>
                    <p>
                      En el próximo sprint vamos a mostrar el punto de retiro y la confirmación del pedido.
                    </p>
                  </div>
                )}
              </section>

              {checkoutError && (
                <div className="checkout-error" role="alert">
                  {checkoutError}
                </div>
              )}

              <button type="submit" className="checkout-review-button">
                Revisar y confirmar pedido →
              </button>

              <p className="checkout-security-note">
                No se realiza ningún cobro todavía.
              </p>
            </form>
            ) : (
              <section className="checkout-form-card checkout-review-card">
                <div className="order-confirmation-hero">
                  <div className="order-check">✓</div>
                  <div className="order-confirmation-copy">
                    <span>PEDIDO GENERADO</span>
                    <h2>{pedidoConfirmado?.numero}</h2>
                    <p>Guardamos tu pedido. Todavía no fue cobrado.</p>
                  </div>
                  <span className="order-status-badge">Pendiente de pago</span>
                </div>

                <div className="order-overview-strip">
                  <div>
                    <small>PRENDAS</small>
                    <strong>{cantidadCarrito}</strong>
                  </div>
                  <div>
                    <small>TOTAL</small>
                    <strong>{formatearPrecio(totalCarrito)}</strong>
                  </div>
                  <div>
                    <small>ENTREGA</small>
                    <strong>{checkoutDatos.entrega === "envio" ? "Domicilio" : "Retiro"}</strong>
                  </div>
                </div>

                <div className="review-data-grid">
                  <div>
                    <small>CLIENTE</small>
                    <strong>{checkoutDatos.nombre} {checkoutDatos.apellido}</strong>
                    <span>{checkoutDatos.email}</span>
                    <span>{checkoutDatos.telefono}</span>
                  </div>

                  <div>
                    <small>ENTREGA</small>
                    <strong>
                      {checkoutDatos.entrega === "envio"
                        ? "Envío a domicilio"
                        : "Retiro"}
                    </strong>
                    {checkoutDatos.entrega === "envio" ? (
                      <>
                        <span>{checkoutDatos.direccion}</span>
                        <span>
                          {checkoutDatos.localidad}, {checkoutDatos.provincia}
                        </span>
                        <span>CP {checkoutDatos.codigoPostal}</span>
                      </>
                    ) : (
                      <span>Punto de retiro a coordinar</span>
                    )}
                  </div>
                </div>

                {checkoutDatos.referencias?.trim() && (
                  <div className="review-reference">
                    <small>REFERENCIAS</small>
                    <p>{checkoutDatos.referencias}</p>
                  </div>
                )}

                <div className="review-actions">
                  <button
                    type="button"
                    className="review-edit-button"
                    onClick={() => { setModoTransferencia(false); setCheckoutListo(false); setPedidoConfirmado(null); }}
                  >
                    ← Editar datos
                  </button>

                  <button
                    type="button"
                    className="review-pay-button"
                    onClick={() => {
                      setModoTransferencia(true);
                      setCheckoutError("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Pagar por transferencia →
                  </button>
                </div>
              </section>
            )}

            <aside className="checkout-summary-card">
              <div className="checkout-summary-head">
                <span>RESUMEN</span>
                <strong>{cantidadCarrito} {cantidadCarrito === 1 ? "prenda" : "prendas"}</strong>
              </div>

              <div className="checkout-items">
                {carrito.map((item) => (
                  <article className="checkout-item" key={item.cartId}>
                    <div className="checkout-item-image">
                      <img
                        src={item.imagenesProducto?.frente || item.imagenProducto}
                        alt={item.nombre}
                      />
                      <span>{item.cantidad}×</span>
                    </div>

                    <div className="checkout-item-info">
                      <strong>{item.nombre}</strong>
                      <small>{item.color} · Talle {item.talle}</small>
                      <small>
                        {(item.disenos?.frente?.imagen || item.disenos?.frente?.texto?.contenido?.trim()) ? "Frente" : ""}
                        {(item.disenos?.frente?.imagen || item.disenos?.frente?.texto?.contenido?.trim()) &&
                         (item.disenos?.espalda?.imagen || item.disenos?.espalda?.texto?.contenido?.trim()) ? " + " : ""}
                        {(item.disenos?.espalda?.imagen || item.disenos?.espalda?.texto?.contenido?.trim()) ? "Espalda" : ""}
                      </small>
                    </div>

                    <strong className="checkout-item-price">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </strong>
                  </article>
                ))}
              </div>

              <div className="checkout-summary-line">
                <span>Subtotal</span>
                <strong>{formatearPrecio(totalCarrito)}</strong>
              </div>

              <div className="checkout-summary-line">
                <span>Entrega</span>
                <strong>
                  {checkoutDatos.entrega === "retiro"
                    ? "Retiro"
                    : "A calcular"}
                </strong>
              </div>

              <div className="checkout-summary-total">
                <span>Total productos</span>
                <strong>{formatearPrecio(totalCarrito)}</strong>
              </div>

              <p className="checkout-summary-note">
                El costo de envío, si corresponde, se agregará antes del pago.
              </p>
            </aside>
          </div>
        </main>

        <Carrito />
      </div>
    );
  }

  /* ================================= */
  /* PERSONALIZADOR */
  /* ================================= */

  if (productoSeleccionado && modoPersonalizar) {
    return (
      <div className="app">
        <Header texto="TintaViva Studio" />

        <main className="designer-page">
          {editandoCartId ? (
            <div className="editing-cart-banner">
              <div>
                <span>EDITANDO DESDE EL CARRITO</span>
                <strong>Los cambios actualizarán esta prenda.</strong>
              </div>
              <button type="button" onClick={cancelarEdicionCarrito}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              className="back-button studio-back-button"
              onClick={() => setModoPersonalizar(false)}
            >
              ← Volver al producto
            </button>
          )}

          <div className="studio-identity-bar">
            <div className="studio-identity-copy">
              <span className="studio-mini-mark">TV</span>
              <div>
                <strong>ESTUDIO TINTAVIVA</strong>
                <small>Tu idea, lista para cobrar vida.</small>
              </div>
            </div>

            <div className="studio-progress" aria-label="Proceso de personalización">
              <span className="done"><b>01</b> PRENDA</span>
              <span className="active"><b>02</b> CREÁ</span>
              <span><b>03</b> AJUSTÁ</span>
              <span><b>04</b> LISTO</span>
            </div>
          </div>

          <div className="designer-layout">
            <section className="designer-preview-panel">
              <div className="designer-preview-header">
                <div>
                  <span>TU LIENZO</span>

                  <h2>Diseñá {productoSeleccionado.nombre}</h2>
                </div>

                <span className="preview-help">
                  Mové tu arte directamente sobre la prenda
                </span>
              </div>

              <div
                className={`garment-preview ${
                  arrastrando ? "dragging" : ""
                }`}
                ref={previewRef}
                onMouseMove={moverMouse}
                onMouseUp={detenerArrastre}
                onMouseLeave={detenerArrastre}
              >
                <span className="studio-ink studio-ink-one" aria-hidden="true" />
                <span className="studio-ink studio-ink-two" aria-hidden="true" />
                <span className="studio-ink studio-ink-three" aria-hidden="true" />

                <img
                  className="garment-image"
                  src={obtenerImagenProducto(
                    productoSeleccionado,
                    colorSeleccionado,
                    ladoSeleccionado
                  )}
                  alt={`${productoSeleccionado.nombre} ${colorSeleccionado} ${ladoSeleccionado}`}
                />

              {personalizacionActual.imagen && capasActuales?.imagen?.visible !== false && (
                  <img
                    src={personalizacionActual.imagen}
                    alt="Diseño personalizado"
                    className={`custom-design-image ${
                      capaActiva === "imagen" ? "layer-selected" : ""
                    } ${capasActuales?.imagen?.bloqueada ? "layer-locked" : ""}`}
                    style={{
                      left: `${personalizacionActual.posicion.x}%`,
                      top: `${personalizacionActual.posicion.y}%`,
                      width: `${personalizacionActual.tamano}%`,
                      zIndex: obtenerZCapa("imagen"),
                    }}
                    onMouseDown={(event) => iniciarArrastre(event, "imagen")}
                    onTouchStart={(event) => iniciarArrastre(event, "imagen")}
                    onTouchMove={(event) => moverTouch(event, "imagen")}
                    onTouchEnd={detenerArrastre}
                    draggable={false}
                  />
                )}

                {personalizacionActual.texto?.contenido.trim() && capasActuales?.texto?.visible !== false && (
                  <div
                    className={`custom-text-design ${
                      capaActiva === "texto" ? "layer-selected" : ""
                    } ${capasActuales?.texto?.bloqueada ? "layer-locked" : ""}`}
                    style={{
                      left: `${personalizacionActual.texto.posicion.x}%`,
                      top: `${personalizacionActual.texto.posicion.y}%`,
                      fontSize: `${personalizacionActual.texto.tamano}px`,
                      color: personalizacionActual.texto.color,
                      fontFamily: personalizacionActual.texto.fuente,
                      fontWeight: personalizacionActual.texto.negrita ? 800 : 400,
                      transform: `translate(-50%, -50%) rotate(${personalizacionActual.texto.rotacion}deg)`,
                      zIndex: obtenerZCapa("texto"),
                    }}
                    onMouseDown={(event) => iniciarArrastre(event, "texto")}
                    onTouchStart={(event) => iniciarArrastre(event, "texto")}
                    onTouchMove={(event) => moverTouch(event, "texto")}
                    onTouchEnd={detenerArrastre}
                  >
                    {personalizacionActual.texto.contenido}
                  </div>
                )}

                <div
                  className={`print-area-guide ${
                    (personalizacionActual.imagen || personalizacionActual.texto?.contenido.trim()) ? "with-design" : ""
                  }`}
                  style={{
                    width: `${obtenerConfigPersonalizacion().guia.width}%`,
                    height: `${obtenerConfigPersonalizacion().guia.height}%`,
                    top: `${obtenerConfigPersonalizacion().guia.top}%`,
                  }}
                >
                  <span>{obtenerConfigPersonalizacion().etiqueta}</span>
                </div>
              </div>

              <div className="preview-product-info">
                <div>
                  <span>Color</span>
                  <strong>{colorSeleccionado}</strong>
                </div>

                <div>
                  <span>Talle</span>
                  <strong>{talleSeleccionado}</strong>
                </div>

                <div>
                  <span>Lado</span>
                  <strong>{ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</strong>
                </div>

                <div>
                  <span>Precio</span>

                  <strong>
                    {formatearPrecio(
                      precioPersonalizadoActual
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <aside className={`designer-controls tool-${herramientaActiva}`}>
              <span className="designer-step">PASO 02 · CREÁ</span>

              <h1>Dale vida a tu idea.</h1>

              <p className="designer-intro">
                Subí tu diseño, escribí algo tuyo y acomodalo hasta que se sienta realmente TintaViva.
              </p>

              <div className="designer-control-section side-control-section">
                <div className="control-title">
                  <strong>Lado de la prenda</strong>
                  <span>{ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</span>
                </div>

                <div className="side-selector">
                  <button
                    className={`side-option ${
                      ladoSeleccionado === "frente" ? "active" : ""
                    }`}
                    onClick={() => cambiarLado("frente")}
                  >
                    <span>Frente</span>
                    {(personalizaciones.frente.imagen || personalizaciones.frente.texto?.contenido.trim()) && (
                      <small>Personalizado ✓</small>
                    )}
                  </button>

                  <button
                    className={`side-option ${
                      ladoSeleccionado === "espalda" ? "active" : ""
                    }`}
                    onClick={() => cambiarLado("espalda")}
                  >
                    <span>Espalda</span>
                    {(personalizaciones.espalda.imagen || personalizaciones.espalda.texto?.contenido.trim()) && (
                      <small>Personalizado ✓</small>
                    )}
                  </button>
                </div>
              </div>

              <div className="designer-control-section">
                <div className="control-title">
                  <strong>Color de la prenda</strong>
                  <span>{colorSeleccionado}</span>
                </div>

                <div className="color-options">
                  {productoSeleccionado.colores.map(
                    (color) => (
                      <button
                        key={color}
                        className={`color-option ${
                          colorSeleccionado === color
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setColorSeleccionado(color)
                        }
                      >
                        <span
                          className={`color-circle ${colorClase(
                            color
                          )}`}
                        />

                        {color}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="editor-tabs" role="tablist" aria-label="Herramientas de diseño">
                <button
                  className={herramientaActiva === "diseno" ? "active" : ""}
                  onClick={() => setHerramientaActiva("diseno")}
                >
                  <small>02</small>
                  <span>Diseño</span>
                </button>
                <button
                  className={herramientaActiva === "texto" ? "active" : ""}
                  onClick={() => setHerramientaActiva("texto")}
                >
                  <small>03</small>
                  <span>Texto</span>
                </button>
                <button
                  className={herramientaActiva === "capas" ? "active" : ""}
                  onClick={() => setHerramientaActiva("capas")}
                >
                  <small>04</small>
                  <span>Capas</span>
                </button>
              </div>

              <div className="editor-panel-layers designer-control-section improved-layers-panel">
                <div className="layers-panel-head">
                  <div>
                    <span className="layers-kicker">ORGANIZÁ TU DISEÑO</span>
                    <strong>Capas · {ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</strong>
                  </div>
                  <span className="layers-count-badge">
                    {[personalizacionActual.imagen, personalizacionActual.texto?.contenido.trim()].filter(Boolean).length}
                  </span>
                </div>

                <p className="layers-help improved-layers-help">
                  Lo que está más arriba en esta lista también queda por encima en la prenda.
                </p>

                <div className="layer-stack-labels" aria-hidden="true">
                  <span>ARRIBA</span>
                  <i />
                  <span>ABAJO</span>
                </div>

                <div className="layer-list-real improved-layer-list">
                  {[...capasActuales.orden].reverse().map((tipo, indiceVisual) => {
                    const esImagen = tipo === "imagen";
                    const existe = capaExiste(tipo);
                    const opciones = capasActuales[tipo];
                    const titulo = opciones?.nombre || (esImagen ? "Diseño" : "Texto");
                    const detalle = esImagen
                      ? (personalizacionActual.imagen ? "Imagen cargada" : "Todavía sin imagen")
                      : (personalizacionActual.texto?.contenido.trim() || "Todavía sin texto");

                    return (
                      <div
                        key={tipo}
                        className={`layer-card-wrap ${capaActiva === tipo && existe ? "selected" : ""}`}
                      >
                        <button
                          type="button"
                          disabled={!existe}
                          className={`layer-row improved-layer-row ${
                            capaActiva === tipo && existe ? "active" : ""
                          } ${!existe ? "empty" : ""}`}
                          onClick={() => seleccionarCapa(tipo)}
                        >
                          <span className={`layer-thumb ${esImagen ? "image-thumb" : "text-thumb"}`}>
                            {esImagen && personalizacionActual.imagen ? (
                              <img src={personalizacionActual.imagen} alt="" />
                            ) : (
                              <span>{esImagen ? "IMG" : "Aa"}</span>
                            )}
                          </span>

                          <span className="layer-row-copy improved-layer-copy">
                            <strong>{titulo}</strong>
                            <small>{detalle}</small>
                          </span>

                          <span className="layer-inline-icons" aria-label="Estado de la capa">
                            <span title={opciones?.visible === false ? "Oculta" : "Visible"}>
                              {opciones?.visible === false ? "○" : "◉"}
                            </span>
                            <span title={opciones?.bloqueada ? "Bloqueada" : "Desbloqueada"}>
                              {opciones?.bloqueada ? "▣" : "□"}
                            </span>
                          </span>
                        </button>

                        {capaActiva === tipo && existe && (
                          <div className="layer-quick-actions">
                            <button type="button" onClick={() => renombrarCapa(tipo)} title="Renombrar capa">
                              ✎ <span>Nombre</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => alternarVisibilidadCapa(tipo)}
                              className={opciones?.visible === false ? "active-action" : ""}
                              title={opciones?.visible === false ? "Mostrar capa" : "Ocultar capa"}
                            >
                              {opciones?.visible === false ? "◌" : "◉"} <span>{opciones?.visible === false ? "Mostrar" : "Ocultar"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => alternarBloqueoCapa(tipo)}
                              className={opciones?.bloqueada ? "active-action" : ""}
                              title={opciones?.bloqueada ? "Desbloquear capa" : "Bloquear capa"}
                            >
                              {opciones?.bloqueada ? "▣" : "□"} <span>{opciones?.bloqueada ? "Desbloq." : "Bloquear"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {capaExiste(capaActiva) ? (
                  <div className="layer-actions improved-layer-actions">
                    <div className="layer-order-actions">
                      <button
                        type="button"
                        onClick={() => moverCapa(capaActiva, "arriba")}
                        disabled={capasActuales.orden.indexOf(capaActiva) === capasActuales.orden.length - 1}
                      >
                        <span>↑</span>
                        <div><strong>Traer adelante</strong><small>Sube una posición</small></div>
                      </button>

                      <button
                        type="button"
                        onClick={() => moverCapa(capaActiva, "abajo")}
                        disabled={capasActuales.orden.indexOf(capaActiva) === 0}
                      >
                        <span>↓</span>
                        <div><strong>Mandar atrás</strong><small>Baja una posición</small></div>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="delete-layer-button improved-delete-layer"
                      onClick={() => eliminarCapa(capaActiva)}
                    >
                      Eliminar capa seleccionada
                    </button>
                  </div>
                ) : (
                  <div className="layers-empty-state improved-empty-layer">
                    <strong>Esta capa todavía está vacía.</strong>
                    <span>{capaActiva === "imagen" ? "Subí una imagen desde Diseño." : "Escribí un texto desde Texto."}</span>
                  </div>
                )}

                <div className="layers-pro-tip">
                  <span>TIP</span>
                  <p>También podés seleccionar una capa haciendo clic directamente sobre la imagen o el texto en la prenda.</p>
                </div>
              </div>

              <div className="upload-section editor-panel-design">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={cargarImagen}
                  hidden
                />

                {!personalizacionActual.imagen ? (
                  <button
                    className="upload-design-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <span className="upload-icon">
                      ＋
                    </span>

                    <div>
                      <strong>Subir diseño · {ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</strong>
                      <small>PNG, JPG o WEBP</small>
                    </div>
                  </button>
                ) : (
                  <div className="uploaded-design">
                    <div className="uploaded-preview">
                      <img
                        src={personalizacionActual.imagen}
                        alt="Diseño subido"
                      />
                    </div>

                    <div className="uploaded-info">
                      <strong>Diseño cargado · {ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</strong>
                      <span>Listo para personalizar</span>
                    </div>

                    <button
                      className="change-image-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              <div className="designer-control-section text-personalization-section editor-panel-text">
              <div className="control-title">
                <strong>Texto personalizado</strong>
                <span>{ladoSeleccionado === "frente" ? "Frente" : "Espalda"}</span>
              </div>

              <input
                className="custom-text-input"
                type="text"
                maxLength="40"
                placeholder="Escribí tu texto aquí..."
                value={personalizacionActual.texto?.contenido || ""}
                onChange={(event) => {
                      actualizarTextoActual({ contenido: event.target.value });
                      if (event.target.value.trim()) {
                        setCapas((actual) => ({
                          ...actual,
                          [ladoSeleccionado]: {
                            ...actual[ladoSeleccionado],
                            activa: "texto",
                            texto: { ...actual[ladoSeleccionado].texto, visible: true, bloqueada: false },
                          },
                        }));
                      }
                    }}
              />

              <div className="text-control-grid">
                <label>
                  <span>Tipografía</span>
                  <select
                    value={personalizacionActual.texto?.fuente || "Arial"}
                    onChange={(event) => actualizarTextoActual({ fuente: event.target.value })}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier</option>
                    <option value="Impact">Impact</option>
                  </select>
                </label>

                <label>
                  <span>Color</span>
                  <input
                    className="text-color-input"
                    type="color"
                    value={personalizacionActual.texto?.color || "#111111"}
                    onChange={(event) => actualizarTextoActual({ color: event.target.value })}
                  />
                </label>
              </div>

              <button
                className={`text-bold-button ${personalizacionActual.texto?.negrita ? "active" : ""}`}
                onClick={() => actualizarTextoActual({ negrita: !personalizacionActual.texto?.negrita })}
              >
                B · Negrita
              </button>

              <div className="control-title compact-control-title">
                <strong>Tamaño del texto</strong>
                <span>{personalizacionActual.texto?.tamano || 32}px</span>
              </div>
              <input
                className="size-slider"
                type="range"
                min="16"
                max="72"
                value={personalizacionActual.texto?.tamano || 32}
                onChange={(event) => actualizarTextoActual({ tamano: Number(event.target.value) })}
              />

              <div className="control-title compact-control-title">
                <strong>Rotación</strong>
                <span>{personalizacionActual.texto?.rotacion || 0}°</span>
              </div>
              <input
                className="size-slider"
                type="range"
                min="-180"
                max="180"
                value={personalizacionActual.texto?.rotacion || 0}
                onChange={(event) => actualizarTextoActual({ rotacion: Number(event.target.value) })}
              />

              <div className="text-position-buttons">
                <button onClick={() => actualizarTextoActual({ posicion: ajustarPosicionAlArea(personalizacionActual.texto.posicion.x - 2, personalizacionActual.texto.posicion.y) })}>←</button>
                <button onClick={() => actualizarTextoActual({ posicion: ajustarPosicionAlArea(personalizacionActual.texto.posicion.x, personalizacionActual.texto.posicion.y - 2) })}>↑</button>
                <button onClick={() => actualizarTextoActual({ posicion: ajustarPosicionAlArea(personalizacionActual.texto.posicion.x, personalizacionActual.texto.posicion.y + 2) })}>↓</button>
                <button onClick={() => actualizarTextoActual({ posicion: ajustarPosicionAlArea(personalizacionActual.texto.posicion.x + 2, personalizacionActual.texto.posicion.y) })}>→</button>
                <button className="text-center-button" onClick={() => actualizarTextoActual({ posicion: { ...obtenerConfigPersonalizacion().centro } })}>Centrar</button>
              </div>

              {personalizacionActual.texto?.contenido && (
                <button className="remove-text-button" onClick={() => actualizarTextoActual({ contenido: "" })}>
                  Eliminar texto
                </button>
              )}
            </div>


              {personalizacionActual.imagen && (
                <>
                  <div className="designer-control-section editor-panel-design refined-control-card">
                    <div className="refined-control-heading">
                      <div>
                        <span className="refined-eyebrow">TAMAÑO DEL DISEÑO</span>
                        <strong>Ajustá la escala</strong>
                      </div>
                      <span className="refined-value-badge">{personalizacionActual.tamano}%</span>
                    </div>

                    <input
                      className="size-slider refined-slider"
                      type="range"
                      min={obtenerConfigPersonalizacion().tamanoMin}
                      max={obtenerConfigPersonalizacion().tamanoMax}
                      value={personalizacionActual.tamano}
                      onChange={(event) =>
                        actualizarPersonalizacionActual({ tamano: Number(event.target.value) })
                      }
                    />

                    <div className="refined-slider-meta">
                      <span>{obtenerConfigPersonalizacion().tamanoMin}%</span>
                      <span>{obtenerConfigPersonalizacion().tamanoMax}%</span>
                    </div>

                    <div className="quick-size-buttons refined-size-presets">
                      <button
                        className={personalizacionActual.tamano === obtenerConfigPersonalizacion().tamanoMin ? "active" : ""}
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoMin })
                        }
                      >
                        <b>S</b>
                        <small>Chico</small>
                      </button>

                      <button
                        className={personalizacionActual.tamano === obtenerConfigPersonalizacion().tamanoInicial ? "active recommended" : "recommended"}
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoInicial })
                        }
                      >
                        <b>M</b>
                        <small>Recomendado</small>
                      </button>

                      <button
                        className={personalizacionActual.tamano === obtenerConfigPersonalizacion().tamanoMax ? "active" : ""}
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoMax })
                        }
                      >
                        <b>L</b>
                        <small>Grande</small>
                      </button>
                    </div>

                    <p className="print-area-note refined-area-note">
                      Área disponible · <strong>{obtenerConfigPersonalizacion().etiqueta}</strong>
                    </p>
                  </div>

                  <div className="designer-control-section editor-panel-design refined-control-card">
                    <div className="refined-control-heading compact">
                      <div>
                        <span className="refined-eyebrow">POSICIÓN</span>
                        <strong>Ubicación rápida</strong>
                      </div>
                    </div>

                    <div className="position-buttons refined-position-buttons">
                      <button
                        onClick={() => {
                          const config = obtenerConfigPersonalizacion();
                          actualizarPersonalizacionActual({
                            posicion: {
                              x: config.centro.x,
                              y: config.area.yMin,
                            },
                          });
                        }}
                      >
                        <span>↑</span>
                        Superior
                      </button>

                      <button
                        onClick={() =>
                          actualizarPersonalizacionActual({
                            posicion: { ...obtenerConfigPersonalizacion().centro },
                          })
                        }
                      >
                        <span>●</span>
                        Centro
                      </button>

                      <button
                        onClick={() => {
                          const config = obtenerConfigPersonalizacion();
                          actualizarPersonalizacionActual({
                            posicion: {
                              x: config.centro.x,
                              y: config.area.yMax,
                            },
                          });
                        }}
                      >
                        <span>↓</span>
                        Inferior
                      </button>
                    </div>

                    <div className="refined-position-footer">
                      <div className="position-values refined-position-values">
                        <span>Posición exacta</span>
                        <strong>X {Math.round(personalizacionActual.posicion.x)}%</strong>
                        <strong>Y {Math.round(personalizacionActual.posicion.y)}%</strong>
                      </div>

                      <button
                        className="reset-personalization-button refined-reset-button"
                        onClick={() => restablecerPersonalizacion()}
                      >
                        ↺ Restablecer
                      </button>
                    </div>
                  </div>

                  <div className="designer-tip editor-panel-design">
                    <span>TIP</span>

                    <p>
                      También podés mover el diseño
                      directamente sobre la prenda con
                      el mouse o con el dedo.
                    </p>
                  </div>

                  <button
                    className="remove-design-button editor-panel-design"
                    onClick={eliminarDiseno}
                  >
                    Eliminar diseño
                  </button>
                </>
              )}

              <div className="studio-ready-label">
                <span>LISTO PARA VESTIR</span>
                <small>Revisá tu prenda antes de sumarla al carrito.</small>
              </div>

              <div className="designer-summary">
                <div>
                  <span>Producto</span>

                  <strong>
                    {productoSeleccionado.nombre}
                  </strong>
                </div>

                <div>
                  <span>Color</span>
                  <strong>{colorSeleccionado}</strong>
                </div>

                <div>
                  <span>Talle</span>
                  <strong>{talleSeleccionado}</strong>
                </div>

                <div>
                  <span>Diseños</span>
                  <strong>
                    {(personalizaciones.frente.imagen || personalizaciones.frente.texto?.contenido.trim()) ? "Frente" : ""}
                    {(personalizaciones.frente.imagen || personalizaciones.frente.texto?.contenido.trim()) && (personalizaciones.espalda.imagen || personalizaciones.espalda.texto?.contenido.trim()) ? " + " : ""}
                    {(personalizaciones.espalda.imagen || personalizaciones.espalda.texto?.contenido.trim()) ? "Espalda" : ""}
                    {!personalizaciones.frente.imagen && !personalizaciones.espalda.imagen && !personalizaciones.frente.texto?.contenido.trim() && !personalizaciones.espalda.texto?.contenido.trim() ? "Sin diseño" : ""}
                  </strong>
                </div>

                {tieneDobleEstampa && (
                  <div>
                    <span>Recargo</span>
                    <strong>Frente + espalda · +20%</strong>
                  </div>
                )}

                <div className="summary-total">
                  <span>Total</span>

                  <strong>
                    {formatearPrecio(
                      precioPersonalizadoActual
                    )}
                  </strong>
                </div>
              </div>

              <button
                className="add-cart-button"
                disabled={!personalizaciones.frente.imagen && !personalizaciones.espalda.imagen && !personalizaciones.frente.texto?.contenido.trim() && !personalizaciones.espalda.texto?.contenido.trim()}
                onClick={agregarAlCarrito}
              >
                {personalizaciones.frente.imagen || personalizaciones.espalda.imagen || personalizaciones.frente.texto?.contenido.trim() || personalizaciones.espalda.texto?.contenido.trim()
                  ? (editandoCartId ? "Actualizar diseño" : "Agregar al carrito")
                  : "Subí una imagen o escribí un texto"}
              </button>
            </aside>
          </div>
        </main>

        <Carrito />
      </div>
    );
  }

  /* ================================= */
  /* DETALLE PRODUCTO */
  /* ================================= */

  if (productoSeleccionado) {
    return (
      <div className="app">
        <Header texto="Personalizá tu prenda" />

        <main className="product-page">
          <button
            className="back-button"
            onClick={cerrarProducto}
          >
            ← Volver a productos
          </button>

          <div className="product-detail">
            <section className="product-detail-image">
              <div className="product-preview-badge">
                Vista previa
              </div>

              <img
                src={obtenerImagenProducto(
                  productoSeleccionado,
                  colorSeleccionado
                )}
                alt={`${productoSeleccionado.nombre} ${colorSeleccionado}`}
              />
            </section>

            <section className="product-detail-info">
              <span className="product-category">
                {productoSeleccionado.categoria}
              </span>

              <h1>{productoSeleccionado.nombre}</h1>

              <p className="product-detail-description">
                {productoSeleccionado.detalle}
              </p>

              <div className="detail-price">
                {formatearPrecio(
                  productoSeleccionado.precio
                )}
              </div>

              <p className="product-detail-description">
                Personalización en 1 lado incluida · Frente + espalda: +20%
              </p>

              <div className="product-option">
                <div className="option-title">
                  <strong>Color</strong>
                  <span>{colorSeleccionado}</span>
                </div>

                <div className="color-options">
                  {productoSeleccionado.colores.map(
                    (color) => (
                      <button
                        key={color}
                        className={`color-option ${
                          colorSeleccionado === color
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setColorSeleccionado(color)
                        }
                      >
                        <span
                          className={`color-circle ${colorClase(
                            color
                          )}`}
                        />

                        {color}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="product-option">
                <div className="option-title">
                  <strong>Talle</strong>

                  {talleSeleccionado && (
                    <span>
                      Seleccionado:{" "}
                      {talleSeleccionado}
                    </span>
                  )}
                </div>

                <div className="size-options">
                  {productoSeleccionado.talles.map(
                    (talle) => (
                      <button
                        key={talle}
                        className={`size-option ${
                          talleSeleccionado === talle
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setTalleSeleccionado(talle)
                        }
                      >
                        {talle}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="personalizer-box">
                <span className="personalizer-number">
                  01
                </span>

                <div>
                  <strong>Agregá tu diseño</strong>

                  <p>
                    Subí tu imagen y ubicala
                    directamente sobre la prenda.
                  </p>
                </div>
              </div>

              <button
                className="start-design-button"
                disabled={!talleSeleccionado}
                onClick={iniciarPersonalizador}
              >
                {talleSeleccionado
                  ? "Continuar con el diseño"
                  : "Elegí un talle para continuar"}
              </button>

              <p className="product-help">
                Vista previa antes de comprar
              </p>
            </section>
          </div>
        </main>

        <Carrito />
      </div>
    );
  }

  /* ================================= */
  /* HOME */
  /* ================================= */

  return (
    <div className="app">
      <Header />

      <main>
        <section
          className="hero hero-youth hero-tintaviva"
          id="inicio"
        >
          <div className="hero-content hero-content-tintaviva">
            <div className="hero-kicker tintaviva-kicker">
              <span className="hero-kicker-dot"></span>
              TU IDEA · TU PRENDA · TU ESTILO
            </div>

            <h1 className="hero-title tintaviva-title">
              TU IDEA
              <span>COBRA VIDA.</span>
            </h1>

            <p className="hero-description tintaviva-description">
              Diseñá una prenda que no exista todavía. Subí tu arte,
              elegí colores, mové cada detalle y convertí una idea
              en algo que puedas vestir.
            </p>

            <div className="hero-actions tintaviva-actions">
              <a
                href="#productos"
                className="primary-button tintaviva-primary"
              >
                Crear mi prenda
                <span className="button-arrow">→</span>
              </a>

              <a
                href="#productos"
                className="secondary-button tintaviva-secondary"
              >
                Ver colección
              </a>
            </div>

            <div className="hero-mini-info tintaviva-mini-info">
              <span>01 ELEGÍ</span>
              <span>02 CREÁ</span>
              <span>03 VESTÍ</span>
            </div>
          </div>

          <div className="hero-art hero-art-youth hero-art-tintaviva">
            <div className="ink-orbit ink-orbit-one"></div>
            <div className="ink-orbit ink-orbit-two"></div>
            <div className="ink-drop ink-drop-yellow"></div>
            <div className="ink-drop ink-drop-blue"></div>
            <div className="ink-drop ink-drop-coral"></div>

            <div className="hero-word tintaviva-word tintaviva-word-one">
              TINTA
            </div>

            <div className="hero-word tintaviva-word tintaviva-word-two">
              VIVA
            </div>

            <div className="hero-clothing hero-clothing-youth hero-clothing-tintaviva">
              <img
                src="/productos/remera-oversize/blanco.png"
                alt="Remera oversize blanca TintaViva"
              />

              <div className="hero-shirt-print tintaviva-shirt-print">
                <span>CREÁ</span>
                <strong>LO TUYO</strong>
              </div>
            </div>

            <div className="tintaviva-tag tintaviva-tag-top">
              HECHO
              <span>POR VOS</span>
            </div>

            <div className="tintaviva-tag tintaviva-tag-bottom">
              TINTA
              <span>EN MOVIMIENTO</span>
            </div>

            <div className="ink-signature">
              <span>✦</span>
              DISEÑÁ · VESTÍ · REPETÍ
            </div>
          </div>
        </section>

        <section
          className="steps"
          id="como-funciona"
        >
          <div className="step">
            <span>01</span>

            <div>
              <h3>Elegí</h3>
              <p>Seleccioná tu remera o buzo.</p>
            </div>
          </div>

          <div className="step">
            <span>02</span>

            <div>
              <h3>Diseñá</h3>
              <p>Subí tu imagen y personalizala.</p>
            </div>
          </div>

          <div className="step">
            <span>03</span>

            <div>
              <h3>Usalo</h3>

              <p>
                Convertí tu idea en una prenda única.
              </p>
            </div>
          </div>
        </section>

        <section
          className="products-section"
          id="productos"
        >
          <div className="section-header">
            <div>
              <span className="section-label">
                COLECCIÓN BASE
              </span>

              <h2>Elegí la prenda. El diseño es tuyo.</h2>
            </div>

            <p>
              Remeras y buzos listos para convertir tu idea en algo que puedas usar.
            </p>
          </div>

          <div className="products-grid tintaviva-products-grid">
            {productos.map((producto, index) => (
              <article
                className={`product-card pop-product-card tintaviva-product-card pop-product-${producto.id}`}
                key={producto.id}
              >
                <button
                  className="product-image tintaviva-product-image"
                  onClick={() => abrirProducto(producto)}
                >
                  <span className="product-ink product-ink-a" aria-hidden="true" />
                  <span className="product-ink product-ink-b" aria-hidden="true" />
                  <span className="product-spark" aria-hidden="true">✦</span>

                  <span className="product-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <img
                    src={obtenerImagenProducto(
                      producto,
                      producto.colores[0]
                    )}
                    alt={producto.nombre}
                  />

                  <div className="product-badge">
                    TU LIENZO
                  </div>
                </button>

                <div className="product-info tintaviva-product-info">
                  <div className="product-info-topline">
                    <span className="card-category">
                      {producto.categoria}
                    </span>
                    <span className="product-signature">TINTAVIVA</span>
                  </div>

                  <h3>{producto.nombre}</h3>

                  <p>{producto.descripcion}</p>

                  <div className="product-meta-row">
                    <div className="available-colors">
                      {producto.colores.map((color) => (
                        <span
                          key={color}
                          title={color}
                          className={`mini-color ${colorClase(color)}`}
                        />
                      ))}
                    </div>

                    <span className="product-color-count">
                      {producto.colores.length} colores
                    </span>
                  </div>

                  <div className="product-footer">
                    <div className="product-price-block">
                      <span>DESDE</span>
                      <strong>{formatearPrecio(producto.precio)}</strong>
                    </div>

                    <button onClick={() => abrirProducto(producto)}>
                      Crear la mía →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="custom-section">
          <div>
            <span>
              NO USES LO MISMO QUE TODOS
            </span>

            <h2>
              Hacé algo que sea bien tuyo.
            </h2>
          </div>

          <a href="#productos">
            Crear ahora ↗
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-brand">
          <img
            src="/logo-tintaviva.png"
            alt="TintaViva"
            className="footer-logo"
          />

          <p>
            Diseñá. Vestilo. Hacelo tuyo.
          </p>

          <span>© 2026 TintaViva</span>
        </div>

        <nav
          className="site-footer-links"
          aria-label="Información de la tienda"
        >
          <a href="/terminos">
            Términos y condiciones
          </a>
          <a href="/cambios-devoluciones">
            Cambios y devoluciones
          </a>
          <a href="/privacidad">
            Política de privacidad
          </a>
          <a href="/envios">
            Envíos y retiros
          </a>
          <a
            href="/arrepentimiento"
            className="site-footer-regret"
          >
            Botón de arrepentimiento
          </a>
        </nav>
      </footer>

      <LegalFloatingButton />
      <WhatsAppButton />
      <Carrito />
    </div>
  );
}

export default App;