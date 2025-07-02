import { Building2, HomeIcon, ScrollText } from "lucide-react";
import houseImage from "../assets/houseHome.jpg";

export default function Home() {
  return (
    <main className="ml-64 p-10 min-h-screen w-full bg-gray-50 overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row items-center gap-8">
        {/* Text Section */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Fernando Gómez e Hijos
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Bienvenido a nuestro sistema gestor de inmuebles. Esta herramienta
            ha sido creada para facilitar el manejo y administración de
            propiedades, arriendos, contratos y cartera, todo desde una
            plataforma centralizada y eficiente.
          </p>

          <div className="flex flex-col gap-4 text-gray-700">
            <Feature icon={<HomeIcon className="text-teal-600" />}>
              Gestión de inmuebles residenciales y comerciales
            </Feature>
            <Feature icon={<Building2 className="text-teal-600" />}>
              Administración de arriendos y ocupación
            </Feature>
            <Feature icon={<ScrollText className="text-teal-600" />}>
              Control y digitalización de contratos y anexos
            </Feature>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1">
          <img
            src={houseImage}
            alt="houseHome"
            className="rounded-2xl shadow-lg w-full h-auto object-cover"
          />
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-teal-100 p-2 rounded-full">{icon}</div>
      <p className="text-base">{children}</p>
    </div>
  );
}
