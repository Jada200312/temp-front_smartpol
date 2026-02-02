import { API_URL } from './config';

export async function getVotingBooths() {
  const response = await fetch(`${API_URL}/voting-booths`);
  if (!response.ok) throw new Error('Error al obtener centros de votación');
  return response.json();
}

export async function getVotingBoothById(boothId) {
  const response = await fetch(`${API_URL}/voting-booths/${boothId}`);
  if (!response.ok) throw new Error('Error al obtener centro de votación');
  return response.json();
}

export async function getBoothsByMunicipality(municipalityId) {
  const response = await fetch(`${API_URL}/voting-booths/by-municipality/${municipalityId}`);
  if (!response.ok) throw new Error('Error al obtener centros de votación');
  return response.json();
}

export async function createVotingBooth(booth) {
  const response = await fetch(`${API_URL}/voting-booths`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booth),
  });
  if (!response.ok) throw new Error('Error al crear centro de votación');
  return response.json();
}

export async function updateVotingBooth(boothId, booth) {
  const response = await fetch(`${API_URL}/voting-booths/${boothId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booth),
  });
  if (!response.ok) throw new Error('Error al actualizar centro de votación');
  return response.json();
}

export async function deleteVotingBooth(boothId) {
  const response = await fetch(`${API_URL}/voting-booths/${boothId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar centro de votación');
  return true;
}