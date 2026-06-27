import { useEffect, useState } from 'react'
import Clientes from './fidelizacion/Clientes'
import Conceptos from './fidelizacion/Conceptos'
import Reglas from './fidelizacion/Reglas'
import Vencimientos from './fidelizacion/Vencimientos'
import BolsaPuntos from './fidelizacion/BolsaPuntos'
import UsoPuntos from './fidelizacion/UsoPuntos'
import Consultas from './fidelizacion/Consultas'
import Servicios from './fidelizacion/Servicios'
import ProcesoPlanificado from './fidelizacion/ProcesoPlanificado'
import {
  cargarPuntos,
  consultarEquivalencia,
  consultarFidelizacion,
  createFidelizacionItem,
  deleteFidelizacionItem,
  ejecutarVencimientos,
  getFidelizacionResumen,
  updateFidelizacionItem,
  usarPuntos
} from './fidelizacion/api'

const tabs = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'conceptos', label: 'Conceptos' },
  { id: 'reglas', label: 'Reglas' },
  { id: 'vencimientos', label: 'Vencimientos' },
  { id: 'bolsa', label: 'Bolsa' },
  { id: 'usos', label: 'Uso de puntos' },
  { id: 'consultas', label: 'Consultas' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'proceso', label: 'Proceso planificado' }
]

const emptyData = {
  clientes: [],
  conceptos: [],
  reglas: [],
  vencimientos: [],
  bolsas: [],
  usos: [],
  procesos: {
    ultima_ejecucion: null,
    proxima_ejecucion: null,
    bolsas_vencidas: 0
  }
}

const sectionResources = {
  clientes: 'clientes',
  conceptos: 'conceptos',
  reglas: 'reglas',
  vencimientos: 'vencimientos'
}

function FidelizacionApp({ accesstoken }) {
  const [activeTab, setActiveTab] = useState('clientes')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshData()
  }, [accesstoken])

  const refreshData = async () => {
    if (!accesstoken) {
      return
    }

    try {
      setError('')
      setLoading(true)
      const resumen = await getFidelizacionResumen(accesstoken)
      setData({ ...emptyData, ...resumen })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSection = (section, value) => {
    setData((previousData) => ({
      ...previousData,
      [section]: value
    }))
  }

  const syncSection = async (section, nextItems) => {
    const resource = sectionResources[section]
    const previousItems = data[section] || []
    updateSection(section, nextItems)

    try {
      setError('')
      const previousIds = previousItems.map((item) => Number(item.id))
      const nextIds = nextItems.map((item) => Number(item.id))
      const deletedItems = previousItems.filter((item) => !nextIds.includes(Number(item.id)))
      const createdItems = nextItems.filter((item) => !previousIds.includes(Number(item.id)))
      const updatedItems = nextItems.filter((item) => {
        const previousItem = previousItems.find((previous) => Number(previous.id) === Number(item.id))
        return previousItem && JSON.stringify(previousItem) !== JSON.stringify(item)
      })

      for (const item of deletedItems) {
        await deleteFidelizacionItem(accesstoken, resource, item.id)
      }

      for (const item of createdItems) {
        await createFidelizacionItem(accesstoken, resource, item)
      }

      for (const item of updatedItems) {
        await updateFidelizacionItem(accesstoken, resource, item)
      }

      await refreshData()
    } catch (requestError) {
      setError(requestError.message)
      await refreshData()
    }
  }

  const handleCargarPuntos = async (payload) => {
    const response = await cargarPuntos(accesstoken, payload)
    setData({ ...emptyData, ...response.resumen })
    return response
  }

  const handleUsarPuntos = async (payload) => {
    const response = await usarPuntos(accesstoken, payload)
    setData({ ...emptyData, ...response.resumen })
    return response
  }

  const handleConsultarEquivalencia = async (monto) => {
    return consultarEquivalencia(accesstoken, monto)
  }

  const handleConsultar = async (tipo, valor) => {
    const response = await consultarFidelizacion(accesstoken, tipo, valor)
    return response.rows || []
  }

  const handleEjecutarProceso = async () => {
    const response = await ejecutarVencimientos(accesstoken)
    setData({ ...emptyData, ...response.resumen })
    return response
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'clientes':
        return (
          <Clientes
            clientes={data.clientes}
            setClientes={(clientes) => syncSection('clientes', clientes)}
          />
        )
      case 'conceptos':
        return (
          <Conceptos
            conceptos={data.conceptos}
            setConceptos={(conceptos) => syncSection('conceptos', conceptos)}
          />
        )
      case 'reglas':
        return (
          <Reglas
            reglas={data.reglas}
            setReglas={(reglas) => syncSection('reglas', reglas)}
          />
        )
      case 'vencimientos':
        return (
          <Vencimientos
            vencimientos={data.vencimientos}
            setVencimientos={(vencimientos) => syncSection('vencimientos', vencimientos)}
          />
        )
      case 'bolsa':
        return <BolsaPuntos bolsas={data.bolsas} clientes={data.clientes} />
      case 'usos':
        return (
          <UsoPuntos
            usos={data.usos}
            bolsas={data.bolsas}
            clientes={data.clientes}
            conceptos={data.conceptos}
          />
        )
      case 'consultas':
        return <Consultas data={data} onConsultar={handleConsultar} />
      case 'servicios':
        return (
          <Servicios
            data={data}
            onCargarPuntos={handleCargarPuntos}
            onUsarPuntos={handleUsarPuntos}
            onConsultarEquivalencia={handleConsultarEquivalencia}
          />
        )
      case 'proceso':
        return <ProcesoPlanificado data={data} onEjecutarProceso={handleEjecutarProceso} />
      default:
        return null
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="h4 mb-1">Sistema de Fidelizacion de Clientes</h2>
          <p className="text-secondary mb-0">
            Gestion de clientes, reglas, puntos, usos y vencimientos.
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={refreshData}>
          Actualizar datos
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Cargando datos de fidelizacion...</div>}

      <div className="row g-3">
        <div className="col-12 col-xl-3">
          <div className="list-group shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`list-group-item list-group-item-action ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-12 col-xl-9">{renderActiveTab()}</div>
      </div>
    </div>
  )
}

export default FidelizacionApp
