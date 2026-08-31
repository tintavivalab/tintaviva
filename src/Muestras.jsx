import "./Muestras.css";

const muestras = [
  {
    titulo: "Crazy Cat",
    descripcion:
      "Diseño ilustrado en blanco y negro con frente y espalda complementarios.",
    imagenFrente: "/muestras/gato.png",
    imagenEspalda: "/muestras/gatoespalda.png",
  },

  {
    titulo: "Abstract Face",
    descripcion:
      "Diseño artístico en negro, blanco y naranja con una estética moderna y urbana.",
    imagenFrente: "/muestras/abstract.png",
  },
];

export default function Muestras({ onVolver }) {
  const whatsapp = "5491132483391";

  const consultar = (titulo) => {
    const mensaje = encodeURIComponent(
      `Hola TintaViva, vi la muestra "${titulo}" y quisiera consultar por un diseño parecido.`
    );

    window.open(
      `https://wa.me/${whatsapp}?text=${mensaje}`,
      "_blank"
    );
  };

  return (
    <main className="muestras-page">
      <header className="muestras-header">
        <button
          className="muestras-volver"
          onClick={onVolver}
        >
          ← Volver
        </button>

        <img
          src="/logo-tintaviva.png"
          alt="TintaViva"
          className="muestras-logo"
        />
      </header>

      <section className="muestras-hero">
        <span className="muestras-eyebrow">
          INSPIRATE
        </span>

        <h1>Muestras TintaViva</h1>

        <p>
          Mirá algunos diseños y encontrá inspiración
          para crear tu propia prenda.
        </p>

        <a
          href="/"
          className="muestras-crear"
        >
          Diseñar mi prenda
        </a>
      </section>

      <section className="muestras-contenido">
        <div className="muestras-grid">
          {muestras.map((item) => (
            <article
              className="muestra-card"
              key={item.titulo}
            >
              <div
                className={`muestra-imagenes ${
                  item.imagenEspalda
                    ? "muestra-imagenes-doble"
                    : "muestra-imagenes-simple"
                }`}
              >
                <div className="muestra-imagen-item">
                  <img
                    src={item.imagenFrente}
                    alt={item.titulo}
                    loading="lazy"
                  />
                </div>

                {item.imagenEspalda && (
                  <div className="muestra-imagen-item">
                    <img
                      src={item.imagenEspalda}
                      alt={item.titulo}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              <div className="muestra-info">
                <h2>{item.titulo}</h2>

                <p>{item.descripcion}</p>

                <button
                  onClick={() =>
                    consultar(item.titulo)
                  }
                >
                  Quiero algo así
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="muestras-cta">
        <h2>¿Tenés una idea propia?</h2>

        <p>
          Mandanos tu diseño, referencia o idea y te
          ayudamos a crearla.
        </p>

        <button
          onClick={() =>
            consultar("un diseño personalizado")
          }
        >
          Consultar por WhatsApp
        </button>
      </section>

      <footer className="muestras-footer">
        <strong>TintaViva</strong>
        <span>La tinta cobra vida.</span>
        <span>tintaviva.ar</span>
      </footer>
    </main>
  );
}