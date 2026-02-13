import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCorporations } from "../api/corporations";
import { getAllCampaigns } from "../api/campaigns";
import { createUser } from "../api/users";
import { createCandidate } from "../api/candidates";
import { useAlert } from "../hooks/useAlert";
import { ValidationRules, validateForm } from "../utils/errorHandler";

export default function CreateCandidates() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [corporations, setCorporations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    party: "",
    number: "",
    corporation_id: "",
    campaignId: "",
  });

  // Reglas de validación del formulario
  const validationRules = {
    email: [ValidationRules.required, ValidationRules.email],
    password: [ValidationRules.required, ValidationRules.minLength(8)],
    confirmPassword: [ValidationRules.required, ValidationRules.passwordMatch],
    name: [ValidationRules.required, ValidationRules.minLength(3)],
    party: [ValidationRules.required, ValidationRules.minLength(2)],
    corporation_id: [ValidationRules.required],
  };

  // Cargar corporaciones y campañas al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [corporationsData, campaignsData] = await Promise.all([
          getCorporations(),
          getAllCampaigns(),
        ]);
        setCorporations(corporationsData);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      } catch (err) {
        alert.error(
          err.message || "Error al cargar los datos",
          "Error al cargar",
        );
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando empiece a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const { isValid, errors } = validateForm(formData, validationRules);

    if (!isValid) {
      setFormErrors(errors);
      alert.warning(
        "Por favor completa correctamente todos los campos requeridos",
        "Validación",
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario con roleId 3 (Candidato)
      const userResponse = await createUser({
        email: formData.email,
        password: formData.password,
        roleId: 3,
      });

      if (!userResponse.id) {
        throw new Error("Error al crear el usuario");
      }

      // 2. Crear candidato con el userId del usuario creado
      const candidateData = {
        name: formData.name,
        party: formData.party,
        number: parseInt(formData.number) || 0,
        corporation_id: parseInt(formData.corporation_id),
        userId: userResponse.id,
        ...(formData.campaignId && { campaignId: parseInt(formData.campaignId) }),
      };

      await createCandidate(candidateData);

      // Mostrar alerta de éxito
      alert.success("El candidato ha sido creado exitosamente", "¡Éxito!");

      // Limpiar formulario
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        party: "",
        number: "",
        corporation_id: "",
        campaignId: "",
      });
      setFormErrors({});

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/app/candidatos", { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      alert.apiError(err, "Error al crear el candidato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Candidato</h1>
          <p className="mt-2 text-gray-600">
            Completa el formulario para registrar un nuevo candidato
          </p>
        </div>
        <button
          onClick={() => navigate("/app/candidatos")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* SECCIÓN 1: DATOS DE USUARIO */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Datos de Acceso
            </h2>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`
                  mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                  ${formErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"}
                `}
                placeholder="candidato@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Contraseña y Confirmar */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                    ${formErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="••••••••"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                    ${formErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="••••••••"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL CANDIDATO */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Datos del Candidato
            </h2>

            {/* Nombre y Corporación */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                    ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="Juan Pérez"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="corporation_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Corporación <span className="text-red-500">*</span>
                </label>
                <select
                  name="corporation_id"
                  id="corporation_id"
                  value={formData.corporation_id}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                    ${formErrors.corporation_id ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                >
                  <option value="">Seleccionar corporación</option>
                  {corporations.map((corp) => (
                    <option key={corp.id} value={corp.id}>
                      {corp.name}
                    </option>
                  ))}
                </select>
                {formErrors.corporation_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.corporation_id}
                  </p>
                )}
              </div>
            </div>

            {/* Partido y Número */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
              <div>
                <label
                  htmlFor="party"
                  className="block text-sm font-medium text-gray-700"
                >
                  Partido Político <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="party"
                  id="party"
                  value={formData.party}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2
                    ${formErrors.party ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="Nombre del partido"
                />
                {formErrors.party && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.party}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de Candidato
                </label>
                <input
                  type="number"
                  name="number"
                  id="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Campaña */}
            <div>
              <label
                htmlFor="campaignId"
                className="block text-sm font-medium text-gray-700"
              >
                Campaña (Opcional)
              </label>
              <select
                name="campaignId"
                id="campaignId"
                value={formData.campaignId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
              >
                <option value="">Seleccionar campaña (opcional)</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} {campaign.status ? "✓" : "✗"}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Puedes asignar al candidato a una campaña ahora o hacerlo después
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/app/candidatos")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Crear Candidato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}