import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "../api/organizations";
import { useAlert } from "../hooks/useAlert";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateOrganizaciones() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      alert.error("El nombre de la organización es obligatorio");
      return;
    }

    setLoading(true);

    try {
      await createOrganization(formData);
      alert.success("Organización creada exitosamente");
      
      setTimeout(() => {
        navigate("/app/organizaciones", { state: { refresh: true } });
      }, 1500);
    } catch (err) {
      alert.apiError(err, "Error al crear la organización");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/organizaciones");
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
            Crear Nueva Organización
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Completa el formulario para registrar una nueva organización
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
              Nombre de la Organización *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Elecciones Presidenciales 2026"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo obligatorio. Máximo 255 caracteres.
            </p>
          </div>

          {/* Descripción */}
          <div className="mb-8">
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
              placeholder="Describe los detalles de esta organización..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:outline-none transition resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo opcional. Proporciona información adicional sobre la organización.
            </p>
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
              disabled={loading}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 shadow-md"
              }`}
            >
              {loading ? "Creando..." : "Crear Organización"}
            </button>
          </div>
        </form>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Una vez creada la organización, podrás asignar campañas, candidatos y otros recursos.
          </p>
        </div>
      </div>
    </div>
  );
}