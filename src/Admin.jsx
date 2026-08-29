import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const ESTADOS = [
  "Comprobante enviado",
  "Pago confirmado",
  "En producción",
  "Listo para entregar",
  "Enviado",
  "Entregado",
  "Cancelado",
];

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

function Admin() {
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
      const respuesta = await fetch(`${API_URL}/api/pedidos`);

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
      const respuesta = await fetch(
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
      const respuesta = await fetch(
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

  const verComprobante = (numero) => {
    window.open(
      `${API_URL}/api/pedidos/${encodeURIComponent(
        numero
      )}/comprobante`,
      "_blank",
      "noopener,noreferrer"
    );
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

        <a href="/" className="admin-store-link">
          Ver tienda ↗
        </a>
      </header>

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
                  </div>
                </section>

                <section className="admin-detail-section">
                  <div className="admin-section-title">
                    <span>03</span>
                    <strong>Prendas</strong>
                  </div>

                  <div className="admin-order-items">
                    {(pedidoSeleccionado.items || []).map(
                      (item) => (
                        <article key={item.id}>
                          <div>
                            <strong>{item.nombre}</strong>
                            <span>
                              {item.color || "—"} · Talle{" "}
                              {item.talle || "—"}
                            </span>
                          </div>

                          <div>
                            <span>x{item.cantidad}</span>
                            <strong>
                              {formatearPrecio(
                                Number(
                                  item.precio_unitario || 0
                                ) *
                                  Number(
                                    item.cantidad || 1
                                  )
                              )}
                            </strong>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </section>

                <section className="admin-detail-section admin-state-section">
                  <div className="admin-section-title">
                    <span>04</span>
                    <strong>Estado del pedido</strong>
                  </div>

                  <select
                    value={pedidoSeleccionado.estado}
                    onChange={(event) =>
                      cambiarEstado(event.target.value)
                    }
                    disabled={actualizandoEstado}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>

                  {actualizandoEstado && (
                    <small>
                      Guardando nuevo estado...
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

export default Admin;
