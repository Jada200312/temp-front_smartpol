import { useState, useEffect } from "react";
import { getVoters, deleteVoter, getAssignedCandidates } from "../api/voters";
import { getVotingBooths } from "../api/votingbooths";
import { getVotingTables } from "../api/votingtables";
import AddVoterModal from "../components/AddVoterModal";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Personas() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [search, setSearch] = useState("");
  const [voterCandidates, setVoterCandidates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  const [boothsMap, setBoothsMap] = useState({});
  const [tablesMap, setTablesMap] = useState({});
  const ITEMS_PER_PAGE = 20;

  // Cargar centros de votación y mesas una sola vez
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar centros
        const booths = await getVotingBooths();
        const boothsMapTemp = {};
        booths.forEach((booth) => {
          boothsMapTemp[booth.id] = booth;
        });
        setBoothsMap(boothsMapTemp);
        console.log("BoothsMap cargado:", boothsMapTemp);

        // Cargar mesas
        const tables = await getVotingTables();
        const tablesMapTemp = {};
        tables.forEach((table) => {
          tablesMapTemp[table.id] = table;
        });
        setTablesMap(tablesMapTemp);
        console.log("TablesMap cargado:", tablesMapTemp);
      } catch (err) {
        console.error("Error al obtener centros y mesas:", err);
      }
    };

    loadData();
  }, []);

  const fetchVoters = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await getVoters(page, ITEMS_PER_PAGE);
      setVoters(data.data);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalVoters(data.total);

      // Cargar candidatos asignados para cada votante
      const candidatesMap = {};
      for (const voter of data.data) {
        try {
          const assignedData = await getAssignedCandidates(voter.id);
          if (Array.isArray(assignedData) && assignedData.length > 0) {
            candidatesMap[voter.id] = assignedData
              .map((d) => d.candidate?.name || d.candidateName)
              .filter(Boolean);
          }
        } catch {
          // Ignorar si no hay candidatos asignados
        }
      }
      setVoterCandidates(candidatesMap);
    } catch {
      setError("No se pudieron cargar los votantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters(currentPage);
  }, [currentPage]);

  const handleEdit = (voter) => {
    setEditingVoter(voter);
    setShowModal(true);
  };

  const handleDelete = async (voterId) => {
    if (!confirm("¿Estás seguro de eliminar este votante?")) return;
    await deleteVoter(voterId);
    // Recargar la página actual
    fetchVoters(currentPage);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const enrichVoterData = (voter) => {
    let enriched = { ...voter };

    // Enriquecer con centro de votación
    if (voter.votingBoothId && boothsMap[voter.votingBoothId]) {
      enriched.votingBooth = boothsMap[voter.votingBoothId];
    }

    // Enriquecer con mesa de votación
    if (voter.votingTableId && tablesMap[voter.votingTableId]) {
      enriched.votingTable = tablesMap[voter.votingTableId];
    }

    return enriched;
  };

  const filteredVoters = search
    ? voters
        .map(enrichVoterData)
        .filter((v) => {
          const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
          const identification = v.identification?.toLowerCase() || "";
          return (
            fullName.includes(search.toLowerCase()) ||
            identification.includes(search.toLowerCase())
          );
        })
    : voters.map(enrichVoterData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Listado de Votantes
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Gestión y control estratégico de personas registradas en la campaña
          </p>
        </div>

        <button
          onClick={() => {
            setEditingVoter(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 hover:bg-orange-600 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar votante
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar por nombre o identificación..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <AddVoterModal
          voter={editingVoter}
          onClose={() => setShowModal(false)}
          onVoterAdded={fetchVoters}
        />
      )}

      {/* Estados */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          Cargando votantes...
        </div>
      )}

      {error && (
        <div className="bg-white p-6 rounded-xl text-red-600">{error}</div>
      )}

      {!loading && !error && filteredVoters.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-gray-500">
          No se encontraron resultados
        </div>
      )}

      {/* ===== DESKTOP ===== */}
      {!loading && !error && filteredVoters.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {[
                    "Nombre",
                    "Identificación",
                    "Correo",
                    "Teléfono",
                    "Centro de Votación",
                    "Mesa",
                    "Candidatos",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wide text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredVoters.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {v.firstName} {v.lastName}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {v.identification || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {v.email || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {v.phone || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      {v.votingBooth?.name || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      {v.votingTable?.tableNumber
                        ? `Mesa ${v.votingTable.tableNumber}`
                        : "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {voterCandidates[v.id] &&
                      voterCandidates[v.id].length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {voterCandidates[v.id].map((candidateName, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap w-fit"
                            >
                              {candidateName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No asignado</span>
                      )}
                    </td>

                    <td className="px-6 py-4 flex gap-4">
                      <button
                        onClick={() => handleEdit(v)}
                        className="text-gray-400 hover:text-orange-500 transition"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Desktop */}
          <div className="mt-6 flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              a{" "}
              <span className="font-semibold">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalVoters)}
              </span>{" "}
              de <span className="font-semibold">{totalVoters}</span> votantes
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Anterior
              </button>
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="text-sm text-gray-700">
                  Página <span className="font-semibold">{currentPage}</span> de{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE ===== */}
      {!loading && !error && (
        <div className="md:hidden space-y-4">
          {filteredVoters.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
            >
              <div className="font-bold text-gray-900 text-lg">
                {v.firstName} {v.lastName}
              </div>

              <div className="text-sm text-gray-700 mt-3 space-y-2">
                <div>
                  <b>ID:</b> {v.identification || "No registrado"}
                </div>
                <div>
                  <b>Email:</b> {v.email || "No registrado"}
                </div>
                <div>
                  <b>Tel:</b> {v.phone || "No registrado"}
                </div>
                <div>
                  <b>Centro de Votación:</b>{" "}
                  {v.votingBooth?.name || "No registrado"}
                </div>
                <div>
                  <b>Mesa:</b>{" "}
                  {v.votingTable?.tableNumber
                    ? `Mesa ${v.votingTable.tableNumber}`
                    : "No registrado"}
                </div>
                <div>
                  <b>Candidatos:</b>{" "}
                  {voterCandidates[v.id] && voterCandidates[v.id].length > 0 ? (
                    <div className="flex flex-col gap-2 mt-2">
                      {voterCandidates[v.id].map((candidateName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-semibold w-fit"
                        >
                          {candidateName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No asignado</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-5 mt-4">
                <button
                  onClick={() => handleEdit(v)}
                  className="text-gray-400 hover:text-orange-500 transition"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls - Mobile */}
          <div className="mt-6 flex flex-col gap-4 px-4 py-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-600 text-center">
              Mostrando{" "}
              <span className="font-semibold">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              a{" "}
              <span className="font-semibold">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalVoters)}
              </span>{" "}
              de <span className="font-semibold">{totalVoters}</span> votantes
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Anterior
              </button>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-xs text-gray-700">
                  <span className="font-semibold">{currentPage}</span>/
                  <span className="font-semibold">{totalPages}</span>
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
