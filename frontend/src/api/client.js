import axios from 'axios'

const API_BASE = 'https://gwinshield-phishing-detector.onrender.com'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const checkURL = async (url, source = 'portal') => {
  const response = await client.post('/api/check-url', { url, source })
  return response.data
}

export const getHistory = async (limit = 50) => {
  const response = await client.get(`/api/history?limit=${limit}`)
  return response.data
}

export const getStats = async () => {
  const response = await client.get('/api/stats')
  return response.data
}

export const getHealth = async () => {
  const response = await client.get('/api/health')
  return response.data
}

export default client