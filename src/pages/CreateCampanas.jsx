import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCampaign } from "../api/campaigns";
import { getAllOrganizations } from "../api/organizations";
import { useAlert } from "../hooks/useAlert";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateCampanas() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    organizationId: "",
    status: true,
  });

  // Cargar organizaciones
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await getAllOrganizations();
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        alert.error("Error al cargar las organizaciones");
        console.error("Error:", err);
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      alert.error("El nombre de la campaña es obligatorio");
      return;
    }

    if (!formData.organizationId) {
      alert.error("Debes seleccionar una organización");
      return;
    }

    if (!formData.startDate) {
      alert.error("La fecha de inicio es obligatoria");
      return;
    }

    if (!formData.endDate) {
      alert.error("La fecha de finalización es obligatoria");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    setLoading(true);

    try {
      await createCampaign({
        ...formData,
        organizationId: parseInt(formData.organizationId),
      });
      alert.success("Campaña creada exitosamente");

      setTimeout(() => {
        navigate("/app/campanas", { state: { refresh: true } });
      }, 1500);
    } catch (err) {
      alert.apiError(err, "Error al crear la campaña");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/campanas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg hover:bg-gray-200 transition"
          title="Volver"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crear Nueva Campaña
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Completa el formulario para registrar una nueva campaña política
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8"
        >
          {/* Nombre */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Campaña Electoral 2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo obligatorio. Máximo 255 caracteres.
            </p>
          </div>

          {/* Organización */}
          <div className="mb-6">
            <label
              htmlFor="organizationId"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Organización *
            </label>
            <select
              id="organizationId"
              name="organizationId"
              value={formData.organizationId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition"
              required
            >
              <option value="">Selecciona una organización</option>
              {loadingOrganizations ? (
                <option disabled>Cargando organizaciones...</option>
              ) : organizations.length > 0 ? (
                organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))
              ) : (
                <option disabled>No hay organizaciones disponibles</option>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Campo obligatorio. Selecciona la organización responsable.
            </p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe los detalles de esta campaña..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo opcional. Proporciona información adicional sobre la campaña.
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Fecha de Inicio *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Fecha de Finalización *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Estado */}
          <div className="mb-8 flex items-center">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="status" className="ml-2 text-sm text-gray-700">
              Campaña activa
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingOrganizations}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg text-white transition ${
                loading || loadingOrganizations
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 shadow-md"
              }`}
            >
              {loading ? "Creando..." : "Crear Campaña"}
            </button>
          </div>
        </form>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Una vez creada la campaña, podrás asignar candidatos, líderes y usuarios.
          </p>
        </div>
      </div>
    </div>
  );
}