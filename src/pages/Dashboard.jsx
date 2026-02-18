import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { GraficDoughnut } from "../components/GraficDoughnut";
import { VotersByCandidate } from "../components/VotersByCandidate";
import { VotersByParty } from "../components/VotersByParty";
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
  getVoterCountByCandidate,
  getVoterCountByParty,
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
  const [votersByCandidate, setVotersByCandidate] = useState([]);
  const [loadingVotersByCandidate, setLoadingVotersByCandidate] =
    useState(false);
  const [votersByParty, setVotersByParty] = useState([]);
  const [loadingVotersByParty, setLoadingVotersByParty] = useState(false);

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

  // Cargar votantes por candidato - Solo para admin de organización (roleId=2)
  useEffect(() => {
    const fetchVotersByCandidate = async () => {
      setLoadingVotersByCandidate(true);
      try {
        const data = await getVoterCountByCandidate();
        setVotersByCandidate(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading voters by candidate:", err);
        setVotersByCandidate([]);
      } finally {
        setLoadingVotersByCandidate(false);
      }
    };

    // Solo cargar para admin de organización (roleId=2)
    if (user && user.roleId === 2) {
      fetchVotersByCandidate();
    }
  }, [user]);

  // Cargar votantes por partido - Solo para admin de organización (roleId=2)
  useEffect(() => {
    const fetchVotersByParty = async () => {
      setLoadingVotersByParty(true);
      try {
        const data = await getVoterCountByParty();
        setVotersByParty(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading voters by party:", err);
        setVotersByParty([]);
      } finally {
        setLoadingVotersByParty(false);
      }
    };

    // Solo cargar para admin de organización (roleId=2)
    if (user && user.roleId === 2) {
      fetchVotersByParty();
    }
  }, [user]);

  // Solo mostrar dashboard en /app/dashboard
  const isDashboardView = location.pathname === "/app/dashboard";

  // Cargar todos los datos cuando se navega al dashboard
  useEffect(() => {
    if (!isDashboardView || !user) return;

    const loadAllDashboardData = async () => {
      try {
        // Cargar votantes
        let votersData;
        if (user.roleId === 3 && candidateId) {
          votersData = await getVotersByCandidateWithAssignments(
            candidateId,
            1,
            1,
          );
        } else if (user.roleId === 4 && leaderId) {
          votersData = await getVotersByLeaderWithAssignments(leaderId, 1, 1);
        } else {
          votersData = await getVotersWithAssignments(1, 1);
        }
        if (votersData?.total !== undefined) {
          setTotalVoters(votersData.total);
        }

        // Cargar candidatos
        const candidatesData = await getCandidatesWithPagination(1, 1, "");
        if (candidatesData?.total !== undefined) {
          setTotalCandidates(candidatesData.total);
        }

        // Cargar líderes
        const leadersData = await getLeadersWithPagination(1, 1, "");
        if (leadersData?.total !== undefined) {
          setTotalLeaders(leadersData.total);
        }

        // Cargar votantes por candidato (solo para admin)
        if (user.roleId === 2) {
          const candidateVotersData = await getVoterCountByCandidate();
          setVotersByCandidate(
            Array.isArray(candidateVotersData) ? candidateVotersData : [],
          );
        }

        // Cargar votantes por partido (solo para admin)
        if (user.roleId === 2) {
          const partyVotersData = await getVoterCountByParty();
          setVotersByParty(
            Array.isArray(partyVotersData) ? partyVotersData : [],
          );
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadAllDashboardData();
  }, [isDashboardView, user, candidateId, leaderId]);

  // Recarga automática en tiempo real cada 5 segundos
  useEffect(() => {
    // Solo recargar si estamos en la vista del dashboard
    if (!isDashboardView) return;

    const interval = setInterval(async () => {
      try {
        // Recarga de votantes
        if (user) {
          let data;
          if (user.roleId === 3 && candidateId) {
            data = await getVotersByCandidateWithAssignments(candidateId, 1, 1);
          } else if (user.roleId === 4 && leaderId) {
            data = await getVotersByLeaderWithAssignments(leaderId, 1, 1);
          } else {
            data = await getVotersWithAssignments(1, 1);
          }
          if (data?.total !== undefined) {
            setTotalVoters(data.total);
          }
        }

        // Recarga de candidatos
        if (user) {
          const candidateData = await getCandidatesWithPagination(1, 1, "");
          if (candidateData?.total !== undefined) {
            setTotalCandidates(candidateData.total);
          }
        }

        // Recarga de líderes
        if (user) {
          const leaderData = await getLeadersWithPagination(1, 1, "");
          if (leaderData?.total !== undefined) {
            setTotalLeaders(leaderData.total);
          }
        }

        // Recarga de votantes por candidato (solo para admin de organización)
        if (user && user.roleId === 2) {
          const candidateVotersData = await getVoterCountByCandidate();
          setVotersByCandidate(
            Array.isArray(candidateVotersData) ? candidateVotersData : [],
          );
        }

        // Recarga de votantes por partido (solo para admin de organización)
        if (user && user.roleId === 2) {
          const partyVotersData = await getVoterCountByParty();
          setVotersByParty(
            Array.isArray(partyVotersData) ? partyVotersData : [],
          );
        }
      } catch (err) {
        console.error("Error during auto-refresh:", err);
      }
    }, 5000); // Recarga cada 5 segundos

    return () => clearInterval(interval);
  }, [user, candidateId, leaderId, isDashboardView]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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

              {/* ====== FILA 2B: Gráficos de Votantes (Partidos + Candidatos) ====== */}
              {user?.roleId === 2 && can("candidates:read") && (
                <div className="flex flex-row gap-8 w-full">
                  {/* Gráfico de Votantes por Partido */}
                  <div
                    className="flex justify-start items-center flex-1"
                    style={{ height: "340px" }}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      <VotersByParty
                        data={loadingVotersByParty ? [] : votersByParty}
                      />
                    </div>
                  </div>

                  {/* Gráfico de Votantes por Candidato */}
                  <div
                    className="flex justify-start items-center flex-1"
                    style={{ height: "340px" }}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      <VotersByCandidate
                        data={loadingVotersByCandidate ? [] : votersByCandidate}
                      />
                    </div>
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
