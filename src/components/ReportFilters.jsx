import React, { useState, useEffect } from "react";
import { getAllLeaders } from "../api/leaders";
import { getAllCandidates } from "../api/candidates";
import { getDepartments, getMunicipalities } from "../api/departments";
import { getCorporations } from "../api/corporations";

export default function ReportFilters({ onFiltersChange, aggregations = {} }) {
  const [filters, setFilters] = useState({
    gender: "",
    leaderId: "",
    corporationId: "",
    candidateId: "",
    departmentId: "",
    municipalityId: "",
    votingLocation: "",
  });

  const [leaders, setLeaders] = useState([]);
  const [corporations, setCorporations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [leadersData, candidatesData, corporationsData, departmentsData] =
          await Promise.all([
            getAllLeaders(),
            getAllCandidates(),
            getCorporations(),
            getDepartments(),
          ]);
        setLeaders(Array.isArray(leadersData) ? leadersData : []);
        setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
        setCorporations(
          Array.isArray(corporationsData) ? corporationsData : [],
        );
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setFilteredCandidates(
          Array.isArray(candidatesData) ? candidatesData : [],
        );
      } catch (error) {
        console.error("Error loading filter options:", error);
        setLeaders([]);
        setCandidates([]);
        setCorporations([]);
        setDepartments([]);
        setFilteredCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  // Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (filters.departmentId) {
      loadMunicipalities(filters.departmentId);
    } else {
      setMunicipalities([]);
      setFilters((prev) => ({ ...prev, municipalityId: "" }));
    }
  }, [filters.departmentId]);

  // Filtrar candidatos cuando cambia la corporación
  useEffect(() => {
    if (filters.corporationId) {
      const filtered = candidates.filter((c) => {
        // Manejo seguro del objeto corporation
        const corporationId =
          typeof c.corporation === "object"
            ? c.corporation?.id
            : c.corporationId;
        return corporationId === parseInt(filters.corporationId);
      });
      setFilteredCandidates(filtered);
      // Reset candidateId si el candidato actual no está en la corporación seleccionada
      if (
        filters.candidateId &&
        !filtered.some((c) => c.id === parseInt(filters.candidateId))
      ) {
        setFilters((prev) => ({ ...prev, candidateId: "" }));
      }
    } else {
      setFilteredCandidates(candidates);
    }
  }, [filters.corporationId, candidates]);

  const loadMunicipalities = async (departmentId) => {
    try {
      const municipalitiesData = await getMunicipalities(departmentId);
      setMunicipalities(
        Array.isArray(municipalitiesData) ? municipalitiesData : [],
      );
    } catch (error) {
      console.error("Error loading municipalities:", error);
      setMunicipalities([]);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    // Si cambia el departamento, resetea el municipio
    if (key === "departmentId" && value !== filters.departmentId) {
      newFilters.municipalityId = "";
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      gender: "",
      leaderId: "",
      corporationId: "",
      candidateId: "",
      departmentId: "",
      municipalityId: "",
      votingLocation: "",
    };
    setFilters(emptyFilters);
    setMunicipalities([]);
    setFilteredCandidates(candidates);
    onFiltersChange(emptyFilters);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-500">Cargando filtros...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Filtros Dinámicos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          {aggregations?.byGender && (
            <p className="text-xs text-gray-500 mt-1">
              Totales: {aggregations.byGender.length} opciones
            </p>
          )}
        </div>

        {/* Líder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Líder
          </label>
          <select
            value={filters.leaderId}
            onChange={(e) => handleFilterChange("leaderId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los líderes</option>
            {leaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.name || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>

        {/* Corporación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corporación
          </label>
          <select
            value={filters.corporationId}
            onChange={(e) =>
              handleFilterChange("corporationId", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las corporaciones</option>
            {corporations.map((corp) => (
              <option key={corp.id} value={corp.id}>
                {corp.name || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>

        {/* Candidato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidato
          </label>
          <select
            value={filters.candidateId}
            onChange={(e) => handleFilterChange("candidateId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los candidatos</option>
            {filteredCandidates.map((candidate) => {
              // Manejo seguro del objeto corporation
              const corporationName =
                typeof candidate.corporation === "object"
                  ? candidate.corporation?.name || "Sin partido"
                  : candidate.corporationName || "Sin partido";

              return (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name || "Sin nombre"} ({corporationName})
                </option>
              );
            })}
          </select>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <select
            value={filters.departmentId}
            onChange={(e) => handleFilterChange("departmentId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>

        {/* Municipio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Municipio
          </label>
          <select
            value={filters.municipalityId}
            onChange={(e) =>
              handleFilterChange("municipalityId", e.target.value)
            }
            disabled={!filters.departmentId || municipalities.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Todos los municipios</option>
            {municipalities.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.name || "Sin nombre"}
              </option>
            ))}
          </select>
          {!filters.departmentId && (
            <p className="text-xs text-gray-400 mt-1">
              Selecciona un departamento primero
            </p>
          )}
        </div>

        {/* Lugar de Votación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lugar de Votación
          </label>
          <input
            type="text"
            value={filters.votingLocation}
            onChange={(e) =>
              handleFilterChange("votingLocation", e.target.value)
            }
            placeholder="Buscar lugar de votación"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
