import { API_URL } from './config';

export async function getVotingTables() {
  const response = await fetch(`${API_URL}/voting-tables`);
  if (!response.ok) throw new Error('Error al obtener mesas de votación');
  return response.json();
}

export async function getVotingTableById(tableId) {
  const response = await fetch(`${API_URL}/voting-tables/${tableId}`);
  if (!response.ok) throw new Error('Error al obtener mesa de votación');
  return response.json();
}

export async function createVotingTable(table) {
  const response = await fetch(`${API_URL}/voting-tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(table),
  });
  if (!response.ok) throw new Error('Error al crear mesa de votación');
  return response.json();
}

export async function updateVotingTable(tableId, table) {
  const response = await fetch(`${API_URL}/voting-tables/${tableId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(table),
  });
  if (!response.ok) throw new Error('Error al actualizar mesa de votación');
  return response.json();
}

export async function deleteVotingTable(tableId) {
  const response = await fetch(`${API_URL}/voting-tables/${tableId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar mesa de votación');
  return true;
}

export async function getTablesByBooth(boothId) {
  const response = await fetch(`${API_URL}/voting-tables/by-booth/${boothId}`);
  if (!response.ok) throw new Error('Error al obtener mesas del centro');
  return response.json();
}