import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createUser } from "../api/users";
import { createLeader } from "../api/leaders";
import { useAlert } from "../hooks/useAlert";
import { ValidationRules, validateForm } from "../utils/errorHandler";

export default function CreateLeaders() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    document: "",
    municipality: "",
    phone: "",
  });

  const validationRules = {
    email: [ValidationRules.required, ValidationRules.email],
    password: [ValidationRules.required, ValidationRules.minLength(8)],
    confirmPassword: [ValidationRules.required, ValidationRules.passwordMatch],
    name: [ValidationRules.required, ValidationRules.minLength(3)],
    document: [ValidationRules.required, ValidationRules.minLength(5)],
    municipality: [ValidationRules.required],
  };

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
      // 1. Crear usuario con roleId 4 (Lider)
      const userResponse = await createUser({
        email: formData.email,
        password: formData.password,
        roleId: 4,
      });

      if (!userResponse.id) {
        throw new Error("Error al crear el usuario");
      }

      // 2. Crear líder con el userId del usuario creado
      const leaderData = {
        name: formData.name,
        document: formData.document,
        municipality: formData.municipality,
        phone: formData.phone,
        userId: userResponse.id,
      };

      await createLeader(leaderData);

      alert.success("El líder ha sido creado exitosamente", "¡Éxito!");

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        document: "",
        municipality: "",
        phone: "",
      });
      setFormErrors({});

      setTimeout(() => {
        navigate("/app/lideres", { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      alert.apiError(err, "Error al crear el líder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Líder</h1>
          <p className="mt-2 text-gray-600">
            Completa el formulario para registrar un nuevo líder comunitario
          </p>
        </div>
        <button
          onClick={() => navigate("/app/lideres")}
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
                placeholder="lider@example.com"
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
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL LÍDER */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Datos del Líder
            </h2>

            {/* Nombre y Documento */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="María González"
                />
              </div>

              <div>
                <label
                  htmlFor="document"
                  className="block text-sm font-medium text-gray-700"
                >
                  Documento de Identidad *
                </label>
                <input
                  type="text"
                  name="document"
                  id="document"
                  value={formData.document}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Municipio y Teléfono */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="municipality"
                  className="block text-sm font-medium text-gray-700"
                >
                  Municipio *
                </label>
                <input
                  type="text"
                  name="municipality"
                  id="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="Nombre del municipio"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  placeholder="+57 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/app/personas")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Crear Líder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
