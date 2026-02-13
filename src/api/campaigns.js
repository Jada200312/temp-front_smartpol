import { API_URL, getAuthHeaders, apiCall } from "./config";

export async function getCampaigns() {
  // Obtener todas las campañas sin paginación
  return apiCall(`${API_URL}/campaigns?limit=10000`, {
    headers: getAuthHeaders(),
  }, "obtener campañas");
}

export async function getAllCampaigns() {
  // Obtener todas las campañas cargando todas las páginas
  try {
    let allCampaigns = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const data = await apiCall(`${API_URL}/campaigns?page=${page}&limit=100`, {
        headers: getAuthHeaders(),
      }, "obtener campañas página " + page);

      if (Array.isArray(data?.data)) {
        allCampaigns = [...allCampaigns, ...data.data];
      } else if (Array.isArray(data)) {
        allCampaigns = [...allCampaigns, ...data];
      }

      // Verificar si hay más páginas
      if (data?.pages && page >= data.pages) {
        hasMorePages = false;
      } else if (!data?.pages && (!data?.data || data.data.length < 100)) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    return allCampaigns;
  } catch (error) {
    console.error("Error loading all campaigns:", error);
    throw error;
  }
}

export async function getCampaignsWithPagination(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (search) {
    params.append('search', search);
  }
  
  const response = await apiCall(`${API_URL}/campaigns?${params.toString()}`, {
    headers: getAuthHeaders(),
  }, "obtener campañas con paginación");

  // Si el backend retorna un array directamente, formatearlo
  if (Array.isArray(response)) {
    return {
      data: response,
      page: page,
      pages: 1,
      total: response.length
    };
  }

  // Si el backend retorna un objeto con estructura diferente
  return {
    data: response.data || response,
    page: response.page || page,
    pages: response.pages || 1,
    total: response.total || response.length || 0
  };
}

export async function getCampaignById(campaignId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}`, {
    headers: getAuthHeaders(),
  }, "obtener campaña");
}

export async function getCampaignsByOrganization(organizationId) {
  return apiCall(`${API_URL}/campaigns/organization/${organizationId}`, {
    headers: getAuthHeaders(),
  }, "obtener campañas de la organización");
}

export async function getCampaignCandidates(campaignId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}/candidates`, {
    headers: getAuthHeaders(),
  }, "obtener candidatos de la campaña");
}

export async function getCampaignLeaders(campaignId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}/leaders`, {
    headers: getAuthHeaders(),
  }, "obtener líderes de la campaña");
}

export async function createCampaign(campaign) {
  return apiCall(`${API_URL}/campaigns`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(campaign),
  }, "crear campaña");
}

export async function updateCampaign(campaignId, campaign) {
  return apiCall(`${API_URL}/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(campaign),
  }, "actualizar campaña");
}

export async function deleteCampaign(campaignId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }, "eliminar campaña");
}

export async function assignUserToCampaign(campaignId, userId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}/users/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, "asignar usuario a campaña");
}

export async function removeUserFromCampaign(campaignId, userId) {
  return apiCall(`${API_URL}/campaigns/${campaignId}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }, "remover usuario de campaña");
}