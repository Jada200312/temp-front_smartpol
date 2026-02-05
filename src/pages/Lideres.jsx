import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getLeadersWithPagination,
  getLeadersByCandidateWithPagination,
  updateLeader,
  deleteLeader,
} from "../api/leaders";
import { getCandidateByUserId } from "../api/candidates";
import { usePermission } from "../hooks/usePermission";
import { useAlert } from "../hooks/useAlert";
import { useUser } from "../context/UserContext";
import Pagination from "../components/Pagination";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function Lideres() {
  const { can } = usePermission();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const alert = useAlert();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingLeader, setEditingLeader] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [candidateId, setCandidateId] = useState(null);
  const [loadingCandidateId, setLoadingCandidateId] = useState(
    user?.roleId === 3,
  );
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    municipality: "",
    phone: "",
  });

  // Cargar candidateId si es candidato
  useEffect(() => {
    const loadData = async () => {
      if (user?.roleId === 3) {
        try {
          const candidate = await getCandidateByUserId(user.id);
          if (candidate?.id) {
            setCandidateId(candidate.id);
          }
        } catch (err) {
          console.error("Error loading candidate:", err);
        } finally {
          setLoadingCandidateId(false);
        }
      } else {
        setCandidateId(null);
        setLoadingCandidateId(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Cargar líderes con paginación
  const fetchLeaders = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      // Si es candidato, usar endpoint específico
      const data =
        user?.roleId === 3 && candidateId
          ? await getLeadersByCandidateWithPagination(
              candidateId,
              page,
              itemsPerPage,
              searchTerm,
            )
          : await getLeadersWithPagination(page, itemsPerPage, searchTerm);

      const leadersList = Array.isArray(data.data) ? data.data : [];
      setLeaders(leadersList);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalItems(data.total);
    } catch (err) {
      setError("No se pudieron cargar los líderes");
      alert.apiError(err, "No se pudieron cargar los líderes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si es candidato y aún está cargando el candidateId, no ejecutar
    if (user?.roleId === 3 && loadingCandidateId) {
      return;
    }
    // Si es candidato pero no tiene candidateId, no ejecutar
    if (user?.roleId === 3 && !candidateId) {
      return;
    }
    fetchLeaders(currentPage, search);
  }, [currentPage, search, candidateId, loadingCandidateId]);

  // Refrescar cuando se llega desde la creación
  useEffect(() => {
    if (location.state?.refresh) {
      // Si es candidato, esperar a que candidateId esté cargado
      if (user?.roleId === 3) {
        if (!loadingCandidateId && candidateId) {
          setCurrentPage(1);
          setSearch("");
          fetchLeaders(1, "");
        }
      } else {
        setCurrentPage(1);
        setSearch("");
        fetchLeaders(1, "");
      }
    }
  }, [location, candidateId, loadingCandidateId]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1); // Reset a página 1 cuando cambia la búsqueda
  };

  const handleEdit = (leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      document: leader.document,
      municipality: leader.municipality,
      phone: leader.phone,
    });
    setShowModal(true);
  };

  const handleDelete = async (leaderId) => {
    const result = await alert.confirm(
      "¿Estás seguro de que deseas eliminar este líder?",
      "Confirmar eliminación",
      "Sí, eliminar",
      "Cancelar",
    );
    if (!result.isConfirmed) return;

    try {
      await deleteLeader(leaderId);
      alert.success("Líder eliminado exitosamente");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      alert.apiError(err, "Error al eliminar líder");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLeader) return;

    try {
      await updateLeader(editingLeader.id, formData);
      setShowModal(false);
      setEditingLeader(null);
      alert.success("Líder actualizado exitosamente");
      fetchLeaders(currentPage, search);
    } catch (err) {
      alert.apiError(err, "Error al actualizar líder");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // No necesitamos filtrar localmente ya que el backend maneja la búsqueda
  const filteredLeaders = leaders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Listado de Líderes
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Gestión de líderes comunitarios registrados en la plataforma
          </p>
        </div>

        <button
          onClick={() => navigate("/app/crear-lideres")}
          disabled={!can("leaders:create")}
          title={
            !can("leaders:create") ? "No tienes permiso para crear líderes" : ""
          }
          className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-md transition ${
            can("leaders:create")
              ? "bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Agregar líder
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar por nombre, documento o municipio..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:w-96 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
        />
      </div>

      {/* Modal de edición */}
      {showModal && editingLeader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Líder</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento
                </label>
                <input
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Municipio
                </label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estados */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          Cargando líderes...
        </div>
      )}

      {error && (
        <div className="bg-white p-6 rounded-xl text-red-600">{error}</div>
      )}

      {!loading && !error && filteredLeaders.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-gray-500">
          No se encontraron resultados
        </div>
      )}

      {/* ===== TABLA DESKTOP ===== */}
      {!loading && !error && filteredLeaders.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {[
                    "Nombre",
                    "Documento",
                    "Municipio",
                    "Teléfono",
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
                {filteredLeaders.map((leader) => (
                  <tr
                    key={leader.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {leader.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {leader.document || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {leader.municipality || "No registrado"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {leader.phone || "No registrado"}
                    </td>

                    <td className="px-6 py-4 flex gap-4">
                      {can("leaders:update") && (
                        <button
                          onClick={() => handleEdit(leader)}
                          className="text-gray-400 hover:text-orange-500 transition"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                      )}
                      {can("leaders:delete") && (
                        <button
                          onClick={() => handleDelete(leader.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                      {!can("leaders:update") && !can("leaders:delete") && (
                        <span className="text-gray-300 text-sm">
                          Sin acceso
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* ===== MOBILE ===== */}
      {!loading && !error && (
        <div className="md:hidden space-y-4">
          {filteredLeaders.map((leader) => (
            <div
              key={leader.id}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
            >
              <div className="font-bold text-gray-900 text-lg mb-2">
                {leader.name}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {leader.document && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      Documento:
                    </span>{" "}
                    {leader.document}
                  </div>
                )}
                {leader.municipality && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      Municipio:
                    </span>{" "}
                    {leader.municipality}
                  </div>
                )}
                {leader.phone && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      Teléfono:
                    </span>{" "}
                    {leader.phone}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-3 border-t">
                {can("leaders:update") && (
                  <button
                    onClick={() => handleEdit(leader)}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600 flex-1 justify-center py-2 rounded-lg hover:bg-orange-50"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {can("leaders:delete") && (
                  <button
                    onClick={() => handleDelete(leader.id)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 flex-1 justify-center py-2 rounded-lg hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
