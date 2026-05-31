import { runExpirationProcess } from './utils'

function ProcesoPlanificado({ data, setData }) {
  const handleExecute = () => {
    setData((previousData) => runExpirationProcess(previousData, new Date()))
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Proceso planificado cada X horas</h3>
          <p className="text-secondary">
            Esta simulacion actualiza las bolsas con puntos vencidos y deja registro de la ultima ejecucion.
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="small text-secondary">Ultima ejecucion</div>
                <div>{new Date(data.procesos.ultima_ejecucion).toLocaleString('es-ES')}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="small text-secondary">Proxima ejecucion</div>
                <div>{new Date(data.procesos.proxima_ejecucion).toLocaleString('es-ES')}</div>
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
                    <td>{bolsa.cliente_id}</td>
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
