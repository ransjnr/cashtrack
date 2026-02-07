import { request } from './client.js'

export async function getOutflows() {
  return request('/outflows', { method: 'GET' })
}

export async function getOutflow(id) {
  return request(`/outflows/${id}`, { method: 'GET' })
}

export async function createOutflow(payload) {
  return request('/outflows', { method: 'POST', body: payload })
}

export async function updateOutflow(id, payload) {
  return request(`/outflows/${id}`, { method: 'PUT', body: payload })
}

export async function deleteOutflow(id) {
  return request(`/outflows/${id}`, { method: 'DELETE' })
}
