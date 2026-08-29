import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
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

  const [carritoAbierto, setCarritoAbierto] = useState(false);

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
    localStorage.setItem("tintaviva-carrito", JSON.stringify(carrito));
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

  const cambiarLado = (lado) => {
    setArrastrando(false);
    setLadoSeleccionado(lado);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const volverInicio = () => {
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
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
    setProductoSeleccionado(producto);
    setColorSeleccionado(producto.colores[0]);
    setTalleSeleccionado("");

    setModoPersonalizar(false);
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
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
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

    event.preventDefault();
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

  const agregarAlCarrito = () => {
    const tieneDiseno =
      Boolean(personalizaciones.frente.imagen) ||
      Boolean(personalizaciones.espalda.imagen) ||
      Boolean(personalizaciones.frente.texto?.contenido.trim()) ||
      Boolean(personalizaciones.espalda.texto?.contenido.trim());

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
      precio: productoSeleccionado.precio,
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
      cantidad: 1,
    };

    setCarrito((actual) => [...actual, nuevoItem]);
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
      actual.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              cantidad: Math.max(1, item.cantidad - 1),
            }
          : item
      )
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

  const continuarCompra = () => {
    if (carrito.length === 0) return;

    alert("Checkout y Mercado Pago se conectarán más adelante.");
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
        <span className="product-header-label">
          {texto}
        </span>
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
                        const ladoPreview =
                          item.disenos?.frente?.imagen
                            ? "frente"
                            : "espalda";
                        const disenoPreview = item.disenos?.[ladoPreview];
                        const imagenPrenda =
                          item.imagenesProducto?.[ladoPreview] ||
                          item.imagenProducto ||
                          "";

                        return (
                          <>
                            <img
                              className="cart-garment"
                              src={imagenPrenda}
                              alt={`${item.nombre} ${ladoPreview}`}
                            />

                            {disenoPreview?.imagen && (
                              <img
                                className="cart-design"
                                src={disenoPreview.imagen}
                                alt={`Diseño ${ladoPreview}`}
                                style={{
                                  left: `${disenoPreview.posicion.x}%`,
                                  top: `${disenoPreview.posicion.y}%`,
                                  width: `${disenoPreview.tamano}%`,
                                }}
                              />
                            )}

                            <span className="cart-side-badge">
                              {item.disenos?.frente?.imagen &&
                              item.disenos?.espalda?.imagen
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
                        </div>

                        <button
                          className="remove-cart-item"
                          onClick={() =>
                            eliminarDelCarrito(item.cartId)
                          }
                        >
                          ×
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              disminuirCantidad(item.cartId)
                            }
                          >
                            −
                          </button>

                          <span>{item.cantidad}</span>

                          <button
                            onClick={() =>
                              aumentarCantidad(item.cartId)
                            }
                          >
                            +
                          </button>
                        </div>

                        <strong>
                          {formatearPrecio(
                            item.precio * item.cantidad
                          )}
                        </strong>
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

                <div className="cart-total-row">
                  <span>Total</span>

                  <strong>
                    {formatearPrecio(totalCarrito)}
                  </strong>
                </div>

                <p className="cart-shipping-note">
                  Envío calculado más adelante
                </p>

                <button
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
  /* PERSONALIZADOR */
  /* ================================= */

  if (productoSeleccionado && modoPersonalizar) {
    return (
      <div className="app">
        <Header texto="Estudio de diseño" />

        <main className="designer-page">
          <button
            className="back-button"
            onClick={() => setModoPersonalizar(false)}
          >
            ← Volver al producto
          </button>

          <div className="designer-layout">
            <section className="designer-preview-panel">
              <div className="designer-preview-header">
                <div>
                  <span>VISTA PREVIA</span>

                  <h2>{productoSeleccionado.nombre}</h2>
                </div>

                <span className="preview-help">
                  Arrastrá tu diseño sobre la prenda
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
                <img
                  className="garment-image"
                  src={obtenerImagenProducto(
                    productoSeleccionado,
                    colorSeleccionado,
                    ladoSeleccionado
                  )}
                  alt={`${productoSeleccionado.nombre} ${colorSeleccionado} ${ladoSeleccionado}`}
                />

              {personalizacionActual.imagen && (
                  <img
                    src={personalizacionActual.imagen}
                    alt="Diseño personalizado"
                    className="custom-design-image"
                    style={{
                      left: `${personalizacionActual.posicion.x}%`,
                      top: `${personalizacionActual.posicion.y}%`,
                      width: `${personalizacionActual.tamano}%`,
                    }}
                    onMouseDown={(event) => iniciarArrastre(event, "imagen")}
                    onTouchStart={() => setArrastrando("imagen")}
                    onTouchMove={(event) => moverTouch(event, "imagen")}
                    onTouchEnd={detenerArrastre}
                    draggable={false}
                  />
                )}

                {personalizacionActual.texto?.contenido.trim() && (
                  <div
                    className="custom-text-design"
                    style={{
                      left: `${personalizacionActual.texto.posicion.x}%`,
                      top: `${personalizacionActual.texto.posicion.y}%`,
                      fontSize: `${personalizacionActual.texto.tamano}px`,
                      color: personalizacionActual.texto.color,
                      fontFamily: personalizacionActual.texto.fuente,
                      fontWeight: personalizacionActual.texto.negrita ? 800 : 400,
                      transform: `translate(-50%, -50%) rotate(${personalizacionActual.texto.rotacion}deg)`,
                    }}
                    onMouseDown={(event) => iniciarArrastre(event, "texto")}
                    onTouchStart={() => setArrastrando("texto")}
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
                      productoSeleccionado.precio
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <aside className={`designer-controls tool-${herramientaActiva}`}>
              <span className="designer-step">TINTAVIVA STUDIO</span>

              <h1>Hacelo tuyo.</h1>

              <p className="designer-intro">
                Elegí el lado, sumá tu arte o texto y ajustalo directamente sobre la prenda.
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
                  Diseño
                </button>
                <button
                  className={herramientaActiva === "texto" ? "active" : ""}
                  onClick={() => setHerramientaActiva("texto")}
                >
                  Texto
                </button>
                <button
                  className={herramientaActiva === "capas" ? "active" : ""}
                  onClick={() => setHerramientaActiva("capas")}
                >
                  Capas
                </button>
              </div>

              <div className="editor-panel-layers designer-control-section">
                <div className="control-title">
                  <strong>Capas del {ladoSeleccionado === "frente" ? "frente" : "dorso"}</strong>
                  <span>{[personalizacionActual.imagen, personalizacionActual.texto?.contenido.trim()].filter(Boolean).length} activas</span>
                </div>

                <div className="layer-list-preview">
                  <div className={`layer-preview-item ${personalizacionActual.imagen ? "ready" : "empty"}`}>
                    <span className="layer-preview-icon">IMG</span>
                    <div><strong>Imagen</strong><small>{personalizacionActual.imagen ? "Diseño cargado" : "Sin imagen"}</small></div>
                    <span>{personalizacionActual.imagen ? "✓" : "—"}</span>
                  </div>
                  <div className={`layer-preview-item ${personalizacionActual.texto?.contenido.trim() ? "ready" : "empty"}`}>
                    <span className="layer-preview-icon">Aa</span>
                    <div><strong>Texto</strong><small>{personalizacionActual.texto?.contenido.trim() || "Sin texto"}</small></div>
                    <span>{personalizacionActual.texto?.contenido.trim() ? "✓" : "—"}</span>
                  </div>
                </div>
                <p className="layers-coming-note">La gestión avanzada de capas la activamos en el Sprint 1.9.6.</p>
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
                onChange={(event) => actualizarTextoActual({ contenido: event.target.value })}
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
                  <div className="designer-control-section editor-panel-design">
                    <div className="control-title">
                      <strong>Tamaño</strong>
                      <span>{personalizacionActual.tamano}%</span>
                    </div>

                    <input
                      className="size-slider"
                      type="range"
                      min={obtenerConfigPersonalizacion().tamanoMin}
                      max={obtenerConfigPersonalizacion().tamanoMax}
                      value={personalizacionActual.tamano}
                      onChange={(event) =>
                        actualizarPersonalizacionActual({ tamano: Number(event.target.value) })
                      }
                    />

                    <div className="slider-labels">
                      <span>{obtenerConfigPersonalizacion().tamanoMin}%</span>
                      <span>{obtenerConfigPersonalizacion().tamanoMax}%</span>
                    </div>

                    <div className="quick-size-buttons">
                      <button
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoMin })
                        }
                      >
                        Chico
                      </button>

                      <button
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoInicial })
                        }
                      >
                        Recomendado
                      </button>

                      <button
                        onClick={() =>
                          actualizarPersonalizacionActual({ tamano: obtenerConfigPersonalizacion().tamanoMax })
                        }
                      >
                        Máximo
                      </button>
                    </div>

                    <p className="print-area-note">
                      Área para esta prenda: {obtenerConfigPersonalizacion().etiqueta}.
                    </p>
                  </div>

                  <div className="designer-control-section editor-panel-design">
                    <div className="control-title">
                      <strong>Posición rápida</strong>
                    </div>

                    <div className="position-buttons">
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
                        Superior
                      </button>

                      <button
                        onClick={() =>
                          actualizarPersonalizacionActual({
                            posicion: { ...obtenerConfigPersonalizacion().centro },
                          })
                        }
                      >
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
                        Inferior
                      </button>
                    </div>

                    <div className="position-values">
                      <span>X: {Math.round(personalizacionActual.posicion.x)}%</span>
                      <span>Y: {Math.round(personalizacionActual.posicion.y)}%</span>
                    </div>

                    <button
                      className="reset-personalization-button"
                      onClick={() => restablecerPersonalizacion()}
                    >
                      Restablecer tamaño y posición
                    </button>
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

                <div className="summary-total">
                  <span>Total</span>

                  <strong>
                    {formatearPrecio(
                      productoSeleccionado.precio
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
                  ? "Agregar al carrito"
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
          className="hero hero-youth"
          id="inicio"
        >
          <div className="hero-content">
            <div className="hero-kicker">
              <span className="hero-kicker-dot"></span>

              PERSONALIZÁ · CREÁ · USÁ
            </div>

            <h1 className="hero-title">
              Poné tu idea
              <span>en la calle.</span>
            </h1>

            <p className="hero-description">
              Diseñá remeras y buzos únicos.
              Subí tu arte, movelo, combiná colores
              y hacelo completamente tuyo.
            </p>

            <div className="hero-actions">
              <a
                href="#productos"
                className="primary-button"
              >
                Empezar a crear
                <span className="button-arrow">↗</span>
              </a>

              <a
                href="#productos"
                className="secondary-button"
              >
                Ver prendas
              </a>
            </div>

            <div className="hero-mini-info">
              <span>✦ Diseños únicos</span>
              <span>✦ Hecho por vos</span>
              <span>✦ TintaViva</span>
            </div>
          </div>

          <div className="hero-art hero-art-youth">
            <div className="hero-word hero-word-one">
              CREATE
            </div>

            <div className="hero-word hero-word-two">
              WEAR IT
            </div>

            <div className="hero-splash hero-splash-one"></div>
            <div className="hero-splash hero-splash-two"></div>
            <div className="hero-splash hero-splash-three"></div>

            <div className="hero-clothing hero-clothing-youth">
              <img
                src="/productos/remera-oversize/blanco.png"
                alt="Remera personalizada TintaViva"
              />

              <div className="hero-shirt-print">
                <span>MAKE</span>
                <strong>IT YOURS</strong>
              </div>
            </div>

            <div className="hero-sticker hero-sticker-top">
              100%
              <span>YOUR STYLE</span>
            </div>

            <div className="hero-sticker hero-sticker-bottom">
              DROP
              <span>YOUR ART</span>
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

          <div className="products-grid">
            {productos.map((producto) => (
              <article
                className="product-card"
                key={producto.id}
              >
                <button
                  className="product-image"
                  onClick={() =>
                    abrirProducto(producto)
                  }
                >
                  <img
                    src={obtenerImagenProducto(
                      producto,
                      producto.colores[0]
                    )}
                    alt={producto.nombre}
                  />

                  <div className="product-badge">
                    PERSONALIZABLE
                  </div>
                </button>

                <div className="product-info">
                  <span className="card-category">
                    {producto.categoria}
                  </span>

                  <h3>{producto.nombre}</h3>

                  <p>{producto.descripcion}</p>

                  <div className="available-colors">
                    {producto.colores.map(
                      (color) => (
                        <span
                          key={color}
                          title={color}
                          className={`mini-color ${colorClase(
                            color
                          )}`}
                        />
                      )
                    )}
                  </div>

                  <div className="product-footer">
                    <strong>
                      {formatearPrecio(
                        producto.precio
                      )}
                    </strong>

                    <button
                      onClick={() =>
                        abrirProducto(producto)
                      }
                    >
                      Personalizar ↗
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

      <footer>
        <img
          src="/logo-tintaviva.png"
          alt="TintaViva"
          className="footer-logo"
        />

        <p>
          Diseñá. Vestilo. Hacelo tuyo.
        </p>

        <span>© 2026 TintaViva</span>
      </footer>

      <Carrito />
    </div>
  );
}

export default App;