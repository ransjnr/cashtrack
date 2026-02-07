import { request } from './client.js'

export async function getInflows() {
  return request('/inflows', { method: 'GET' })
}

export async function createInflow(payload) {
  return request('/inflows', { method: 'POST', body: payload })
}
