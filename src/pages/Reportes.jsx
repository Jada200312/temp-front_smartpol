import React, { useState, useEffect } from "react";
import { getVoterReport, getVoterReportForExport } from "../api/reports";
import ReportFilters from "../components/ReportFilters";
import AggregationCounters from "../components/AggregationCounters";
import VotersTable from "../components/VotersTable";
import { ProtectedComponent } from "../components/ProtectedComponent";

export default function Reportes() {
  const [voters, setVoters] = useState([]);
  const [aggregations, setAggregations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReport(filters, currentPage);
  }, [filters, currentPage]);

  const loadReport = async (currentFilters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVoterReport({
        ...currentFilters,
        page,
        limit: 50,
      });

      console.log("Reporte recibido:", response);

      setVoters(response.data || []);
      setAggregations(response.aggregations || null);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 50,
        total: response.total || 0,
      });
    } catch (error) {
      console.error("Error loading report:", error);
      setError(error.message || "Error al cargar el reporte");
      setVoters([]);
      setAggregations(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset a página 1
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportRequest = async () => {
    try {
      // Obtener TODOS los datos sin paginación para la exportación
      const response = await getVoterReportForExport(activeFilters);
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener datos para exportación:", error);
      throw error;
    }
  };

  const handleCounterClick = (filterType, value) => {
    let newFilters = { ...filters };

    if (filterType === "gender") {
      newFilters.gender = newFilters.gender === value ? "" : value;
    } else if (filterType === "leaderId") {
      newFilters.leaderId = newFilters.leaderId == value ? "" : value;
    } else if (filterType === "candidateId") {
      newFilters.candidateId = newFilters.candidateId == value ? "" : value;
    } else if (filterType === "location") {
      // Toggle location filter
      if (
        newFilters.departmentId == value.departmentId &&
        newFilters.municipalityId == value.municipalityId
      ) {
        delete newFilters.departmentId;
        delete newFilters.municipalityId;
      } else {
        newFilters.departmentId = value.departmentId;
        newFilters.municipalityId = value.municipalityId;
      }
    }

    setFilters(newFilters);
    setCurrentPage(1); // Reset a página 1
  };

  return (
    <ProtectedComponent
      permission="voters:read"
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso denegado
          </h2>
          <p className="text-gray-600">
            No tienes permiso para ver los reportes
          </p>
        </div>
      }
    >
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Informe General de Votantes
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza, analiza y exporta la información de votantes registrada
            en SMARTPOL
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error al cargar los datos</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-red-600">
              Verifica que el servidor backend esté ejecutándose en
              http://localhost:3000
            </p>
          </div>
        )}

        {/* Filtros Dinámicos */}
        {!error && (
          <ReportFilters
            onFiltersChange={handleFiltersChange}
            aggregations={aggregations}
          />
        )}

        {/* Contadores Interactivos */}
        {aggregations && !error && (
          <AggregationCounters
            aggregations={aggregations}
            onCounterClick={handleCounterClick}
          />
        )}

        {/* Filtros activos */}
        {Object.keys(activeFilters).length > 0 && !error && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Filtros activos:
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium"
                >
                  {key}:{" "}
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </span>
              ))}
              <button
                onClick={() => {
                  setFilters({});
                  setActiveFilters({});
                  setCurrentPage(1);
                }}
                className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium hover:bg-red-300 transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Tabla de Votantes */}
        {!error && (
          <VotersTable
            voters={voters}
            filters={activeFilters}
            loading={loading}
            pagination={pagination}
            currentPageProp={currentPage}
            onPageChange={handlePageChange}
            onExportRequest={handleExportRequest}
          />
        )}
      </div>
    </ProtectedComponent>
  );
}
