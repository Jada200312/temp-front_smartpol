import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import { useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inicio from "./pages/Inicio";
import Personas from "./pages/Personas";
import Candidatos from "./pages/Candidatos";
import Lideres from "./pages/Lideres";
import Digitadores from "./pages/Digitadores";
import Reportes from "./pages/Reportes";
import CreateCandidates from "./pages/CreateCandidates";
import CreateLeaders from "./pages/CreateLeaders";
import CreateDigitadores from "./pages/CreateDigitadores";
import AssignCandidates from "./pages/AssignCandidates";
import AdminPermissions from "./pages/AdminPermissions";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";

/**
 * Componente para proteger rutas que requieren rol específico
 */
function RoleBasedRoute({ requiredRoles, children }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !requiredRoles.includes(user.roleId)) {
    return <Forbidden />;
  }

  return children;
}

/**
 * Página de login con redirección automática si ya hay sesión
 */
function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Si hay usuario y ya termina de cargar, redirigir
    if (!isLoading && user) {
      navigate("/app/inicio", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Mientras carga, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar loading mientras redirige
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* Ruta pública - con redirección automática */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas dentro de Dashboard */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/* Inicio - Todos pueden acceder */}
            <Route path="inicio" element={<Inicio />} />

            {/* Personas - Superadmin, Admin campaña, Candidato, Líder, Digitador (todos) */}
            <Route path="personas" element={<Personas />} />

            {/* Candidatos - Superadmin, Admin campaña */}
            <Route
              path="candidatos"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <Candidatos />
                </RoleBasedRoute>
              }
            />

            {/* Líderes - Superadmin, Admin campaña */}
            <Route
              path="lideres"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <Lideres />
                </RoleBasedRoute>
              }
            />

            {/* Digitadores - Superadmin, Admin campaña */}
            <Route
              path="digitadores"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <Digitadores />
                </RoleBasedRoute>
              }
            />

            {/* Crear Candidatos - Superadmin, Admin campaña */}
            <Route
              path="crear-candidatos"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <CreateCandidates />
                </RoleBasedRoute>
              }
            />

            {/* Crear Líderes - Superadmin, Admin campaña */}
            <Route
              path="crear-lideres"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <CreateLeaders />
                </RoleBasedRoute>
              }
            />

            {/* Crear Digitadores - Superadmin, Admin campaña */}
            <Route
              path="crear-digitadores"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <CreateDigitadores />
                </RoleBasedRoute>
              }
            />

            {/* Asignar Candidatos - Superadmin, Admin campaña */}
            <Route
              path="asignar-candidatos"
              element={
                <RoleBasedRoute requiredRoles={[1, 2]}>
                  <AssignCandidates />
                </RoleBasedRoute>
              }
            />

            {/* Reportes - Superadmin (no), Admin campaña, Candidato, Líder */}
            <Route
              path="reportes"
              element={
                <RoleBasedRoute requiredRoles={[2, 3, 4]}>
                  <Reportes />
                </RoleBasedRoute>
              }
            />

            {/* Admin Permisos - Solo Superadmin */}
            <Route
              path="admin-permisos"
              element={
                <RoleBasedRoute requiredRoles={[1]}>
                  <AdminPermissions />
                </RoleBasedRoute>
              }
            />

            {/* Ruta por defecto dentro de Dashboard */}
            <Route index element={<Navigate to="inicio" replace />} />
          </Route>

          {/* Ruta de acceso denegado */}
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Ruta para página no encontrada - debe ser la última */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
