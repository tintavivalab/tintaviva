import { useState } from "react";
import "./Mayoristas.css";

const WHATSAPP_NUMBER = String(
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

const CATEGORIAS = [
  {
    titulo: "Egresados",
    texto: "Remeras y buzos para cursos, viajes y promociones.",
    imagen: "/mayoristas/egresados.png",
  },
  {
    titulo: "Empresas",
    texto: "Indumentaria para equipos, eventos y acciones de marca.",
    imagen: "/mayoristas/empresas.png",
  },
  {
    titulo: "Gastronomía",
    texto: "Prendas para restaurantes, cafeterías, bares y cocinas.",
    imagen: "/mayoristas/gastronomia.png",
  },
  {
    titulo: "Comercios",
    texto: "Indumentaria para locales, supermercados y equipos de atención.",
    imagen: "/mayoristas/comercios.png",
  },
  {
    titulo: "Eventos",
    texto: "Producciones para ferias, festivales, lanzamientos y activaciones.",
    imagen: "/mayoristas/eventos.png",
  },
  {
    titulo: "Clubes y equipos",
    texto: "Prendas para clubes, grupos deportivos y comunidades.",
    imagen: "/mayoristas/clubes.png",
  },
];

function MayoristasPage() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    tipo: "Egresados",
    cantidad: "10-24",
    prenda: "Remeras",
    fecha: "",
    email: "",
    whatsapp: "",
    detalle: "",
  });

  const elegirCategoria = (titulo) => {
    setForm((actual) => ({ ...actual, tipo: titulo }));
    window.setTimeout(() => {
      document
        .getElementById("presupuesto")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const enviarPresupuesto = (event) => {
    event.preventDefault();

    if (!WHATSAPP_NUMBER) {
      alert("Configurá VITE_WHATSAPP_NUMBER en el .env del frontend.");
      return;
    }

    const mensaje = [
      "Hola, quiero pedir un presupuesto mayorista en TintaViva.",
      "",
      `Nombre: ${form.nombre}`,
      `Empresa / grupo: ${form.empresa || "No informado"}`,
      `Tipo de pedido: ${form.tipo}`,
      `Cantidad: ${form.cantidad}`,
      `Prenda: ${form.prenda}`,
      `Fecha estimada: ${form.fecha || "No informada"}`,
      `Email: ${form.email}`,
      `WhatsApp: ${form.whatsapp || "No informado"}`,
      "",
      `Idea / detalle: ${
        form.detalle || "Quiero recibir asesoramiento."
      }`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="wholesale-page">
      <header className="wholesale-topbar">
        <a href="/" className="wholesale-brand" aria-label="TintaViva inicio">
          <img src="/logo-tintaviva.png" alt="TintaViva" />
        </a>
        <a href="/" className="wholesale-back">
          ← Volver a la tienda
        </a>
      </header>

      <main>
        <section className="wholesale-hero">
          <div>
            <span className="wholesale-kicker">
              TINTAVIVA PARA EQUIPOS Y NEGOCIOS
            </span>
            <h1>Pedidos por cantidad. Diseños que representan a tu grupo.</h1>
            <p>
              Remeras y buzos personalizados para egresados, empresas,
              gastronomía, comercios, eventos, clubes y equipos.
            </p>

            <div className="wholesale-actions">
              <a href="#presupuesto">Pedir presupuesto</a>
              {WHATSAPP_NUMBER && (
                <a
                  className="is-secondary"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Hola, quiero consultar por ventas mayoristas de TintaViva."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="wholesale-highlight">
            <strong>10+</strong>
            <span>prendas por pedido</span>
            <p>
              Cotización personalizada según cantidad, prenda, diseño y
              complejidad.
            </p>
          </div>
        </section>

        <section className="wholesale-section">
          <div className="wholesale-section-head">
            <span>PARA QUIÉN ES</span>
            <h2>
              Producción personalizada para grupos, marcas y organizaciones.
            </h2>
          </div>

          <div className="wholesale-categories">
            {CATEGORIAS.map((categoria, index) => (
              <article className="wholesale-category-card" key={categoria.titulo}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{categoria.titulo}</h3>
                <p>{categoria.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wholesale-examples-section">
          <div className="wholesale-section-head">
            <span>EJEMPLOS DE TRABAJOS</span>
            <h2>Ideas para imaginar cómo puede quedar tu pedido.</h2>
            <p>
              Cada diseño puede adaptarse a los colores, logos, nombres y estilo
              de tu grupo o marca.
            </p>
          </div>

          <div className="wholesale-examples-grid">
            {CATEGORIAS.map((categoria) => (
              <article className="wholesale-example-card" key={categoria.titulo}>
                <div className="wholesale-example-image">
                  <img src={categoria.imagen} alt={`Ejemplo ${categoria.titulo}`} />
                </div>

                <div className="wholesale-example-content">
                  <span>TINTAVIVA · MAYORISTAS</span>
                  <h3>{categoria.titulo}</h3>
                  <p>{categoria.texto}</p>
                  <button
                    type="button"
                    onClick={() => elegirCategoria(categoria.titulo)}
                  >
                    Pedir presupuesto →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="wholesale-process">
          <div>
            <span>01</span>
            <h3>Contanos la idea</h3>
            <p>Tipo de prenda, cantidad, diseño y fecha estimada.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Te cotizamos</h3>
            <p>Armamos una propuesta según volumen y personalización.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Producimos</h3>
            <p>Confirmado el pedido, coordinamos producción y entrega.</p>
          </div>
        </section>

        <section className="wholesale-quote" id="presupuesto">
          <div className="wholesale-quote-copy">
            <span>PRESUPUESTO</span>
            <h2>Contanos qué necesitás.</h2>
            <p>
              La cotización cambia según cantidad, prenda, impresión y
              complejidad del diseño.
            </p>
            <div className="wholesale-ranges">
              <span>10–24 prendas</span>
              <span>25–49 prendas</span>
              <span>50–99 prendas</span>
              <span>100+ prendas</span>
            </div>
          </div>

          <form className="wholesale-form" onSubmit={enviarPresupuesto}>
            <div className="wholesale-form-grid">
              <label>
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </label>

              <label>
                Empresa / grupo
                <input
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  placeholder="Ej.: Promo 2026, Restaurante X"
                />
              </label>

              <label>
                Tipo de pedido
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria.titulo}>{categoria.titulo}</option>
                  ))}
                  <option>Otro</option>
                </select>
              </label>

              <label>
                Cantidad aproximada
                <select
                  value={form.cantidad}
                  onChange={(e) =>
                    setForm({ ...form, cantidad: e.target.value })
                  }
                >
                  <option>10-24</option>
                  <option>25-49</option>
                  <option>50-99</option>
                  <option>100+</option>
                </select>
              </label>

              <label>
                Prenda
                <select
                  value={form.prenda}
                  onChange={(e) => setForm({ ...form, prenda: e.target.value })}
                >
                  <option>Remeras</option>
                  <option>Buzos</option>
                  <option>Remeras + buzos</option>
                  <option>A definir</option>
                </select>
              </label>

              <label>
                Fecha estimada
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>

              <label>
                WhatsApp
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                  placeholder="Ej.: 11 1234 5678"
                />
              </label>
            </div>

            <label>
              Contanos tu idea
              <textarea
                rows={5}
                value={form.detalle}
                onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                placeholder="Colores, estampas, ubicación, logos, cantidades por talle..."
              />
            </label>

            <button type="submit">Solicitar presupuesto por WhatsApp</button>
          </form>
        </section>
      </main>

      <footer className="wholesale-footer">
        <div>
          <img src="/logo-tintaviva.png" alt="TintaViva" />
          <p>Diseñá. Vestilo. Hacelo tuyo.</p>
        </div>

        <nav>
          <a href="/">Tienda</a>
          <a href="/terminos">Términos</a>
          <a href="/privacidad">Privacidad</a>
          <a href="/cambios-devoluciones">Cambios y devoluciones</a>
        </nav>
      </footer>
    </div>
  );
}

export default MayoristasPage;
