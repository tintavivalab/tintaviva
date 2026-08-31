import "./Muestras.css";

const muestras = [
  {
    titulo: "Gato Loco",
    descripcion:
      "Diseño ilustrado en blanco y negro con frente y espalda complementarios.",
    imagenFrente: "/muestras/gato-loco-frente.png",
    imagenEspalda: "/muestras/gato-loco-espalda.png",
  },
  {
    titulo: "Abstract Face",
    descripcion:
      "Diseño artístico en negro, blanco y naranja con una estética moderna y urbana.",
    imagenFrente: "/muestras/abstract-face-frente.png",
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

      <section className="muestras-como-funciona">
        <div className="muestras-como-header">
          <span>CÓMO FUNCIONA</span>

          <h2>De la idea a tu prenda.</h2>

          <p>
            Elegí una muestra, inspirate o traé tu propio diseño.
            Nosotros te ayudamos a convertirlo en una prenda única.
          </p>
        </div>

        <div className="muestras-pasos">
          <article className="muestras-paso">
            <span>01</span>

            <h3>Elegí la prenda</h3>

            <p>
              Remera clásica, oversize, buzo canguro o crewneck.
            </p>
          </article>

          <article className="muestras-paso">
            <span>02</span>

            <h3>Elegí una idea</h3>

            <p>
              Inspirate en nuestras muestras o mandanos tu propio diseño.
            </p>
          </article>

          <article className="muestras-paso">
            <span>03</span>

            <h3>Personalizá</h3>

            <p>
              Ajustá tamaño, ubicación y estilo para que quede como querés.
            </p>
          </article>

          <article className="muestras-paso">
            <span>04</span>

            <h3>Hacé tu pedido</h3>

            <p>
              Confirmá tu diseño y coordiná la producción de tu prenda.
            </p>
          </article>
        </div>
      </section>

      <section className="muestras-contenido">
        <div className="muestras-titulo-galeria">
          <span>DISEÑOS</span>
          <h2>Encontrá tu inspiración.</h2>
        </div>

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
          ayudamos a convertirla en una prenda TintaViva.
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