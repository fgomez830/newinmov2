import {
  Home,
  Building,
  Users,
  FileText,
  Wallet,
  Paperclip,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SidebarMenu() {
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
      </nav>
    </aside>
  );
}

export function SidebarItem({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition-all duration-200"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}
