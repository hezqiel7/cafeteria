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
  loadFidelizacionData,
  resetFidelizacionData,
  saveFidelizacionData
} from './fidelizacion/storage'

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

function FidelizacionApp() {
  const [activeTab, setActiveTab] = useState('clientes')
  const [data, setData] = useState(() => loadFidelizacionData())

  useEffect(() => {
    saveFidelizacionData(data)
  }, [data])

  const updateSection = (section, value) => {
    setData((previousData) => ({
      ...previousData,
      [section]: value
    }))
  }

  const handleReset = () => {
    setData(resetFidelizacionData())
    setActiveTab('clientes')
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'clientes':
        return (
          <Clientes
            clientes={data.clientes}
            setClientes={(clientes) => updateSection('clientes', clientes)}
          />
        )
      case 'conceptos':
        return (
          <Conceptos
            conceptos={data.conceptos}
            setConceptos={(conceptos) => updateSection('conceptos', conceptos)}
          />
        )
      case 'reglas':
        return (
          <Reglas
            reglas={data.reglas}
            setReglas={(reglas) => updateSection('reglas', reglas)}
          />
        )
      case 'vencimientos':
        return (
          <Vencimientos
            vencimientos={data.vencimientos}
            setVencimientos={(vencimientos) => updateSection('vencimientos', vencimientos)}
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
        return <Consultas data={data} />
      case 'servicios':
        return <Servicios data={data} setData={setData} />
      case 'proceso':
        return <ProcesoPlanificado data={data} setData={setData} />
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
            Modulo frontend del segundo parcial con datos simulados y persistencia local.
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={handleReset}>
          Restablecer datos de ejemplo
        </button>
      </div>

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
