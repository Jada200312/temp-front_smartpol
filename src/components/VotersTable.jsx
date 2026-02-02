import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Workbook } from "exceljs";
import { getVotingBooths } from "../../api/votingbooths";
import { getVotingTables } from "../../api/votingtables";

export default function VotersTable({
  voters,
  allVotersForExport,
  filters,
  loading,
  pagination,
  onPageChange,
}) {
  const [enrichedVoters, setEnrichedVoters] = useState([]);
  const [boothsMap, setBoothsMap] = useState({});
  const [tablesMap, setTablesMap] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  // Cargar todos los centros y mesas una sola vez
  useEffect(() => {
    const loadData = async () => {
      try {
        const booths = await getVotingBooths();
        const boothsMapTemp = {};
        booths.forEach((booth) => {
          boothsMapTemp[booth.id] = booth;
        });
        setBoothsMap(boothsMapTemp);

        const tables = await getVotingTables();
        const tablesMapTemp = {};
        tables.forEach((table) => {
          tablesMapTemp[table.id] = table;
        });
        setTablesMap(tablesMapTemp);
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };

    loadData();
  }, []);

  // Enriquecer votantes con datos del centro y mesa
  useEffect(() => {
    const enrichVoters = () => {
      const enriched = voters.map((voter) => {
        let enrichedVoter = { ...voter };

        if (
          voter.votingBoothId &&
          !voter.votingBooth &&
          boothsMap[voter.votingBoothId]
        ) {
          enrichedVoter.votingBooth = boothsMap[voter.votingBoothId];
        }

        if (
          voter.votingTableId &&
          !voter.votingTable &&
          tablesMap[voter.votingTableId]
        ) {
          enrichedVoter.votingTable = tablesMap[voter.votingTableId];
        }

        return enrichedVoter;
      });

      setEnrichedVoters(enriched);
    };

    if (
      voters.length > 0 &&
      Object.keys(boothsMap).length > 0 &&
      Object.keys(tablesMap).length > 0
    ) {
      enrichVoters();
    } else if (voters.length > 0) {
      setEnrichedVoters(voters);
    }
  }, [voters, boothsMap, tablesMap]);

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
    const dataToExport =
      allVotersForExport && allVotersForExport.length > 0
        ? allVotersForExport
        : enrichedVoters;

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
      { header: "Mesa de Votación", key: "MesaVotacion", width: 16 },
      { header: "Candidatos", key: "Candidatos", width: 45 },
      { header: "Líderes", key: "Líderes", width: 30 },
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
      const candidatosFormateados =
        voter.candidates
          ?.map((c) => `• ${c.name} (${c.party})`)
          .join("\n") || "N/A";

      const lideresFormateados =
        voter.leaders?.map((l) => `• ${l.name}`).join("\n") || "N/A";

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
        CentroVotacion: voter.votingBooth?.name || "N/A",
        MesaVotacion: voter.votingTable?.tableNumber
          ? `Mesa ${voter.votingTable.tableNumber}`
          : "N/A",
        Candidatos: candidatosFormateados,
        Líderes: lideresFormateados,
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
  const currentPage = pagination?.page || 1;

  const getPaginationPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]);
    let middleStart = Math.max(2, currentPage - 1);
    let middleEnd = Math.min(totalPages - 1, currentPage + 1);

    const middleCount = 3;
    const middleSize = middleEnd - middleStart + 1;
    if (middleSize < middleCount) {
      if (middleStart === 2) {
        middleEnd = Math.min(totalPages - 1, middleStart + middleCount - 1);
      } else {
        middleStart = Math.max(2, middleEnd - middleCount + 1);
      }
    }

    for (let i = middleStart; i <= middleEnd; i++) {
      pages.add(i);
    }

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < sortedPages.length; i++) {
      result.push(sortedPages[i]);
      if (
        i < sortedPages.length - 1 &&
        sortedPages[i + 1] - sortedPages[i] > 1
      ) {
        result.push("...");
      }
    }

    return result;
  };

  const startRecord = pagination ? (currentPage - 1) * pagination.limit + 1 : 1;
  const endRecord = pagination
    ? Math.min(currentPage * pagination.limit, pagination.total)
    : enrichedVoters.length;

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
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
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
                Mesa de Votación
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
                <td
                  colSpan="12"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No hay votantes registrados con los filtros aplicados
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
                  <td className="px-4 py-3 text-gray-700">{voter.id || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">{voter.firstName || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">{voter.lastName || "N/A"}</td>
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
                  <td className="px-4 py-3 text-gray-700">{voter.phone || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.department?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {voter.municipality?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-semibold">
                    {voter.votingBooth?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-semibold">
                    {voter.votingTable?.tableNumber
                      ? `Mesa ${voter.votingTable.tableNumber}`
                      : "N/A"}
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
          <div className="text-center py-6 text-gray-500 text-sm">
            No hay votantes registrados con los filtros aplicados
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
                  <p className="text-xs text-gray-500">ID: {voter.id || "N/A"}</p>
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
                  <p className="text-gray-900 font-mono">{voter.identification || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Teléfono</p>
                  <p className="text-gray-900">{voter.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Email</p>
                  <p className="text-gray-900 break-all">{voter.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Tipo de sangre</p>
                  <p className="text-gray-900">{voter.bloodType || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm border-t border-gray-100 pt-2">
                <div>
                  <p className="text-gray-500 font-semibold">Departamento</p>
                  <p className="text-gray-900">{voter.department?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Municipio</p>
                  <p className="text-gray-900">{voter.municipality?.name || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 font-semibold">Barrio</p>
                  <p className="text-gray-900">{voter.neighborhood || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm border-t border-gray-100 pt-2">
                <div>
                  <p className="text-gray-500 font-semibold">Centro de Votación</p>
                  <p className="text-gray-900 font-semibold">
                    {voter.votingBooth?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Mesa</p>
                  <p className="text-gray-900 font-semibold">
                    {voter.votingTable?.tableNumber
                      ? `Mesa ${voter.votingTable.tableNumber}`
                      : "N/A"}
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
        <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-gray-600">
            Mostrando {startRecord} a {endRecord} de {pagination.total} votantes
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-end">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              ← Anterior
            </button>

            <div className="flex gap-1">
              {getPaginationPages().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 sm:px-2 py-1 text-xs sm:text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => onPageChange(page)}
                    className={`px-1.5 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
