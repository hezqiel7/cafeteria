import { getClienteNombre } from './utils'

function BolsaPuntos({ bolsas, clientes }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-3">Bolsa de puntos</h3>
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha asignacion</th>
                <th>Fecha caducidad</th>
                <th>Asignado</th>
                <th>Utilizado</th>
                <th>Saldo</th>
                <th>Monto operacion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {bolsas.map((bolsa) => (
                <tr key={bolsa.id}>
                  <td>{bolsa.id}</td>
                  <td>{getClienteNombre(clientes, bolsa.cliente_id)}</td>
                  <td>{bolsa.fecha_asignacion}</td>
                  <td>{bolsa.fecha_caducidad}</td>
                  <td>{bolsa.puntaje_asignado}</td>
                  <td>{bolsa.puntaje_utilizado}</td>
                  <td>{bolsa.saldo_puntos}</td>
                  <td>{bolsa.monto_operacion}</td>
                  <td>
                    <span className={`badge ${bolsa.vencido ? 'bg-danger' : 'bg-success'}`}>
                      {bolsa.vencido ? 'Vencido' : 'Vigente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BolsaPuntos
