import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { GraficDoughnut } from "../components/GraficDoughnut";
import { useUser } from "../context/UserContext";
import { usePermission } from "../hooks/usePermission";
import {
  getVotersWithAssignments,
  getVotersByCandidateWithAssignments,
  getVotersByLeaderWithAssignments,
} from "../api/voters";
import {
  getCandidateByUserId,
  getCandidatesWithPagination,
} from "../api/candidates";
import { getLeaderByUserId, getLeadersWithPagination } from "../api/leaders";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { can } = usePermission();

  // Estados para conteos dinámicos
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalLeaders, setTotalLeaders] = useState(0);
  const [votesStats, setVotesStats] = useState({
    totalPendientes: 150,
    totalRegisteredVotes: 350,
  });
  const [candidateId, setCandidateId] = useState(null);
  const [leaderId, setLeaderId] = useState(null);
  const [loadingVoters, setLoadingVoters] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  // Cargar candidateId o leaderId según el rol
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Si es candidato, obtener su candidateId
        if (user.roleId === 3) {
          try {
            const candidate = await getCandidateByUserId(user.id);
            if (candidate?.id) {
              setCandidateId(candidate.id);
            }
          } catch (err) {
            console.error("Error loading candidate:", err);
          }
        }

        // Si es líder, obtener su leaderId
        if (user.roleId === 4) {
          try {
            const leader = await getLeaderByUserId(user.id);
            if (leader?.id) {
              setLeaderId(leader.id);
            }
          } catch (err) {
            console.error("Error loading leader:", err);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    loadData();
  }, [user]);

  // Cargar total de votantes dinámicamente
  useEffect(() => {
    const fetchVoterCount = async () => {
      setLoadingVoters(true);
      try {
        let data;

        // Obtener datos según el rol
        if (user?.roleId === 3 && candidateId) {
          // Candidato: obtener votantes del candidato
          data = await getVotersByCandidateWithAssignments(candidateId, 1, 1);
        } else if (user?.roleId === 4 && leaderId) {
          // Líder: obtener votantes del líder
          data = await getVotersByLeaderWithAssignments(leaderId, 1, 1);
        } else {
          // Admin de campaña (roleId=2) o digital: obtener votantes de su organización
          // El backend filtra automáticamente por organización según el rol del usuario
          data = await getVotersWithAssignments(1, 1);
        }

        if (data?.total !== undefined) {
          setTotalVoters(data.total);
        }
      } catch (err) {
        console.error("Error loading voter count:", err);
        setTotalVoters(0);
      } finally {
        setLoadingVoters(false);
      }
    };

    if (user) {
      // Esperar a que se cargue candidateId o leaderId si es necesario
      if (user.roleId === 3 && candidateId === null) return;
      if (user.roleId === 4 && leaderId === null) return;

      fetchVoterCount();
    }
  }, [user, candidateId, leaderId]);

  // Cargar total de candidatos dinámicamente
  useEffect(() => {
    const fetchCandidateCount = async () => {
      setLoadingCandidates(true);
      try {
        const data = await getCandidatesWithPagination(1, 1, "");

        if (data?.total !== undefined) {
          setTotalCandidates(data.total);
        }
      } catch (err) {
        console.error("Error loading candidate count:", err);
        setTotalCandidates(0);
      } finally {
        setLoadingCandidates(false);
      }
    };

    if (user) {
      fetchCandidateCount();
    }
  }, [user]);

  // Cargar total de líderes dinámicamente
  useEffect(() => {
    const fetchLeaderCount = async () => {
      setLoadingLeaders(true);
      try {
        const data = await getLeadersWithPagination(1, 1, "");

        if (data?.total !== undefined) {
          setTotalLeaders(data.total);
        }
      } catch (err) {
        console.error("Error loading leader count:", err);
        setTotalLeaders(0);
      } finally {
        setLoadingLeaders(false);
      }
    };

    if (user) {
      fetchLeaderCount();
    }
  }, [user]);

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
                {/* Card Votantes - Solo si tiene permiso voters:read */}
                {can("voters:read") && (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-4xl font-bold text-orange-500">
                        {loadingVoters ? "..." : totalVoters}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                        Votantes
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Candidatos - Solo si tiene permiso candidates:read */}
                {can("candidates:read") && (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-4xl font-bold text-orange-500">
                        {loadingCandidates ? "..." : totalCandidates}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                        Candidatos
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Votos Registrados - Solo si tiene permiso reports:read */}
                {can("reports:read") && (
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
                )}

                {/* Card Votos Pendientes - Solo si tiene permiso reports:read */}
                {can("reports:read") && (
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
                )}

                {/* Card Líderes - Solo si tiene permiso leaders:read */}
                {can("leaders:read") && (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-4xl font-bold text-orange-500">
                        {loadingLeaders ? "..." : totalLeaders}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
                        Líderes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ====== FILA 2: Gráfico - Solo si tiene permiso reports:read ====== */}
              {can("reports:read") && (
                <div
                  className="flex justify-start items-center mb-8"
                  style={{ height: "340px", width: "100%" }}
                >
                  <div style={{ width: "400px", height: "100%" }}>
                    <GraficDoughnut
                      totalPendientes={votesStats.totalPendientes}
                      totalRegisteredVotes={votesStats.totalRegisteredVotes}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenido de las sub-páginas renderizadas por el Outlet */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
