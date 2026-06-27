import { useState } from 'react'
import { getClienteNombre } from './utils'

function ProcesoPlanificado({ data, onEjecutarProceso }) {
  const [mensaje, setMensaje] = useState('')

  const formatDateTime = (value) => {
    if (!value) {
      return 'Sin ejecucion'
    }
    return new Date(value).toLocaleString('es-ES')
  }

  const handleExecute = async () => {
    try {
      const response = await onEjecutarProceso()
      const vencidas = response.proceso?.bolsas_vencidas || 0
      setMensaje(`Proceso ejecutado. Bolsas vencidas detectadas: ${vencidas}.`)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Proceso planificado cada X horas</h3>
          <p className="text-secondary">
            Actualiza las bolsas con puntos vencidos y deja registro de la ultima ejecucion.
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="small text-secondary">Ultima ejecucion</div>
                <div>{formatDateTime(data.procesos.ultima_ejecucion)}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="small text-secondary">Proxima ejecucion</div>
                <div>{formatDateTime(data.procesos.proxima_ejecucion)}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="small text-secondary">Bolsas vencidas detectadas</div>
                <div>{data.procesos.bolsas_vencidas}</div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleExecute}>
            Ejecutar ahora
          </button>
          {mensaje && <div className="alert alert-secondary mt-3 mb-0">{mensaje}</div>}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="h6 mb-3">Resumen de bolsas luego del proceso</h4>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Caducidad</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.bolsas.map((bolsa) => (
                  <tr key={bolsa.id}>
                    <td>{bolsa.id}</td>
                    <td>{getClienteNombre(data.clientes, bolsa.cliente_id)}</td>
                    <td>{bolsa.fecha_caducidad}</td>
                    <td>{bolsa.saldo_puntos}</td>
                    <td>{bolsa.vencido ? 'Vencido' : 'Vigente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcesoPlanificado
