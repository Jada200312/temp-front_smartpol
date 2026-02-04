import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useUser();
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

  // Roles que pueden ver personas: todos
  const canSeePersonas = true;

  // Roles que pueden crear: Superadmin y Admin de campaña
  const canCreate = isSuperadmin || isAdminCampaign;

  // Roles que pueden ver reportes: Admin campaña, Candidato, Líder (NO Superadmin, NO Digitador)
  const canSeeReportes = isAdminCampaign || isCandidate || isLeader;

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

            {/* Personas - Todos */}
            {canSeePersonas && (
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
            )}

            {/* Digitadores - Superadmin, Admin campaña */}
            {(isSuperadmin || isAdminCampaign) && (
              <li>
                <Link
                  to="/app/digitadores"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/digitadores")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Digitadores</span>
                </Link>
              </li>
            )}

            {/* Candidatos - Superadmin, Admin campaña */}
            {canCreate && (
              <li>
                <Link
                  to="/app/candidatos"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/candidatos")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Candidatos</span>
                </Link>
              </li>
            )}

            {/* Líderes - Superadmin, Admin campaña */}
            {canCreate && (
              <li>
                <Link
                  to="/app/lideres"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/lideres")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Líderes</span>
                </Link>
              </li>
            )}

            {/* Asignar Candidatos - Superadmin, Admin campaña */}
            {canCreate && (
              <li>
                <Link
                  to="/app/asignar-candidatos"
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive("/app/asignar-candidatos")
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                  <span className="ml-3">Asignar Candidatos</span>
                </Link>
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
