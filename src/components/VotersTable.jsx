import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Workbook } from "exceljs";
import { getVotingBooths } from "../api/votingbooths";
import { getDepartments, getMunicipalities } from "../api/departments";
import { usePermission } from "../hooks/usePermission";
import Pagination from "./Pagination";

export default function VotersTable({
  voters,
  allVotersForExport,
  filters,
  loading,
  pagination,
  currentPageProp,
  onPageChange,
  onExportRequest,
}) {
  const { can } = usePermission();
  const [enrichedVoters, setEnrichedVoters] = useState([]);
  const [boothsMap, setBoothsMap] = useState({});
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [municipalitiesMap, setMunicipalitiesMap] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  // Cargar datos base: centros de votación y departamentos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar centros de votación
        const booths = await getVotingBooths();
        const boothsMapTemp = {};
        booths.forEach((booth) => {
          boothsMapTemp[booth.id] = booth;
        });
        setBoothsMap(boothsMapTemp);

        // Cargar departamentos
        const departments = await getDepartments();
        const deptMapTemp = {};
        departments.forEach((dept) => {
          deptMapTemp[dept.id] = dept;
        });
        setDepartmentsMap(deptMapTemp);
      } catch (err) {
        console.error("Error al obtener datos base:", err);
      }
    };

    loadData();
  }, []);

  // Enriquecer votantes con datos de departamentos, municipios y centros
  useEffect(() => {
    const enrichVoters = () => {
      const enriched = voters.map((voter) => {
        let enrichedVoter = { ...voter };

        // Enriquecer con centro de votación
        if (
          voter.votingBoothId &&
          !voter.votingBooth &&
          boothsMap[voter.votingBoothId]
        ) {
          enrichedVoter.votingBooth = boothsMap[voter.votingBoothId];
        }

        // Enriquecer con departamento
        if (
          voter.departmentId &&
          !voter.department &&
          departmentsMap[voter.departmentId]
        ) {
          enrichedVoter.department = departmentsMap[voter.departmentId];
        }

        // Para municipios, si no existe, intentar obtenerlo del array de departamentos
        if (voter.municipalityId && !voter.municipality && voter.departmentId) {
          const dept = departmentsMap[voter.departmentId];
          if (
            dept &&
            dept.municipalities &&
            Array.isArray(dept.municipalities)
          ) {
            const mun = dept.municipalities.find(
              (m) => m.id === voter.municipalityId,
            );
            if (mun) {
              enrichedVoter.municipality = mun;
            }
          }
        }

        return enrichedVoter;
      });

      setEnrichedVoters(enriched);
    };

    if (voters.length > 0) {
      enrichVoters();
    } else {
      setEnrichedVoters([]);
    }
  }, [voters, boothsMap, departmentsMap, municipalitiesMap]);

  const sortedVoters = [...enrichedVoters].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = async () => {
    // Llamar al callback para obtener todos los datos sin paginación
    if (onExportRequest) {
      try {
        const allData = await onExportRequest();
        await performExport(allData);
      } catch (error) {
        console.error("Error al obtener datos para exportación:", error);
        alert("Error al obtener datos para exportación");
      }
    } else {
      // Fallback: si no hay callback, usar datos actuales
      const dataToExport =
        allVotersForExport && allVotersForExport.length > 0
          ? allVotersForExport
          : enrichedVoters;
      await performExport(dataToExport);
    }
  };

  const performExport = async (dataToExport) => {
    if (dataToExport.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Votantes");

    worksheet.columns = [
      { header: "ID", key: "ID", width: 8 },
      { header: "Nombre", key: "Nombre", width: 16 },
      { header: "Apellido", key: "Apellido", width: 16 },
      { header: "Identificación", key: "Identificación", width: 16 },
      { header: "Género", key: "Género", width: 12 },
      { header: "Teléfono", key: "Teléfono", width: 15 },
      { header: "Email", key: "Email", width: 26 },
      { header: "Departamento", key: "Departamento", width: 16 },
      { header: "Municipio", key: "Municipio", width: 16 },
      { header: "Barrio", key: "Barrio", width: 16 },
      { header: "Centro de Votación", key: "CentroVotacion", width: 20 },
    ];

    const headerFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0066B2" },
    };

    const headerFont = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    };

    const headerAlignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    };

    const headerBorder = {
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
    };

    worksheet.getRow(1).height = 28;
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = headerAlignment;
      cell.border = headerBorder;
    });

    const dataBorder = {
      left: { style: "thin", color: { argb: "FFD3D3D3" } },
      right: { style: "thin", color: { argb: "FFD3D3D3" } },
      top: { style: "thin", color: { argb: "FFD3D3D3" } },
      bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
    };

    const dataAlignment = {
      vertical: "top",
      wrapText: true,
      horizontal: "left",
    };

    const dataFont = {
      size: 10,
      color: { argb: "FF000000" },
    };

    const lightGrayFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF5F5F5" },
    };

    dataToExport.forEach((voter, rowIndex) => {
      const rowData = {
        ID: voter.id,
        Nombre: voter.firstName || "N/A",
        Apellido: voter.lastName || "N/A",
        Identificación: voter.identification || "N/A",
        Género:
          voter.gender === "M"
            ? "Masculino"
            : voter.gender === "F"
              ? "Femenino"
              : "Otro",
        Teléfono: voter.phone || "N/A",
        Email: voter.email || "N/A",
        Departamento: voter.department?.name || "N/A",
        Municipio: voter.municipality?.name || "N/A",
        Barrio: voter.neighborhood || "N/A",
        CentroVotacion:
          voter.votingBooth?.name && voter.votingTableId
            ? `${voter.votingBooth.name} - ${voter.votingTableId}`
            : voter.votingBooth?.name || "N/A",
      };

      const row = worksheet.addRow(rowData);
      row.height = 50;

      row.eachCell((cell, colNumber) => {
        cell.border = dataBorder;
        cell.alignment = dataAlignment;
        cell.font = dataFont;

        if (rowIndex % 2 === 0) {
          cell.fill = lightGrayFill;
        }

        if (colNumber === 13 || colNumber === 14) {
          cell.alignment = {
            vertical: "top",
            wrapText: true,
            horizontal: "left",
          };
        }
      });
    });

    worksheet.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];

    const fileName = `Informe_Votantes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column)
      return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? <span>▲</span> : <span>▼</span>;
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;
  const currentPage = currentPageProp || pagination?.page || 1;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Cargando votantes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Votantes Registrados ({pagination?.total || enrichedVoters.length})
        </h2>
        <button
          onClick={exportToExcel}
          disabled={!can("voters:read")}
          title={!can("voters:read") ? "No tienes permiso para exportar" : ""}
          className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md transition flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base ${
            can("voters:read")
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span>📊</span> Exportar a Excel
        </button>
      </div>

      {/* Vista Desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("id")}
              >
                ID <SortIcon column="id" />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("firstName")}
              >
                Nombre <SortIcon column="firstName" />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("lastName")}
              >
                Apellido <SortIcon column="lastName" />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Identificación
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Género
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Departamento
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Municipio
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Centro de Votación
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Candidatos
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Líderes
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedVoters.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No hay votantes
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      No se encontraron votantes con los filtros seleccionados.
                      Intenta ajustar los criterios de búsqueda o limpiar los
                      filtros.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedVoters.map((voter, idx) => (
                <tr
                  key={voter.id}
                  className={`border-b border-gray-200 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3 text-gray-700">
                    {voter.id || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.firstName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.lastName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {voter.identification || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.gender === "M"
                      ? "Masculino"
                      : voter.gender === "F"
                        ? "Femenino"
                        : "Otro"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.phone || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.department?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.municipality?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-semibold">
                    {voter.votingBooth?.name && voter.votingTableId
                      ? `${voter.votingBooth.name} - ${voter.votingTableId}`
                      : voter.votingBooth?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {voter.candidates && voter.candidates.length > 0 ? (
                        voter.candidates.map((candidate) => (
                          <span
                            key={candidate.id}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                            title={candidate.party || "Sin partido"}
                          >
                            {candidate.name || "Sin nombre"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {voter.leaders && voter.leaders.length > 0 ? (
                        voter.leaders.map((leader) => (
                          <span
                            key={leader.id}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                          >
                            {leader.name || "Sin nombre"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil - Tarjetas */}
      <div className="md:hidden space-y-3 p-3 sm:p-4">
        {sortedVoters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
              />
            </svg>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              No hay votantes
            </h3>
            <p className="text-gray-500 text-sm">
              No se encontraron votantes con los filtros seleccionados.
            </p>
          </div>
        ) : (
          sortedVoters.map((voter) => (
            <div
              key={voter.id}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {voter.firstName || "N/A"} {voter.lastName || "N/A"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    ID: {voter.id || "N/A"}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                  {voter.gender === "M"
                    ? "Masculino"
                    : voter.gender === "F"
                      ? "Femenino"
                      : "Otro"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm border-t border-gray-100 pt-2">
                <div>
                  <p className="text-gray-500 font-semibold">Identificación</p>
                  <p className="text-gray-900 font-mono">
                    {voter.identification || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Teléfono</p>
                  <p className="text-gray-900">{voter.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Email</p>
                  <p className="text-gray-900 break-all">
                    {voter.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Tipo de sangre</p>
                  <p className="text-gray-900">{voter.bloodType || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm border-t border-gray-100 pt-2">
                <div>
                  <p className="text-gray-500 font-semibold">Departamento</p>
                  <p className="text-gray-900">
                    {voter.department?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Municipio</p>
                  <p className="text-gray-900">
                    {voter.municipality?.name || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 font-semibold">Barrio</p>
                  <p className="text-gray-900">{voter.neighborhood || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm border-t border-gray-100 pt-2">
                <div>
                  <p className="text-gray-500 font-semibold">
                    Centro de Votación
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {voter.votingBooth?.name && voter.votingTableId
                      ? `${voter.votingBooth.name} - ${voter.votingTableId}`
                      : voter.votingBooth?.name || "N/A"}
                  </p>
                </div>
              </div>

              {voter.candidates && voter.candidates.length > 0 && (
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-gray-500 font-semibold text-xs sm:text-sm mb-2">
                    Candidatos
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {voter.candidates.map((candidate) => (
                      <span
                        key={candidate.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {candidate.name || "Sin nombre"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {voter.leaders && voter.leaders.length > 0 && (
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-gray-500 font-semibold text-xs sm:text-sm mb-2">
                    Líderes
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {voter.leaders.map((leader) => (
                      <span
                        key={leader.id}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        {leader.name || "Sin nombre"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Información y controles de paginación */}
      {pagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </div>
  );
}
