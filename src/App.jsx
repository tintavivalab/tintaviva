import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Privacy from "./pages/Privacy.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/productos"
              element={<Products />}
            />

            <Route
              path="/producto/:id"
              element={<ProductDetail />}
            />

            <Route
              path="/carrito"
              element={<Cart />}
            />

            <Route
              path="/privacy"
              element={<Privacy />}
            />

            <Route
              path="/privacidad"
              element={<Privacy />}
            />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <img
              src="/logo-tintaviva.png"
              alt="TintaViva"
              className="footer-logo"
            />

            <p>Diseñá. Vestilo. Hacelo tuyo.</p>

            <div className="footer-links">
              <a href="/privacidad">
                Política de privacidad
              </a>
            </div>

            <p className="footer-copy">
              © 2026 TintaViva
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;