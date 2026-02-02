import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          lg:hidden`}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 shadow-sm
          flex flex-col transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center px-6 py-8 border-b">
          <img src={Logo} alt="SmartPol" className="w-24 mb-3" />
          <h3 className="text-xl font-bold text-gray-800 tracking-wide">
            Smart<span className="text-orange-500">Pol</span>
          </h3>
          <span className="text-xs text-gray-400 mt-1">
            Panel de administración
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li>
              <Link
                to="/app/personas"
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive("/app/personas")
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                  }`}
              >
                <span className="ml-3">Personas</span>
              </Link>
            </li>
            <li>
              <Link
                to="/app/reportes"
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive("/app/reportes")
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                  }`}
              >
                <span className="ml-3">Informes</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} SmartPol
        </div>
      </aside>
    </>
  );
}
