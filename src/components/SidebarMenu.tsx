import {
  Home,
  Building,
  Users,
  FileText,
  Wallet,
  Paperclip,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";

export default function SidebarMenu() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // El usuario será redirigido automáticamente por el contexto de autenticación
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-sm p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Menú</h2>
      <nav className="flex flex-col gap-2">
        <SidebarItem to="/" icon={<Home size={20} />}>
          Home
        </SidebarItem>
        <SidebarItem to="/Inmuebles" icon={<Building size={20} />}>
          Inmuebles
        </SidebarItem>
        <SidebarItem to="/Clientes" icon={<Users size={20} />}>
          Clientes
        </SidebarItem>
        <SidebarItem to="/Contratos" icon={<FileText size={20} />}>
          Contratos
        </SidebarItem>
        <SidebarItem to="/Cartera" icon={<Wallet size={20} />}>
          Cartera
        </SidebarItem>
        <SidebarItem to="/Anexos" icon={<Paperclip size={20} />}>
          Anexos
        </SidebarItem>
        <SidebarItem to="#" icon={<LogOut size={20} />} onClick={handleLogout}>
          Cerrar Sesión
        </SidebarItem>
      </nav>
    </aside>
  );
}

export function SidebarItem({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition-all duration-200"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}
