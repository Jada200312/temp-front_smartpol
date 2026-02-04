import { API_URL, getAuthHeaders, apiCall } from "./config";

export async function getVoters(page = 1, limit = 20) {
  return apiCall(`${API_URL}/voters?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  }, "obtener votantes");
}

export async function getVoterByIdentification(identification) {
  try {
    const result = await apiCall(`${API_URL}/voters/by-identification/${identification}`, {
      headers: getAuthHeaders(),
    }, "obtener votante");
    
    // Si el resultado es null o no tiene id, no es un votante válido
    if (!result || !result.id) {
      return null;
    }
    
    return result;
  } catch (error) {
    // Si no existe el votante o hay error, retornar null
    // No lanzar el error para que la validación sea silenciosa
    return null;
  }
}

export async function createVoter(voter) {
  return apiCall(`${API_URL}/voters`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(voter),
  }, "crear votante");
}

export async function updateVoter(voterId, voter) {
  return apiCall(`${API_URL}/voters/${voterId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(voter),
  }, "actualizar votante");
}

export async function deleteVoter(voterId) {
  return apiCall(`${API_URL}/voters/${voterId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }, "eliminar votante");
}

export async function getAssignedCandidates(voterId) {
  try {
    return await apiCall(`${API_URL}/voters/${voterId}/assign-candidate`, {
      headers: getAuthHeaders(),
    }, "obtener candidatos asignados");
  } catch (error) {
    // Si no hay candidatos asignados, retornar array vacío
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function assignCandidatesToVoter(voterId, candidateIds, leaderId) {
  return apiCall(`${API_URL}/voters/${voterId}/assign-candidate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      candidate_ids: candidateIds,
      leader_id: leaderId,
    }),
  }, "asignar candidatos al votante");
}

export async function updateAssignedCandidates(voterId, candidateIds, leaderId) {
  return apiCall(`${API_URL}/voters/${voterId}/assign-candidate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      candidate_ids: candidateIds,
      leader_id: leaderId,
    }),
  }, "actualizar candidatos asignados");
}
