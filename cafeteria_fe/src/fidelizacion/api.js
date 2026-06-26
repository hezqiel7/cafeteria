import { buildApiUrl } from '../config'


const jsonHeaders = (accesstoken) => ({
  Authorization: `Bearer ${accesstoken}`,
  'Content-Type': 'application/json'
})


const requestJson = async (accesstoken, path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      ...(options.body ? jsonHeaders(accesstoken) : { Authorization: `Bearer ${accesstoken}` }),
      ...(options.headers || {})
    }
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo completar la operacion.')
  }

  return data
}


export const getFidelizacionResumen = (accesstoken) => (
  requestJson(accesstoken, '/fidelizacion/resumen/')
)


export const createFidelizacionItem = (accesstoken, resource, item) => (
  requestJson(accesstoken, `/fidelizacion/${resource}/`, {
    method: 'POST',
    body: JSON.stringify(item)
  })
)


export const updateFidelizacionItem = (accesstoken, resource, item) => (
  requestJson(accesstoken, `/fidelizacion/${resource}/${item.id}/`, {
    method: 'PUT',
    body: JSON.stringify(item)
  })
)


export const deleteFidelizacionItem = (accesstoken, resource, itemId) => (
  requestJson(accesstoken, `/fidelizacion/${resource}/${itemId}/`, {
    method: 'DELETE'
  })
)


export const cargarPuntos = (accesstoken, payload) => (
  requestJson(accesstoken, '/fidelizacion/servicios/cargar-puntos/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
)


export const usarPuntos = (accesstoken, payload) => (
  requestJson(accesstoken, '/fidelizacion/servicios/usar-puntos/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
)


export const consultarEquivalencia = (accesstoken, monto) => (
  requestJson(accesstoken, `/fidelizacion/servicios/equivalencia/?monto=${encodeURIComponent(monto || 0)}`)
)


export const consultarFidelizacion = (accesstoken, tipo, valor) => (
  requestJson(
    accesstoken,
    `/fidelizacion/consultas/?tipo=${encodeURIComponent(tipo)}&valor=${encodeURIComponent(valor || '')}`
  )
)


export const ejecutarVencimientos = (accesstoken) => (
  requestJson(accesstoken, '/fidelizacion/procesos/vencimientos/ejecutar/', {
    method: 'POST',
    body: JSON.stringify({})
  })
)
