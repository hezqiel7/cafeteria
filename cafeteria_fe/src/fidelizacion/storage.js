import { initialFidelizacionData } from './mockData'

const STORAGE_KEY = 'cafeteria_fidelizacion_data'

const cloneData = (data) => JSON.parse(JSON.stringify(data))

export const loadFidelizacionData = () => {
  const storedData = localStorage.getItem(STORAGE_KEY)

  if (!storedData) {
    const seededData = cloneData(initialFidelizacionData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seededData))
    return seededData
  }

  try {
    return JSON.parse(storedData)
  } catch (error) {
    const fallbackData = cloneData(initialFidelizacionData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData))
    return fallbackData
  }
}

export const saveFidelizacionData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const resetFidelizacionData = () => {
  const resetData = cloneData(initialFidelizacionData)
  saveFidelizacionData(resetData)
  return resetData
}
