import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { GraficDoughnut } from "../components/GraficDoughnut";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Valores de ejemplo por ahora
  const votesStats = {
    totalPendientes: 150,
    totalRegisteredVotes: 350,
  };

  // Solo mostrar dashboard en /app/dashboard
  const isDashboardView = location.pathname === "/app/dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Sección de estadísticas - Solo mostrar en /app/dashboard */}
          {isDashboardView && (
            <div>
              {/* ====== FILA 1: Cards de métricas ====== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Card Votantes */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-4xl font-bold text-orange-500">0</p>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                      Votantes
                    </p>
                  </div>
                </div>

                {/* Card Candidatos */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-4xl font-bold text-orange-500">2</p>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                      Candidatos
                    </p>
                  </div>
                </div>

                {/* Card Votos Registrados */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-4xl font-bold text-orange-500">
                      {votesStats.totalRegisteredVotes}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                      Votos Registrados
                    </p>
                  </div>
                </div>

                {/* Card Votos Pendientes */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-4xl font-bold text-orange-500">
                      {votesStats.totalPendientes}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                      Votos Pendientes
                    </p>
                  </div>
                </div>

                {/* Card Líderes */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-4xl font-bold text-orange-500">1</p>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                      Líderes
                    </p>
                  </div>
                </div>
              </div>

              {/* ====== FILA 2: Gráfico ====== */}
              <div className="flex justify-start items-center mb-8" style={{ height: "340px", width: "100%" }}>
                <div style={{ width: "400px", height: "100%" }}>
                  <GraficDoughnut
                    totalPendientes={votesStats.totalPendientes}
                    totalRegisteredVotes={votesStats.totalRegisteredVotes}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenido de las sub-páginas renderizadas por el Outlet */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}