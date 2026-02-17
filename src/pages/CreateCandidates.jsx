import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCorporations } from "../api/corporations";
import { getAllCampaigns } from "../api/campaigns";
import { createUser } from "../api/users";
import { createCandidate } from "../api/candidates";
import { useAlert } from "../hooks/useAlert";
import { ValidationRules, validateForm } from "../utils/errorHandler";

const ROLE_SUPER_ADMIN = 1;
const ROLE_ORG_ADMIN = 2;

export default function CreateCandidates() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [corporations, setCorporations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState(null);
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

  const validationRules = {
    email: [ValidationRules.required, ValidationRules.email],
    password: [ValidationRules.required, ValidationRules.minLength(8)],
    confirmPassword: [ValidationRules.required, ValidationRules.passwordMatch],
    name: [ValidationRules.required, ValidationRules.minLength(3)],
    party: [ValidationRules.required, ValidationRules.minLength(2)],
    number: [ValidationRules.required],
    corporation_id: [ValidationRules.required],
    campaignId: [ValidationRules.required],
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const roleId = localStorage.getItem('roleId');
        const organizationId = localStorage.getItem('organizationId');

        setUserRole(parseInt(roleId));
        setCurrentOrganizationId(parseInt(organizationId));

        const [corporationsData, campaignsData] = await Promise.all([
          getCorporations(),
          getAllCampaigns(),
        ]);

        const corporacionesList = Array.isArray(corporationsData) 
          ? corporationsData 
          : [];
        
        let campaniasList = Array.isArray(campaignsData) 
          ? campaignsData 
          : [];

        // Filtrar campañas para admins de organización
        if (roleId === '2' && organizationId) {
          campaniasList = campaniasList.filter(
            (campaign) => campaign.organizationId === parseInt(organizationId)
          );
        }

        setCorporations(corporacionesList);
        setCampaigns(campaniasList);
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
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      // Obtener organizationId de la campaña seleccionada
      const selectedCampaign = campaigns.find(
        (c) => c.id === parseInt(formData.campaignId)
      );

      const campaignOrganizationId = selectedCampaign?.organizationId || currentOrganizationId;

      // 1. Crear usuario con roleId 3 (Candidato) y organizationId heredado
      const userResponse = await createUser({
        email: formData.email,
        password: formData.password,
        roleId: 3,
        organizationId: campaignOrganizationId, // Pasar organizationId
      });

      if (!userResponse || !userResponse.id) {
        throw new Error("Error al crear el usuario");
      }

      // 2. Crear candidato con el userId del usuario creado
      const candidateData = {
        name: formData.name,
        party: formData.party,
        number: parseInt(formData.number, 10) || 1,
        corporation_id: parseInt(formData.corporation_id, 10),
        userId: userResponse.id,
        campaignId: formData.campaignId ? parseInt(formData.campaignId, 10) : null,
      };

      await createCandidate(candidateData);

      alert.success("El candidato ha sido creado exitosamente", "¡Éxito!");

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        party: "",
        number: "1",
        corporation_id: "",
        campaignId: "",
      });
      setFormErrors({});

      setTimeout(() => {
        navigate("/app/candidatos", { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      console.error("Error detallado:", err);
      alert.apiError(err, "Error al crear el candidato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/app/candidatos")}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
            title="Volver"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Crear Candidato
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Completa el formulario para registrar un nuevo candidato
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Datos de Acceso
              </h2>

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
                    mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                    ${formErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="candidato@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

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
                      mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
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
                      mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                      ${
                        formErrors.confirmPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }
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

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Datos del Candidato
              </h2>

              <div className="mb-4">
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
                    mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                    ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="Juan Pérez"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
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
                      mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
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
                      mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
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
              </div>

              <div className="mb-4">
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de Candidato <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="number"
                  id="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                    ${formErrors.number ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                  placeholder="1"
                  min="1"
                />
                {formErrors.number && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.number}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaignId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Campaña <span className="text-red-500">*</span>
                </label>
                <select
                  name="campaignId"
                  id="campaignId"
                  value={formData.campaignId}
                  onChange={handleInputChange}
                  className={`
                    mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                    ${formErrors.campaignId ? "border-red-500 bg-red-50" : "border-gray-300"}
                  `}
                >
                  <option value="">Seleccionar campaña</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
                {formErrors.campaignId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.campaignId}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/app/candidatos")}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || loadingData}
                className={`px-6 py-3 font-semibold rounded-lg text-white transition ${
                  loading || loadingData
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 shadow-md"
                }`}
              >
                {loading ? "Creando..." : "Crear Candidato"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}