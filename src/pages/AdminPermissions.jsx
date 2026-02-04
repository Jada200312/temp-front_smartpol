import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  getRoles,
  getUsers,
  getAllPermissions,
  getRolePermissions,
  getUserCustomPermissions,
  assignPermissionToRole,
  revokePermissionFromRole,
  grantUserPermission,
  revokeUserRolePermission,
  deleteUserPermission,
} from "../api/roles-permissions";
import PermissionsGrid from "../components/PermissionsGrid";

export default function AdminPermissions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Datos
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  // Estados de selección
  const [activeTab, setActiveTab] = useState("roles"); // 'roles' o 'users'
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRolePermissions, setUserRolePermissions] = useState([]); // Permisos heredados del rol del usuario

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [rolesData, usersData, permsData] = await Promise.all([
          getRoles(),
          getUsers(),
          getAllPermissions(),
        ]);

        setRoles(rolesData);
        setUsers(usersData);
        setAllPermissions(permsData);
      } catch (err) {
        setError("Error al cargar datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cargar permisos del rol seleccionado
  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!selectedRole) return;

      try {
        const perms = await getRolePermissions(selectedRole.id);
        setRolePermissions(perms);
      } catch (err) {
        console.error("Error loading role permissions:", err);
      }
    };

    loadRolePermissions();
  }, [selectedRole]);

  // Cargar permisos personalizados del usuario seleccionado
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!selectedUser) return;

      try {
        const perms = await getUserCustomPermissions(selectedUser.id);
        setUserPermissions(perms);

        // Cargar también los permisos del rol del usuario
        if (selectedUser.role) {
          const rolePerms = await getRolePermissions(selectedUser.role.id);
          setUserRolePermissions(rolePerms);
        }
      } catch (err) {
        console.error("Error loading user permissions:", err);
      }
    };

    loadUserPermissions();
  }, [selectedUser]);

  // Handlers para asignar/revocar permisos de rol
  const handleAssignRolePermission = async (permissionId) => {
    try {
      await assignPermissionToRole(selectedRole.id, permissionId);
      const updated = await getRolePermissions(selectedRole.id);
      setRolePermissions(updated);
    } catch (err) {
      setError("Error al asignar permiso: " + err.message);
    }
  };

  const handleRevokeRolePermission = async (permissionId) => {
    try {
      await revokePermissionFromRole(selectedRole.id, permissionId);
      const updated = await getRolePermissions(selectedRole.id);
      setRolePermissions(updated);
    } catch (err) {
      setError("Error al revocar permiso: " + err.message);
    }
  };

  // Handlers para asignar/revocar permisos de usuario
  const handleToggleUserPermission = async (
    permissionId,
    isHeredado,
    isRevocado,
    isCustom,
  ) => {
    try {
      let action;

      if (isHeredado && !isRevocado) {
        // Permiso heredado activo -> revocarlo (granted: false)
        action = revokeUserRolePermission(selectedUser.id, permissionId);
      } else if (isRevocado) {
        // Permiso revocado -> restaurarlo (DELETE)
        action = deleteUserPermission(selectedUser.id, permissionId);
      } else if (isCustom) {
        // Permiso personalizado activo -> removerlo (DELETE)
        action = deleteUserPermission(selectedUser.id, permissionId);
      } else {
        // Sin permiso -> otorgarlo (granted: true)
        action = grantUserPermission(selectedUser.id, permissionId);
      }

      await action;
      const updated = await getUserCustomPermissions(selectedUser.id);
      setUserPermissions(updated);
    } catch (err) {
      setError("Error al modificar permiso: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Administración de Permisos
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona los permisos por rol y usuario
          </p>
        </div>
        <button
          onClick={() => navigate("/app/personas")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("roles");
              setSelectedRole(null);
              setError("");
            }}
            className={`flex-1 py-4 px-4 text-center font-medium transition ${
              activeTab === "roles"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Permisos por Rol
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setSelectedUser(null);
              setError("");
            }}
            className={`flex-1 py-4 px-4 text-center font-medium transition ${
              activeTab === "users"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Permisos por Usuario
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Permisos por Rol */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Rol
                </label>
                <select
                  value={selectedRole?.id || ""}
                  onChange={(e) => {
                    const role = roles.find(
                      (r) => r.id === parseInt(e.target.value),
                    );
                    setSelectedRole(role || null);
                  }}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                >
                  <option value="">Seleccionar un rol...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.description && `- ${role.description}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Los permisos en{" "}
                      <strong>color naranja</strong> están asignados a este rol.
                      Haz clic en un permiso para asignarlo o revocarlo.
                    </p>
                  </div>

                  <PermissionsGrid
                    type="role"
                    targetId={selectedRole.id}
                    targetName={selectedRole.name}
                    allPermissions={allPermissions}
                    assignedPermissions={rolePermissions}
                    onAssign={handleAssignRolePermission}
                    onRevoke={handleRevokeRolePermission}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab: Permisos por Usuario */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Usuario
                </label>
                <select
                  value={selectedUser?.id || ""}
                  onChange={(e) => {
                    const user = users.find(
                      (u) => u.id === parseInt(e.target.value),
                    );
                    setSelectedUser(user || null);
                  }}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                >
                  <option value="">Seleccionar un usuario...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.role && `(${user.role.name})`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Los permisos en{" "}
                      <strong>color naranja</strong> son heredados del rol{" "}
                      <strong>{selectedUser.role?.name}</strong>. Los permisos
                      en <strong>color verde</strong> son personalizaciones
                      específicas para este usuario. Puedes{" "}
                      <strong>revocar permisos heredados</strong> del rol o{" "}
                      <strong>otorgar permisos adicionales</strong>.
                    </p>
                  </div>

                  <PermissionsGrid
                    type="user"
                    targetId={selectedUser.id}
                    targetName={selectedUser.email}
                    allPermissions={allPermissions}
                    assignedPermissions={userPermissions}
                    rolePermissions={userRolePermissions}
                    onToggle={handleToggleUserPermission}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
