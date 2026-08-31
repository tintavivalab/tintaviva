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
      precio: 20000,

      imagenes: {
        Blanco: "/productos/remera-clasica/blanco.png",
        Negro: "/productos/remera-clasica/negro.png",
        Gris: "/productos/remera-clasica/gris.png",
      },

      colores: ["Blanco", "Negro", "Gris"],
      talles: ["S", "M", "L", "XL", "XXL"],
    },

    {
      id: 2,
      nombre: "Remera Oversize",
      categoria: "Remeras",
      descripcion: "Corte urbano · Oversize · Personalizable",
      detalle:
        "Remera oversize de calce amplio, pensada para diseños grandes y una estética urbana.",
      precio: 23000,

      imagenes: {
        Blanco: "/productos/remera-oversize/blanco.png",
        Negro: "/productos/remera-oversize/negro.png",
        Gris: "/productos/remera-oversize/gris.png",
        Beige: "/productos/remera-oversize/beige.png",
      },

      colores: ["Blanco", "Negro", "Gris", "Beige"],
      talles: ["S", "M", "L", "XL"],
    },

    {
      id: 3,
      nombre: "Buzo Canguro",
      categoria: "Buzos",
      descripcion: "Con capucha · Bolsillo frontal · Personalizable",
      detalle:
        "Buzo canguro cómodo y abrigado, con capucha y amplio espacio frontal para personalizar.",
      precio: 40000,

      imagenes: {
        Blanco: "/productos/buzo-canguro/blanco.png",
        Negro: "/productos/buzo-canguro/negro.png",
        Gris: "/productos/buzo-canguro/gris.png",
        Azul: "/productos/buzo-canguro/azul.png",
      },

      colores: ["Blanco", "Negro", "Gris", "Azul"],
      talles: ["S", "M", "L", "XL", "XXL"],
    },

    {
      id: 4,
      nombre: "Buzo Crewneck",
      categoria: "Buzos",
      descripcion: "Cuello redondo · Minimalista · Personalizable",
      detalle:
        "Buzo de cuello redondo con terminaciones cómodas, ideal para estampados centrales.",
      precio: 35000,

      imagenes: {
        Blanco: "/productos/buzo-crewneck/blanco.png",
        Negro: "/productos/buzo-crewneck/negro.png",
        Gris: "/productos/buzo-crewneck/gris.png",
        Beige: "/productos/buzo-crewneck/beige.png",
      },

      colores: ["Blanco", "Negro", "Gris", "Beige"],
      talles: ["S", "M", "L", "XL"],
    },
  ];

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [talleSeleccionado, setTalleSeleccionado] = useState("");

  const [modoPersonalizar, setModoPersonalizar] = useState(false);
  const [imagenDiseno, setImagenDiseno] = useState(null);

  const [posicion, setPosicion] = useState({
    x: 50,
    y: 42,
  });

  const [tamano, setTamano] = useState(34);
  const [rotacion, setRotacion] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

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

  const obtenerImagenProducto = (producto, color = null) => {
    if (!producto) return "";

    const colorFinal =
      color ||
      colorSeleccionado ||
      producto.colores?.[0];

    return (
      producto.imagenes?.[colorFinal] ||
      Object.values(producto.imagenes || {})[0] ||
      ""
    );
  };

  const volverInicio = () => {
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
    setImagenDiseno(null);

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
    setImagenDiseno(null);

    setPosicion({
      x: 50,
      y: 42,
    });

    setTamano(34);
    setRotacion(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cerrarProducto = () => {
    setProductoSeleccionado(null);
    setModoPersonalizar(false);
    setImagenDiseno(null);

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
      setImagenDiseno(lector.result);

      setPosicion({
        x: 50,
        y: 42,
      });

      setTamano(34);
      setRotacion(0);
    };

    lector.readAsDataURL(archivo);
  };

  const eliminarDiseno = () => {
    setImagenDiseno(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const calcularPosicion = (clientX, clientY) => {
    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPosicion({
      x: Math.max(15, Math.min(85, x)),
      y: Math.max(20, Math.min(75, y)),
    });
  };

  const iniciarArrastre = (event) => {
    if (!imagenDiseno) return;

    event.preventDefault();
    setArrastrando(true);
  };

  const moverMouse = (event) => {
    if (!arrastrando) return;

    calcularPosicion(event.clientX, event.clientY);
  };

  const detenerArrastre = () => {
    setArrastrando(false);
  };

  const moverTouch = (event) => {
    if (!imagenDiseno) return;

    const touch = event.touches[0];

    if (!touch) return;

    calcularPosicion(touch.clientX, touch.clientY);
  };

  const moverDiseno = (direccion) => {
    const paso = 2;

    setPosicion((actual) => {
      let x = actual.x;
      let y = actual.y;

      if (direccion === "izquierda") x -= paso;
      if (direccion === "derecha") x += paso;
      if (direccion === "arriba") y -= paso;
      if (direccion === "abajo") y += paso;

      return {
        x: Math.max(15, Math.min(85, x)),
        y: Math.max(20, Math.min(75, y)),
      };
    });
  };

  const centrarDiseno = () => {
    setPosicion({ x: 50, y: 42 });
  };

  const restablecerDiseno = () => {
    setPosicion({ x: 50, y: 42 });
    setTamano(34);
    setRotacion(0);
  };

  const agregarAlCarrito = () => {
    if (
      !productoSeleccionado ||
      !colorSeleccionado ||
      !talleSeleccionado ||
      !imagenDiseno
    ) {
      return;
    }

    const nuevoItem = {
      cartId: `${productoSeleccionado.id}-${Date.now()}`,
      productoId: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,

      imagenProducto: obtenerImagenProducto(
        productoSeleccionado,
        colorSeleccionado
      ),

      precio: productoSeleccionado.precio,
      color: colorSeleccionado,
      talle: talleSeleccionado,
      diseno: imagenDiseno,

      posicion: {
        ...posicion,
      },

      tamano,
      rotacion,
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
                      <img
                        className="cart-garment"
                        src={item.imagenProducto}
                        alt={item.nombre}
                      />

                      <img
                        className="cart-design"
                        src={item.diseno}
                        alt="Diseño personalizado"
                        style={{
                          left: `${item.posicion.x}%`,
                          top: `${item.posicion.y}%`,
                          width: `${item.tamano}%`,
                          transform: `translate(-50%, -50%) rotate(${item.rotacion ?? 0}deg)`,
                        }}
                      />
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
                    colorSeleccionado
                  )}
                  alt={`${productoSeleccionado.nombre} ${colorSeleccionado}`}
                />

                {imagenDiseno && (
                  <img
                    src={imagenDiseno}
                    alt="Diseño personalizado"
                    className="custom-design-image"
                    style={{
                      left: `${posicion.x}%`,
                      top: `${posicion.y}%`,
                      width: `${tamano}%`,
                      transform: `translate(-50%, -50%) rotate(${rotacion}deg)`,
                    }}
                    onMouseDown={iniciarArrastre}
                    onTouchStart={() =>
                      setArrastrando(true)
                    }
                    onTouchMove={moverTouch}
                    onTouchEnd={detenerArrastre}
                    draggable={false}
                  />
                )}

                {!imagenDiseno && (
                  <div className="print-area-guide">
                    <span>Área de impresión</span>
                  </div>
                )}
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
                  <span>Precio</span>

                  <strong>
                    {formatearPrecio(
                      productoSeleccionado.precio
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <aside className="designer-controls">
              <span className="designer-step">
                PASO 02
              </span>

              <h1>Creá tu diseño</h1>

              <p className="designer-intro">
                Subí una imagen, ajustá el tamaño y
                ubicála sobre la prenda.
              </p>

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

              <div className="upload-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={cargarImagen}
                  hidden
                />

                {!imagenDiseno ? (
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
                      <strong>Subir diseño</strong>
                      <small>PNG, JPG o WEBP</small>
                    </div>
                  </button>
                ) : (
                  <div className="uploaded-design">
                    <div className="uploaded-preview">
                      <img
                        src={imagenDiseno}
                        alt="Diseño subido"
                      />
                    </div>

                    <div className="uploaded-info">
                      <strong>Diseño cargado</strong>
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

              {imagenDiseno && (
                <>
                  <div className="designer-control-section">
                    <div className="control-title">
                      <strong>Tamaño</strong>
                      <span>{tamano}%</span>
                    </div>

                    <input
                      className="size-slider"
                      type="range"
                      min="15"
                      max="60"
                      value={tamano}
                      onChange={(event) =>
                        setTamano(Number(event.target.value))
                      }
                    />

                    <div className="slider-labels">
                      <span>Pequeño</span>
                      <span>Grande</span>
                    </div>

                    <div className="quick-size-buttons">
                      <button onClick={() => setTamano(24)}>S</button>
                      <button onClick={() => setTamano(34)}>M</button>
                      <button onClick={() => setTamano(48)}>L</button>
                    </div>
                  </div>

                  <div className="designer-control-section">
                    <div className="control-title">
                      <strong>Rotación</strong>
                      <span>{rotacion}°</span>
                    </div>

                    <input
                      className="rotation-slider"
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotacion}
                      onChange={(event) =>
                        setRotacion(Number(event.target.value))
                      }
                    />

                    <div className="rotation-buttons">
                      <button onClick={() => setRotacion(-90)}>-90°</button>
                      <button onClick={() => setRotacion(0)}>0°</button>
                      <button onClick={() => setRotacion(90)}>+90°</button>
                    </div>
                  </div>

                  <div className="designer-control-section">
                    <div className="control-title">
                      <strong>Posición</strong>
                      <span>X {Math.round(posicion.x)} · Y {Math.round(posicion.y)}</span>
                    </div>

                    <div className="position-pad">
                      <span />
                      <button
                        className="direction-button"
                        onClick={() => moverDiseno("arriba")}
                        aria-label="Mover arriba"
                      >
                        ↑
                      </button>
                      <span />

                      <button
                        className="direction-button"
                        onClick={() => moverDiseno("izquierda")}
                        aria-label="Mover a la izquierda"
                      >
                        ←
                      </button>

                      <button
                        className="center-design-button"
                        onClick={centrarDiseno}
                      >
                        Centrar
                      </button>

                      <button
                        className="direction-button"
                        onClick={() => moverDiseno("derecha")}
                        aria-label="Mover a la derecha"
                      >
                        →
                      </button>

                      <span />
                      <button
                        className="direction-button"
                        onClick={() => moverDiseno("abajo")}
                        aria-label="Mover abajo"
                      >
                        ↓
                      </button>
                      <span />
                    </div>

                    <div className="position-buttons">
                      <button onClick={() => setPosicion({ x: 50, y: 32 })}>
                        Superior
                      </button>
                      <button onClick={centrarDiseno}>Centro</button>
                      <button onClick={() => setPosicion({ x: 50, y: 52 })}>
                        Inferior
                      </button>
                    </div>
                  </div>

                  <button
                    className="reset-design-button"
                    onClick={restablecerDiseno}
                  >
                    ↺ Restablecer diseño
                  </button>

                  <div className="designer-tip">
                    <span>TIP</span>

                    <p>
                      También podés mover el diseño
                      directamente sobre la prenda con
                      el mouse o con el dedo.
                    </p>
                  </div>

                  <button
                    className="remove-design-button"
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
                disabled={!imagenDiseno}
                onClick={agregarAlCarrito}
              >
                {imagenDiseno
                  ? "Agregar al carrito"
                  : "Subí un diseño para continuar"}
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
                SHOP THE BLANK
              </span>

              <h2>Elegí tu base.</h2>
            </div>

            <p>
              Elegí una prenda, un color y un talle.
              El resto lo diseñás vos.
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