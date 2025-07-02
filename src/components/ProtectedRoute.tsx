import { useAuth } from "../features/auth/authContext";
import { Navigate } from "react-router-dom";
import type { ReactNode, FC } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>; // Mejora en UX: capitalización
  }

  if (!user) {
    return <Navigate to="/login" replace />;
    // `replace` evita que el usuario pueda volver a la ruta protegida usando el botón "atrás"
  }

  return <>{children}</>;
};

export default ProtectedRoute;
