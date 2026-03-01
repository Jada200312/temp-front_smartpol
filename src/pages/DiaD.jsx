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
      {/* Main Grid Layout */}
      <div className="max-w-6xl mx-auto">
        {/* Stats Section */}
        <div className="mb-10 sm:mb-12 lg:mb-14">
          <VotingStatsCounters refreshTrigger={refreshTrigger} />
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
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100">
              <VoterSearchAndRegister onVoteRegistered={handleVoteAction} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
