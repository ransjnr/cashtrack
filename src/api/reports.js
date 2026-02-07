import { request } from './client.js'

export async function getReports() {
  return request('/reports', { method: 'GET' })
}

export async function getReport(id) {
  return request(`/reports/${id}`, { method: 'GET' })
}

export async function createReport(payload) {
  return request('/reports', { method: 'POST', body: payload })
}

export async function updateReport(id, payload) {
  return request(`/reports/${id}`, { method: 'PUT', body: payload })
}

export async function deleteReport(id) {
  return request(`/reports/${id}`, { method: 'DELETE' })
}
