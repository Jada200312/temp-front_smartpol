import React, { useState } from "react";
import VoterSearchAndRegister from "../components/VoterSearchAndRegister";
import VotingStatsCounters from "../components/VotingStatsCounters";

export default function DiaD() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVoteAction = () => {
    // Incrementar el trigger para forzar actualización en VotingStatsCounters
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Hero Header */}
      <div className="mb-10 sm:mb-12 lg:mb-14">
        <div className="max-w-5xl">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ⚡ Votación en Vivo
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Día D</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
            Centro de control para el registro y seguimiento de votos en tiempo
            real
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-6xl mx-auto">
        {/* Stats Section */}
        <div className="mb-10 sm:mb-12 lg:mb-14">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-7 lg:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-7 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Estadísticas en Vivo
              </h2>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <VotingStatsCounters refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-7 lg:p-9 border border-gray-100">
            {/* Section Header */}
            <div className="mb-8 sm:mb-9">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Registrar Voto
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Busca al votante por su número de cédula y registra su voto de
                forma segura
              </p>
            </div>

            {/* Search Component */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-blue-100">
              <VoterSearchAndRegister onVoteRegistered={handleVoteAction} />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>✓ Los datos se actualizan en tiempo real cada segundo</p>
        </div>
      </div>
    </div>
  );
}
