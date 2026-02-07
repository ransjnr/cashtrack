import { request } from './client.js'

export async function getInflows() {
  return request('/inflows', { method: 'GET' })
}

export async function getInflow(id) {
  return request(`/inflows/${id}`, { method: 'GET' })
}

export async function createInflow(payload) {
  return request('/inflows', { method: 'POST', body: payload })
}

export async function updateInflow(id, payload) {
  return request(`/inflows/${id}`, { method: 'PUT', body: payload })
}

export async function deleteInflow(id) {
  return request(`/inflows/${id}`, { method: 'DELETE' })
}
