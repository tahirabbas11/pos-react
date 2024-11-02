import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const StatisticPage = lazy(() => import('./pages/StatisticPage'));
const Register = lazy(() => import('./pages/auth/Register'));
const Login = lazy(() => import('./pages/auth/Login'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const VendorPage = lazy(() => import('./pages/Vendors'));
const VendorsList = lazy(() => import('./pages/VendorsList'));
const Expenses = lazy(() => import('./pages/Expenses'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
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
          <Route
            path="/expenses"
            element={
              <RouteControl>
                <Expenses />
              </RouteControl>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

export const RouteControl = ({ children }) => {
  const token = JSON.parse(localStorage.getItem('postUser'))?.token;

  if (token) {
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
