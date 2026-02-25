import React, { useState } from "react";
import {
  searchVoterByIdentificationForDiaD,
  registerVote,
  unregisterVote,
} from "../api/voters";
import { useAlert } from "../hooks/useAlert";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function VoterSearchAndRegister({ onVoteRegistered }) {
  const [identification, setIdentification] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { alert } = useAlert();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identification.trim()) {
      alert("Por favor, ingresa una cédula", "warning");
      return;
    }

    setLoading(true);
    try {
      const result = await searchVoterByIdentificationForDiaD(identification);
      setSearchResult(result);

      if (result.status === "not_found") {
        alert("Votante no encontrado", "warning");
      }
    } catch (error) {
      alert("Error al buscar votante: " + error.message, "error");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVote = async () => {
    setRegistering(true);
    try {
      const response = await registerVote(identification);
      alert(
        `Voto registrado para ${response.firstName} ${response.lastName}`,
        "success",
      );

      // Pequeño delay para asegurar la persistencia en BD
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIdentification("");
      setSearchResult(null);
      setConfirmDialogOpen(false);

      // Callback para actualizar el padre (panel de contadores)
      if (onVoteRegistered) {
        onVoteRegistered();
      }
    } catch (error) {
      if (error.message?.includes("ya ha votado")) {
        alert("Este votante ya ha registrado su voto", "warning");
      } else {
        alert("Error al registrar voto: " + error.message, "error");
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregisterVote = async () => {
    setRegistering(true);
    try {
      const response = await unregisterVote(identification);
      alert(
        `Voto eliminado para ${response.firstName} ${response.lastName}`,
        "success",
      );

      // Pequeño delay para asegurar la persistencia en BD
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIdentification("");
      setSearchResult(null);
      setConfirmDialogOpen(false);

      // Callback para actualizar el padre (panel de contadores)
      if (onVoteRegistered) {
        onVoteRegistered();
      }
    } catch (error) {
      if (error.message?.includes("no ha registrado")) {
        alert("Este votante no ha registrado su voto", "warning");
      } else {
        alert("Error al eliminar voto: " + error.message, "error");
      }
    } finally {
      setRegistering(false);
    }
  };

  const renderVoterInfo = () => {
    if (!searchResult || searchResult.status === "not_found") {
      return null;
    }

    if (searchResult.status === "assigned") {
      const voter = searchResult.voter;
      return (
        <div
          className={`mt-6 p-6 sm:p-7 rounded-xl border-2 ${
            voter.hasVoted
              ? "bg-green-50 border-green-300"
              : "bg-orange-50 border-orange-300"
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            {voter.hasVoted ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            )}
            <h3
              className={`text-lg font-bold ${
                voter.hasVoted ? "text-green-900" : "text-orange-900"
              }`}
            >
              {voter.hasVoted ? "✓ Voto Registrado" : "⏳ Voto Pendiente"}
            </h3>
          </div>

          {/* Voter Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Nombre Completo
              </span>
              <p className="font-bold text-gray-900">
                {voter.firstName} {voter.lastName}
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Cédula
              </span>
              <p className="font-bold text-gray-900 font-mono">
                {voter.identification}
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Género
              </span>
              <p className="font-bold text-gray-900">
                {voter.gender === "M" ? "👨 Masculino" : "👩 Femenino"}
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Grupo Sanguíneo
              </span>
              <p className="font-bold text-gray-900">{voter.bloodType}</p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Teléfono
              </span>
              <p className="font-bold text-gray-900">{voter.phone}</p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Email
              </span>
              <p className="font-bold text-gray-900 text-xs truncate">
                {voter.email || "No disponible"}
              </p>
            </div>
          </div>

          {/* Assigned Leader */}
          {searchResult.assignedLeader && (
            <div className="mb-4 p-4 bg-white bg-opacity-70 rounded-lg border border-current border-opacity-20">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                👤 Líder Asignado
              </p>
              <p className="font-bold text-gray-900">
                {searchResult.assignedLeader.name}
              </p>
            </div>
          )}

          {/* Assigned Candidates */}
          {searchResult.assignedCandidates &&
            searchResult.assignedCandidates.length > 0 && (
              <div className="mb-6 p-4 bg-white bg-opacity-70 rounded-lg border border-current border-opacity-20">
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  🗳️ Candidatos Asignados
                </p>
                <div className="space-y-2">
                  {searchResult.assignedCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {candidate.name}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        {candidate.party}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Action Button */}
          <button
            onClick={() => setConfirmDialogOpen(true)}
            disabled={registering}
            className={`w-full font-bold py-3 sm:py-4 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 text-white ${
              voter.hasVoted
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400"
            }`}
          >
            {voter.hasVoted ? (
              <>
                <TrashIcon className="w-5 h-5" />
                {registering ? "Eliminando..." : "Eliminar Voto"}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                {registering ? "Registrando..." : "Registrar Voto"}
              </>
            )}
          </button>
        </div>
      );
    }

    if (searchResult.status === "in_history") {
      const data = searchResult.votersHistoryData;
      return (
        <div className="mt-6 p-6 sm:p-7 rounded-xl bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-yellow-900">
              ⚠️ En Historial
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Nombre
              </span>
              <p className="font-bold text-gray-900">
                {data.firstName} {data.lastName}
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <span className="text-gray-600 text-xs font-medium block mb-1">
                Cédula
              </span>
              <p className="font-bold text-gray-900 font-mono">
                {data.identification}
              </p>
            </div>
          </div>
          <div className="bg-yellow-100 border-l-4 border-yellow-600 p-3 rounded text-sm text-yellow-800 font-medium">
            ℹ️ Este votante se encuentra en el historial pero no está activo en
            el sistema actual.
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={identification}
              onChange={(e) => setIdentification(e.target.value.toUpperCase())}
              placeholder="Ej: 1234567890"
              className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition text-base sm:text-lg font-medium"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition duration-300 flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Buscando...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Buscar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {renderVoterInfo()}

      {/* Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-100">
            <div
              className={`flex items-center justify-center w-14 h-14 mx-auto rounded-full mb-5 ${
                searchResult?.voter?.hasVoted ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {searchResult?.voter?.hasVoted ? (
                <TrashIcon className="w-7 h-7 text-red-600" />
              ) : (
                <CheckCircleIcon className="w-7 h-7 text-green-600" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 text-gray-900">
              {searchResult?.voter?.hasVoted
                ? "Eliminar Voto"
                : "Confirmar Registro"}
            </h3>
            <div className="mb-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                <span className="block font-semibold text-gray-900 text-base mb-1">
                  {searchResult?.voter?.firstName}{" "}
                  {searchResult?.voter?.lastName}
                </span>
                {searchResult?.voter?.hasVoted
                  ? "Este votante volverá al estado pendiente"
                  : "Se registrará su voto en el sistema"}
              </p>
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3 inline-block">
                Cédula: {searchResult?.voter?.identification}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialogOpen(false)}
                disabled={registering}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={
                  searchResult?.voter?.hasVoted
                    ? handleUnregisterVote
                    : handleRegisterVote
                }
                disabled={registering}
                className={`flex-1 px-4 py-3 text-white font-bold rounded-lg transition duration-300 ${
                  searchResult?.voter?.hasVoted
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400"
                }`}
              >
                {registering
                  ? searchResult?.voter?.hasVoted
                    ? "Eliminando..."
                    : "Registrando..."
                  : searchResult?.voter?.hasVoted
                    ? "Eliminar"
                    : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
