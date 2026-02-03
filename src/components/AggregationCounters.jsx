import React from "react";

export default function AggregationCounters({ aggregations, onCounterClick }) {
  if (!aggregations) return null;

  const renderGenderLabel = (gender) => {
    const genderMap = {
      M: "Masculino",
      F: "Femenino",
      O: "Otro",
    };
    // Asegurar que gender es string antes de buscar
    const genderStr = String(gender || "");
    return genderMap[genderStr] || genderStr || "No especificado";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Resumen de Información
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contadores por Género */}
        {aggregations.byGender &&
          Array.isArray(aggregations.byGender) &&
          aggregations.byGender.length > 0 && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Por Género
              </h3>
              <div className="space-y-2">
                {aggregations.byGender.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCounterClick("gender", item.gender)}
                    className="w-full text-left p-2 rounded hover:bg-blue-200 transition flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {renderGenderLabel(item.gender)}
                    </span>
                    <span className="font-semibold text-blue-700">
                      {item.count || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Contadores por Líder */}
        {aggregations.byLeader &&
          Array.isArray(aggregations.byLeader) &&
          aggregations.byLeader.length > 0 && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Por Líder
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {aggregations.byLeader.map((item) => {
                  const leaderId = item.id || item.leaderId;
                  const leaderName =
                    item.name || item.leaderName || "Sin nombre";
                  return (
                    <button
                      key={leaderId}
                      onClick={() => onCounterClick("leaderId", leaderId)}
                      className="w-full text-left p-2 rounded hover:bg-green-200 transition flex justify-between items-center"
                      title={leaderName}
                    >
                      <span className="text-sm truncate">{leaderName}</span>
                      <span className="font-semibold text-green-700">
                        {item.count || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Contadores por Candidato */}
        {aggregations.byCandidate &&
          Array.isArray(aggregations.byCandidate) &&
          aggregations.byCandidate.length > 0 && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Por Candidato
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {aggregations.byCandidate.map((item) => {
                  const candidateId = item.id || item.candidateId;
                  const candidateName =
                    item.name || item.candidateName || "Sin nombre";
                  const corporationName =
                    item.corporationName || item.party || "";
                  return (
                    <button
                      key={candidateId}
                      onClick={() => onCounterClick("candidateId", candidateId)}
                      className="w-full text-left p-2 rounded hover:bg-purple-200 transition flex justify-between items-center"
                      title={`${candidateName} ${corporationName ? `(${corporationName})` : ""}`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs truncate">
                          {candidateName}
                        </span>
                        {corporationName && (
                          <span className="text-xs text-gray-600 truncate">
                            {corporationName}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-purple-700 ml-2 flex-shrink-0">
                        {item.count || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Contadores por Ubicación */}
        {aggregations.byLocation &&
          Array.isArray(aggregations.byLocation) &&
          aggregations.byLocation.length > 0 && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Por Ubicación
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {aggregations.byLocation.map((item) => {
                  const departmentId = item.departmentId || item.id;
                  const municipalityId = item.municipalityId;
                  const departmentName =
                    item.departmentName || item.name || "Sin departamento";
                  const municipalityName =
                    item.municipalityName || "Sin municipio";
                  return (
                    <button
                      key={`${departmentId}-${municipalityId}`}
                      onClick={() =>
                        onCounterClick("location", {
                          departmentId,
                          municipalityId,
                        })
                      }
                      className="w-full text-left p-2 rounded hover:bg-orange-200 transition flex justify-between items-center"
                      title={`${departmentName} - ${municipalityName}`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs truncate">
                          {departmentName}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                          {municipalityName}
                        </span>
                      </div>
                      <span className="font-semibold text-orange-700 ml-2 flex-shrink-0">
                        {item.count || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
