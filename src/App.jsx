import { useState } from "react";

function App() {
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "Remera Clásica",
      description: "Remera personalizada para sublimación",
      price: 12000,
    },
    {
      id: 2,
      name: "Remera Premium",
      description: "Remera premium personalizada",
      price: 15000,
    },
    {
      id: 3,
      name: "Buzo Personalizado",
      description: "Buzo personalizado con tu diseño",
      price: 28000,
    },
  ];

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    alert(
      "Tu pedido está listo. El próximo paso será conectar el pago con Mercado Pago."
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#222",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#111",
          color: "#fff",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              letterSpacing: "1px",
            }}
          >
            TintaViva
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "14px",
              opacity: 0.75,
            }}
          >
            Diseñá. Personalizá. Usalo.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            color: "#111",
            padding: "10px 18px",
            borderRadius: "999px",
            fontWeight: "bold",
          }}
        >
          Carrito: {cart.length}
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          textAlign: "center",
          padding: "60px 20px 40px",
        }}
      >
        <h2
          style={{
            fontSize: "42px",
            marginBottom: "15px",
          }}
        >
          Creá tu propia remera
        </h2>

        <p
          style={{
            maxWidth: "650px",
            margin: "0 auto",
            fontSize: "18px",
            lineHeight: "1.6",
            color: "#555",
          }}
        >
          Elegí tu prenda, personalizala con tu diseño y prepará tu pedido
          desde TintaViva.
        </p>
      </section>

      {/* PRODUCTOS */}
      <main
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h2
          style={{
            marginBottom: "25px",
          }}
        >
          Productos
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  height: "180px",
                  background: "#eee",
                  borderRadius: "14px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "60px",
                  marginBottom: "20px",
                }}
              >
                👕
              </div>

              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: "22px",
                }}
              >
                {product.name}
              </h3>

              <p
                style={{
                  color: "#666",
                  minHeight: "45px",
                }}
              >
                {product.description}
              </p>

              <p
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                }}
              >
                ${product.price.toLocaleString("es-AR")}
              </p>

              <button
                onClick={() => addToCart(product)}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "12px",
                  padding: "13px",
                  background: "#111",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>

        {/* CARRITO */}
        <section
          style={{
            marginTop: "50px",
            background: "#fff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Tu carrito</h2>

          {cart.length === 0 ? (
            <p
              style={{
                color: "#777",
              }}
            >
              Todavía no agregaste productos.
            </p>
          ) : (
            <>
              <div>
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      padding: "15px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong>

                      <div
                        style={{
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        ${item.price.toLocaleString("es-AR")}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      style={{
                        border: "1px solid #ddd",
                        background: "#fff",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  Total: ${total.toLocaleString("es-AR")}
                </div>

                <button
                  onClick={handleCheckout}
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 24px",
                    background: "#8b5200",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Finalizar compra
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "60px",
          background: "#111",
          color: "#fff",
          textAlign: "center",
          padding: "28px 20px",
        }}
      >
        <strong>TintaViva</strong>

        <p
          style={{
            margin: "8px 0 0",
            opacity: 0.7,
          }}
        >
          Remeras y productos personalizados
        </p>
      </footer>
    </div>
  );
}

export default App;