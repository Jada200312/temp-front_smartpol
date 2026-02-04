import { API_URL, getAuthHeaders, apiCall } from "./config";

export async function getCandidates() {
  // Obtener todos los candidatos sin paginación (con límite alto)
  return apiCall(`${API_URL}/candidates?limit=10000`, {
    headers: getAuthHeaders(),
  }, "obtener candidatos");
}

export async function getCandidatesWithPagination(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (search) {
    params.append('search', search);
  }
  return apiCall(`${API_URL}/candidates?${params.toString()}`, {
    headers: getAuthHeaders(),
  }, "obtener candidatos con paginación");
}

export async function getCandidateById(candidateId) {
  return apiCall(`${API_URL}/candidates/${candidateId}`, {
    headers: getAuthHeaders(),
  }, "obtener candidato");
}

export async function createCandidate(candidate) {
  return apiCall(`${API_URL}/candidates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(candidate),
  }, "crear candidato");
}

export async function updateCandidate(candidateId, candidate) {
  return apiCall(`${API_URL}/candidates/${candidateId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(candidate),
  }, "actualizar candidato");
}

export async function deleteCandidate(candidateId) {
  return apiCall(`${API_URL}/candidates/${candidateId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }, "eliminar candidato");
  return true;
}
