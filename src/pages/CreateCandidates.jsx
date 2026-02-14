import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCorporations } from "../api/corporations";
import { getAllCampaigns } from "../api/campaigns";
import { getAllOrganizations } from "../api/organizations";
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
  const [organizations, setOrganizations] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userOrgId, setUserOrgId] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
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
    organizationId: "",
  });

  // Reglas de validación del formulario
  const validationRules = {
    email: [ValidationRules.required, ValidationRules.email],
    password: [ValidationRules.required, ValidationRules.minLength(8)],
    confirmPassword: [ValidationRules.required, ValidationRules.passwordMatch],
    name: [ValidationRules.required, ValidationRules.minLength(3)],
    party: [ValidationRules.required, ValidationRules.minLength(2)],
    corporation_id: [ValidationRules.required],
    campaignId: [ValidationRules.required],
    organizationId: [ValidationRules.required],
  };

  // Cargar corporaciones, campañas y organizaciones al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const roleId = localStorage.getItem('roleId');
        const organizationId = localStorage.getItem('organizationId');
        const orgName = localStorage.getItem('organizationName');

        setUserRole(parseInt(roleId));
        if (organizationId) {
          setUserOrgId(parseInt(organizationId));
          setFormData((prev) => ({
            ...prev,
            organizationId: organizationId,
          }));
        }
        if (orgName) {
          setOrganizationName(orgName);
        }

        // Solo cargar organizaciones si es Super Admin
        const isSuperAdmin = parseInt(roleId) === ROLE_SUPER_ADMIN;
        
        const requests = [
          getCorporations(),
          getAllCampaigns(),
        ];
        
        if (isSuperAdmin) {
          requests.push(getAllOrganizations());
        }

        const results = await Promise.all(requests);
        const corporationsData = results[0];
        const campaignsData = results[1];
        const organizationsData = results[2];

        // Las corporaciones vienen como array directamente del backend
        const corporacionesList = Array.isArray(corporationsData) 
          ? corporationsData 
          : [];
        
        const campaniasList = Array.isArray(campaignsData) 
          ? campaignsData 
          : [];

        const organizacionesList = isSuperAdmin && Array.isArray(organizationsData)
          ? organizationsData
          : [];

        // Filtrar corporaciones y campañas si es Org Admin
        let filteredCorporations = corporacionesList;
        let filteredCampaigns = campaniasList;

        if (parseInt(roleId) === ROLE_ORG_ADMIN && organizationId) {
          filteredCorporations = corporacionesList;
          
          filteredCampaigns = campaniasList.filter(
            (campaign) => campaign.organizationId === parseInt(organizationId)
          );
        }

        setCorporations(filteredCorporations);
        setCampaigns(filteredCampaigns);
        setOrganizations(organizacionesList);
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
      // 1. Calcular organizationId antes de crear el usuario
      const organizationIdForUser = userRole === ROLE_ORG_ADMIN 
        ? userOrgId 
        : parseInt(formData.organizationId);

      // 2. Crear usuario con roleId 3 (Candidato) y organizationId
      const userResponse = await createUser({
        email: formData.email,
        password: formData.password,
        roleId: 3,
        organizationId: organizationIdForUser,
      });

      if (!userResponse.id) {
        throw new Error("Error al crear el usuario");
      }

      // 3. Crear candidato con el userId del usuario creado
      const candidateData = {
        name: formData.name,
        party: formData.party,
        number: parseInt(formData.number) || 0,
        corporation_id: parseInt(formData.corporation_id),
        organizationId: organizationIdForUser,
        userId: userResponse.id,
        campaignId: parseInt(formData.campaignId),
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
        organizationId: userRole === ROLE_ORG_ADMIN ? userOrgId.toString() : "",
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

  const isOrgAdmin = userRole === ROLE_ORG_ADMIN;
  const isSuperAdmin = userRole === ROLE_SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Encabezado */}
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

        {/* Formulario */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
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

            {/* SECCIÓN 2: DATOS DEL CANDIDATO */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Datos del Candidato
              </h2>

              {/* Mostrar organización si es Org Admin */}
              {isOrgAdmin && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Organización Asignada
                  </label>
                  <p className="text-sm text-gray-700 font-medium">
                    {organizationName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    El candidato se creará automáticamente en tu organización.
                  </p>
                </div>
              )}

              {/* Selector de Organización para Super Admin */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <label
                    htmlFor="organizationId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organización <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organizationId"
                    id="organizationId"
                    value={formData.organizationId}
                    onChange={handleInputChange}
                    className={`
                      mt-1 block w-full rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3
                      ${formErrors.organizationId ? "border-red-500 bg-red-50" : "border-gray-300"}
                    `}
                  >
                    <option value="">Seleccionar organización</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.organizationId && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.organizationId}
                    </p>
                  )}
                </div>
              )}

              {/* Nombre */}
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

              {/* Corporación y Partido */}
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

              {/* Número */}
              <div className="mb-4">
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
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-3"
                  placeholder="0"
                />
              </div>

              {/* Campaña */}
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
                      {campaign.name} {campaign.status ? "✓" : "✗"}
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

            {/* Botones de acción */}
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