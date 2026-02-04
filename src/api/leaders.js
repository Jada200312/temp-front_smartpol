import { API_URL, getAuthHeaders, apiCall } from './config';

export async function getLeaders() {
  // Obtener todos los líderes sin paginación (con límite alto)
  return apiCall(`${API_URL}/leaders?limit=10000`, {
    headers: getAuthHeaders(),
  }, 'obtener líderes');
}

export async function getLeadersWithPagination(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (search) {
    params.append('search', search);
  }
  return apiCall(`${API_URL}/leaders?${params.toString()}`, {
    headers: getAuthHeaders(),
  }, 'obtener líderes con paginación');
}

export async function getCandidatesByLeader(leaderId) {
  return apiCall(`${API_URL}/leaders/${leaderId}/candidates`, {
    headers: getAuthHeaders(),
  }, 'obtener candidatos');
}

export async function createLeader(leaderData) {
  return apiCall(`${API_URL}/leaders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leaderData),
  }, 'crear líder');
}

export async function assignCandidatesToLeader(leaderId, candidateIds) {
  return apiCall(`${API_URL}/leaders/${leaderId}/assign-candidates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ candidateIds }),
  }, 'asignar candidatos');
}

export async function addCandidatesToLeader(leaderId, candidateIds) {
  return apiCall(`${API_URL}/leaders/${leaderId}/add-candidates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ candidateIds }),
  }, 'agregar candidatos');
}

export async function removeCandidatesFromLeader(leaderId, candidateIds) {
  return apiCall(`${API_URL}/leaders/${leaderId}/remove-candidates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ candidateIds }),
  }, 'remover candidatos');
}

export async function updateLeader(leaderId, leaderData) {
  return apiCall(`${API_URL}/leaders/${leaderId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(leaderData),
  }, 'actualizar líder');
}

export async function deleteLeader(leaderId) {
  return apiCall(`${API_URL}/leaders/${leaderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }, 'eliminar líder');
}