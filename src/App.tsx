import "./App.css";
import Login from "./pages/Login.tsx";
import Inmuebles from "./pages/inmuebles.tsx";
import { AuthProvider } from "./features/auth/authContext";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Home from "./pages/home.tsx";
import Menu from "./components/SidebarMenu.tsx";
import CLientes from "./pages/clientes.tsx";
import Contratos from "./pages/contratos.tsx";
import Cartera from "./pages/cartera.tsx";
import Anexos from "./pages/anexos.tsx";

import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>
                  <Menu />
                </div>
                <div>
                  <Home />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/inmuebles" element={<Inmuebles />} />
          <Route path="/clientes" element={<CLientes />} />
          <Route path="/Contratos" element={<Contratos />} />
          <Route path="/Cartera" element={<Cartera />} />
          <Route path="/Anexos" element={<Anexos />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
