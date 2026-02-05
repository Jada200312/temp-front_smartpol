import { useState, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Componente para gestionar permisos de un rol o usuario
 * @param {Object} props
 * @param {string} props.type - 'role' o 'user'
 * @param {number} props.targetId - ID del rol o usuario
 * @param {string} props.targetName - Nombre del rol o usuario (para display)
 * @param {Array} props.allPermissions - Array de todos los permisos disponibles
 * @param {Array} props.assignedPermissions - Array de permisos actualmente asignados o user_permissions para usuarios
 * @param {Array} props.rolePermissions - Array de permisos heredados del rol (solo para usuarios)
 * @param {Function} props.onAssign - Callback para asignar permiso (roles)
 * @param {Function} props.onRevoke - Callback para revocar permiso (roles)
 * @param {Function} props.onToggle - Callback para toggle de permiso (usuarios)
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error
 */
export default function PermissionsGrid({
  type = "role",
  targetId,
  targetName,
  allPermissions = [],
  assignedPermissions = [],
  rolePermissions = [],
  onAssign,
  onRevoke,
  onToggle,
  loading = false,
  error = null,
}) {
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState({});

  useEffect(() => {
    // Agrupar permisos por recurso
    const grouped = {};
    allPermissions.forEach((perm) => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    setGroupedPermissions(grouped);
  }, [allPermissions]);

  const getUserPermissionStatus = (permissionId) => {
    // Para usuarios, buscar en assignedPermissions (que son user_permissions completos)
    if (type === "user" && Array.isArray(assignedPermissions)) {
      const userPerm = assignedPermissions.find(
        (p) => p.permission?.id === permissionId,
      );
      return userPerm;
    }
    return null;
  };

  const isPermissionAssigned = (permissionId) => {
    if (type === "user") {
      // Para usuarios, verificar granted status
      const userPerm = getUserPermissionStatus(permissionId);
      if (userPerm) {
        return userPerm.granted;
      }
      // Si no hay user_permission pero está en el rol, está heredado
      return rolePermissions.some((p) => p.id === permissionId);
    } else {
      // Para roles, usar la lógica simple
      return assignedPermissions.some((p) => p.id === permissionId);
    }
  };

  const isPermissionFromRole = (permissionId) => {
    // Solo aplica a usuarios, no a roles
    if (type !== "user") return false;
    // Es del rol si existe en rolePermissions y NO hay user_permission que lo niegue
    const userPerm = getUserPermissionStatus(permissionId);
    const isInRole = rolePermissions.some((p) => p.id === permissionId);

    // Si no hay override personalizado, y está en el rol, es heredado
    if (!userPerm && isInRole) {
      return true;
    }

    // Si hay override pero está otorgado, también lo consideramos como heredado base
    if (userPerm && userPerm.granted && isInRole) {
      return true;
    }

    return false;
  };

  const isPermissionCustom = (permissionId) => {
    // Solo aplica a usuarios
    if (type !== "user") return false;
    // Un permiso es personalizado si hay un user_permission con granted=true y NO viene del rol
    const userPerm = getUserPermissionStatus(permissionId);
    const isInRole = rolePermissions.some((p) => p.id === permissionId);

    return userPerm && userPerm.granted && !isInRole;
  };

  const isPermissionRevoked = (permissionId) => {
    // Solo aplica a usuarios
    if (type !== "user") return false;
    // Un permiso está revocado si hay user_permission con granted=false
    const userPerm = getUserPermissionStatus(permissionId);
    return userPerm && !userPerm.granted;
  };

  const handleTogglePermission = async (
    permissionId,
    isAssigned,
    isFromRole,
    isCustom,
    isRevoked,
  ) => {
    setLoadingPermissions((prev) => ({ ...prev, [permissionId]: true }));

    try {
      if (type === "user") {
        // Para usuarios, usar el callback onToggle con más información
        await onToggle(permissionId, isFromRole, isRevoked, isCustom);
      } else {
        // Para roles, usar la lógica simple anterior
        if (isAssigned) {
          await onRevoke(permissionId);
        } else {
          await onAssign(permissionId);
        }
      }
    } catch (err) {
      console.error("Error toggling permission:", err);
    } finally {
      setLoadingPermissions((prev) => ({ ...prev, [permissionId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Permisos de {type === "role" ? "Rol" : "Usuario"}: {targetName}
        </h3>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="px-6 py-4 space-y-6">
        {Object.entries(groupedPermissions).length === 0 ? (
          <p className="text-center text-gray-500">
            No hay permisos disponibles
          </p>
        ) : (
          Object.entries(groupedPermissions).map(([resource, permissions]) => (
            <div key={resource} className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 capitalize">
                {resource}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions.map((perm) => {
                  const isAssigned = isPermissionAssigned(perm.id);
                  const isFromRole = isPermissionFromRole(perm.id);
                  const isCustom = isPermissionCustom(perm.id);
                  const isRevoked = isPermissionRevoked(perm.id);
                  const isLoadingPerm = loadingPermissions[perm.id];

                  // Determinar estilo según el tipo de permiso
                  let borderColor =
                    "border-gray-300 bg-white hover:border-gray-400";
                  let iconColor = "text-gray-300";
                  let label = "Sin asignar";

                  if (type === "role") {
                    // Para roles: solo dos estados - asignado o no asignado
                    if (isAssigned) {
                      borderColor = "border-orange-500 bg-orange-50";
                      iconColor = "text-orange-600";
                      label = "Asignado";
                    }
                  } else {
                    // Para usuarios: cuatro estados
                    if (isRevoked) {
                      // Permiso del rol pero revocado
                      borderColor = "border-red-500 bg-red-50";
                      iconColor = "text-red-600";
                      label = "Revocado del rol";
                    } else if (isFromRole) {
                      borderColor = "border-orange-500 bg-orange-50";
                      iconColor = "text-orange-600";
                      label = "Heredado del rol";
                    } else if (isCustom) {
                      borderColor = "border-green-500 bg-green-50";
                      iconColor = "text-green-600";
                      label = "Personalizado";
                    }
                  }

                  return (
                    <button
                      key={perm.id}
                      onClick={() =>
                        handleTogglePermission(
                          perm.id,
                          isAssigned || isRevoked,
                          isFromRole,
                          isCustom,
                          isRevoked,
                        )
                      }
                      disabled={loading || isLoadingPerm}
                      className={`relative px-4 py-3 rounded-lg border-2 text-left transition-all ${borderColor} ${
                        (loading || isLoadingPerm) &&
                        "opacity-50 cursor-not-allowed"
                      }`}
                      title={perm.description || perm.name}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {perm.action}
                          </div>
                          {perm.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {perm.description}
                            </div>
                          )}
                          {(isAssigned || isRevoked) && (
                            <div className="text-xs font-semibold text-gray-600 mt-2">
                              {label}
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          {isAssigned || isRevoked ? (
                            <CheckIcon className={`h-5 w-5 ${iconColor}`} />
                          ) : (
                            <div className="h-5 w-5 border border-gray-300 rounded" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
