import { request } from './client.js'

export async function getWallets() {
  return request('/wallets', { method: 'GET' })
}

export async function getWallet(id) {
  return request(`/wallets/${id}`, { method: 'GET' })
}

export async function createWallet(payload) {
  return request('/wallets', { method: 'POST', body: payload })
}

export async function updateWallet(id, payload) {
  return request(`/wallets/${id}`, { method: 'PUT', body: payload })
}

export async function deleteWallet(id) {
  return request(`/wallets/${id}`, { method: 'DELETE' })
}
