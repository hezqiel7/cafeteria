import { useState } from 'react'
import { getClienteNombre, getConceptoDescripcion } from './utils'

function UsoPuntos({ usos, bolsas, clientes, conceptos }) {
  const [selectedUsoId, setSelectedUsoId] = useState(usos[0]?.id || null)

  const selectedUso = usos.find((uso) => uso.id === selectedUsoId) || usos[0] || null

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-3">Uso de puntos</h3>
        <div className="table-responsive mb-4">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Puntos utilizados</th>
                <th className="text-end">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {usos.map((uso) => (
                <tr key={uso.id}>
                  <td>{uso.id}</td>
                  <td>{getClienteNombre(clientes, uso.cliente_id)}</td>
                  <td>{uso.fecha}</td>
                  <td>{getConceptoDescripcion(conceptos, uso.concepto_id)}</td>
                  <td>{uso.puntaje_utilizado}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedUsoId(uso.id)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card bg-light border-0">
          <div className="card-body">
            <h4 className="h6 mb-3">Detalle FIFO del uso seleccionado</h4>
            {selectedUso ? (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Bolsa</th>
                      <th>Puntos utilizados</th>
                      <th>Fecha de caducidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUso.detalle.map((detalle) => {
                      const bolsa = bolsas.find((item) => item.id === detalle.bolsa_id)
                      return (
                        <tr key={`${selectedUso.id}-${detalle.id}`}>
                          <td>{detalle.bolsa_id}</td>
                          <td>{detalle.puntaje_utilizado}</td>
                          <td>{bolsa ? bolsa.fecha_caducidad : 'Sin bolsa'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mb-0 text-secondary">Todavia no hay usos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsoPuntos
