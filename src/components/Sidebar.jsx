import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";
import { usePermission } from "../hooks/usePermission";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useUser();
  const { can } = usePermission();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const isActive = (path) => location.pathname.startsWith(path);

  // Definir acceso por rol
  // roleId: 1 = Superadmin, 2 = Admin campaña, 3 = Candidato, 4 = Líder, 5 = Digitador
  const canAccess = (roleId) => {
    if (!user) return false;
    return (
      user.roleId === roleId ||
      (Array.isArray(roleId) && roleId.includes(user.roleId))
    );
  };

  const isSuperadmin = user?.roleId === 1;
  const isAdminCampaign = user?.roleId === 2;
  const isCandidate = user?.roleId === 3;
  const isLeader = user?.roleId === 4;
  const isDigitador = user?.roleId === 5;

  // Roles que pueden ver inicio: todos
  const canSeeInicio = true;

  // Roles que pueden ver votantes: todos
  const canSeePersonas = true;

  // Roles que pueden crear: Superadmin y Admin de campaña
  const canCreate = isSuperadmin || isAdminCampaign;

  // Roles que pueden ver reportes: verifica permiso en lugar de solo roleId
  const canSeeReportes = can("reports:read");

  // Roles que pueden ver admin de permisos: solo Superadmin
  const canSeeAdminPermisos = isSuperadmin;

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

            {/* Dashboard */}
            <li>
              <Link
                to="/app/dashboard"
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive("/app/dashboard") || location.pathname === "/app"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                  }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            
            {/* Inicio - Solo Superadmin */}
            {canSeeInicio && (
              <li>
                <Link
                  to="/app/inicio"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/inicio")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Inicio</span>
                </Link>
              </li>
            )}

            {/* Votantes - Todos */}
            {canSeePersonas && (
              <li>
                <Link
                  to="/app/votantes"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/votantes")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Votantes</span>
                </Link>
              </li>
            )}

            {/* Submenu Gestión - Agrupa Candidatos, Líderes, Digitadores y Asignar Candidatos */}
            {(canCreate || isSuperadmin || isAdminCampaign || isCandidate) && (
              <li>
                <button
                  onClick={() =>
                    setExpandedMenu(
                      expandedMenu === "gestion" ? null : "gestion",
                    )
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      expandedMenu === "gestion" ||
                      isActive("/app/digitadores") ||
                      isActive("/app/candidatos") ||
                      isActive("/app/lideres") ||
                      isActive("/app/asignar-candidatos")
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Gestión</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expandedMenu === "gestion" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Submenu items */}
                {expandedMenu === "gestion" && (
                  <ul className="space-y-1 mt-2 pl-4">
                    {/* Organizaciones - Solo Superadmin */}
                {isSuperadmin && (
                  <li>
                    <Link
                      to="/app/organizaciones"
                      onClick={onClose}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          isActive("/app/organizaciones")
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                      <span>Organizaciones</span>
                    </Link>
                  </li>
                  )}

                  {/* Campañas - Superadmin y Admin de campaña */}
                {(isSuperadmin || isAdminCampaign) && (
                  <li>
                    <Link
                      to="/app/campanas"
                      onClick={onClose}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          isActive("/app/campanas")
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                      <span>Campañas</span>
                    </Link>
                  </li>
                )}
                    {/* Candidatos */}
                    {canCreate && (
                      <li>
                        <Link
                          to="/app/candidatos"
                          onClick={onClose}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isActive("/app/candidatos")
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                          <span>Candidatos</span>
                        </Link>
                      </li>
                    )}

                    {/* Líderes */}
                    {(canCreate || isCandidate) && (
                      <li>
                        <Link
                          to="/app/lideres"
                          onClick={onClose}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isActive("/app/lideres")
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                          <span>Líderes</span>
                        </Link>
                      </li>
                    )}

                    {/* Digitadores */}
                    {(isSuperadmin || isAdminCampaign) && (
                      <li>
                        <Link
                          to="/app/digitadores"
                          onClick={onClose}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isActive("/app/digitadores")
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                          <span>Digitadores</span>
                        </Link>
                      </li>
                    )}

                    {/* Asignar Candidatos */}
                    {canCreate && (
                      <li>
                        <Link
                          to="/app/asignar-candidatos"
                          onClick={onClose}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              isActive("/app/asignar-candidatos")
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                          <span>Asignar Candidatos</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Reportes - Admin campaña, Candidato, Líder (NO Superadmin, NO Digitador) */}
            {canSeeReportes && (
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
                  <span className="ml-3">Reportes</span>
                </Link>
              </li>
            )}

            {/* Admin Permisos - Solo Superadmin */}
            {canSeeAdminPermisos && (
              <li>
                <Link
                  to="/app/admin-permisos"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/admin-permisos")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Admin Permisos</span>
                </Link>
              </li>
            )}
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
