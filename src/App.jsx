import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import InvoicePage from "./pages/InvoicePage";
import CustomersPage from "./pages/CustomersPage";
import StatisticPage from "./pages/StatisticPage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ProductPage from "./pages/ProductPage";
import VendorPage from "./pages/Vendors";
import VendorsList from "./pages/VendorsList";
import NotFoundPage from "./pages/NotFoundPage";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function App() {
  const cart = useSelector((state) => state.cart);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RouteControl>
              <HomePage />
            </RouteControl>
          }
        />
        <Route
          path="/cart"
          element={
            <RouteControl>
              <CartPage />
            </RouteControl>
          }
        />
        <Route
          path="/invoices"
          element={
            <RouteControl>
              <InvoicePage />
            </RouteControl>
          }
        />
        <Route
          path="/customers"
          element={
            <RouteControl>
              <CustomersPage />
            </RouteControl>
          }
        />
        <Route
          path="/statistics"
          element={
            <RouteControl>
              <StatisticPage />
            </RouteControl>
          }
        />
        <Route
          path="/products"
          element={
            <RouteControl>
              <ProductPage />
            </RouteControl>
          }
        />
        <Route
          path="/vendor"
          element={
            <RouteControl>
              <VendorPage />
            </RouteControl>
          }
          
        />
         <Route
          path="/vendor-list"
          element={
            <RouteControl>
              <VendorsList />
            </RouteControl>
          }
          
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

export const RouteControl = ({ children }) => {
  const token = JSON.parse(localStorage.getItem("postUser"))?.token;

  if (token) {
    // console.log("token", token);
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = (new Date().getTime() + 1) / 1000;

      if (currentTime >= decodedToken.exp) {
        localStorage.clear();
        return <Navigate to="/login" />;
      } else {
        return children;
      }
    } catch (error) {
      localStorage.clear();
      return <Navigate to="/login" />;
    }
  } else {
    return <Navigate to="/login" />;
  }
};
