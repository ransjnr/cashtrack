import { request } from './client.js'

export async function getBudgets() {
  return request('/budgets', { method: 'GET' })
}

export async function getBudget(id) {
  return request(`/budgets/${id}`, { method: 'GET' })
}

export async function createBudget(payload) {
  return request('/budgets', { method: 'POST', body: payload })
}

export async function updateBudget(id, payload) {
  return request(`/budgets/${id}`, { method: 'PUT', body: payload })
}

export async function deleteBudget(id) {
  return request(`/budgets/${id}`, { method: 'DELETE' })
}
