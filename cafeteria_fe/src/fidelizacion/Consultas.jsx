import { useMemo, useState } from 'react'
import {
  getClienteNombre,
  getConceptoDescripcion,
  getClienteSaldo
} from './utils'

function Consultas({ data }) {
  const [consulta, setConsulta] = useState('uso_concepto')
  const [valor, setValor] = useState('')

  const rows = useMemo(() => {
    switch (consulta) {
      case 'uso_concepto':
        return data.usos
          .filter((uso) =>
            getConceptoDescripcion(data.conceptos, uso.concepto_id)
              .toLowerCase()
              .includes(valor.toLowerCase())
          )
          .map((uso) => ({
            referencia: `Uso #${uso.id}`,
            detalle: getConceptoDescripcion(data.conceptos, uso.concepto_id),
            extra: getClienteNombre(data.clientes, uso.cliente_id)
          }))
      case 'uso_fecha':
        return data.usos
          .filter((uso) => uso.fecha.includes(valor))
          .map((uso) => ({
            referencia: `Uso #${uso.id}`,
            detalle: uso.fecha,
            extra: `${getClienteNombre(data.clientes, uso.cliente_id)} - ${uso.puntaje_utilizado} pts`
          }))
      case 'uso_cliente':
        return data.usos
          .filter((uso) =>
            getClienteNombre(data.clientes, uso.cliente_id)
              .toLowerCase()
              .includes(valor.toLowerCase())
          )
          .map((uso) => ({
            referencia: `Uso #${uso.id}`,
            detalle: getClienteNombre(data.clientes, uso.cliente_id),
            extra: getConceptoDescripcion(data.conceptos, uso.concepto_id)
          }))
      case 'bolsa_cliente':
        return data.bolsas
          .filter((bolsa) =>
            getClienteNombre(data.clientes, bolsa.cliente_id)
              .toLowerCase()
              .includes(valor.toLowerCase())
          )
          .map((bolsa) => ({
            referencia: `Bolsa #${bolsa.id}`,
            detalle: getClienteNombre(data.clientes, bolsa.cliente_id),
            extra: `Saldo ${bolsa.saldo_puntos}`
          }))
      case 'bolsa_rango': {
        const minimo = Number(valor || 0)
        return data.bolsas
          .filter((bolsa) => Number(bolsa.saldo_puntos) >= minimo)
          .map((bolsa) => ({
            referencia: `Bolsa #${bolsa.id}`,
            detalle: `Saldo ${bolsa.saldo_puntos}`,
            extra: getClienteNombre(data.clientes, bolsa.cliente_id)
          }))
      }
      case 'clientes_vencer': {
        const dias = Number(valor || 0)
        const baseDate = new Date()
        const limitDate = new Date()
        limitDate.setDate(limitDate.getDate() + dias)

        return data.bolsas
          .filter((bolsa) => {
            const expirationDate = new Date(`${bolsa.fecha_caducidad}T00:00:00`)
            return !bolsa.vencido && expirationDate >= baseDate && expirationDate <= limitDate
          })
          .map((bolsa) => ({
            referencia: getClienteNombre(data.clientes, bolsa.cliente_id),
            detalle: `Vence ${bolsa.fecha_caducidad}`,
            extra: `Saldo ${bolsa.saldo_puntos}`
          }))
      }
      case 'clientes_busqueda':
        return data.clientes
          .filter((cliente) => {
            const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
            return (
              fullName.includes(valor.toLowerCase()) ||
              cliente.apellido.toLowerCase().includes(valor.toLowerCase()) ||
              cliente.fecha_nacimiento.includes(valor)
            )
          })
          .map((cliente) => ({
            referencia: `${cliente.nombre} ${cliente.apellido}`,
            detalle: `${cliente.tipo_documento} ${cliente.numero_documento}`,
            extra: `Saldo actual ${getClienteSaldo(data.bolsas, cliente.id)}`
          }))
      default:
        return []
    }
  }, [consulta, data, valor])

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-3">Consultas y reportes</h3>
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-5">
            <label className="form-label">Consulta</label>
            <select
              className="form-select"
              value={consulta}
              onChange={(event) => setConsulta(event.target.value)}
            >
              <option value="uso_concepto">Uso de puntos por concepto</option>
              <option value="uso_fecha">Uso de puntos por fecha</option>
              <option value="uso_cliente">Uso de puntos por cliente</option>
              <option value="bolsa_cliente">Bolsa por cliente</option>
              <option value="bolsa_rango">Bolsa por rango de puntos</option>
              <option value="clientes_vencer">Clientes con puntos a vencer</option>
              <option value="clientes_busqueda">Clientes por nombre, apellido o cumpleanos</option>
            </select>
          </div>
          <div className="col-12 col-md-7">
            <label className="form-label">Valor de busqueda</label>
            <input
              className="form-control"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="Ingrese texto, fecha o cantidad"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Detalle</th>
                <th>Extra</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row, index) => (
                  <tr key={`${row.referencia}-${index}`}>
                    <td>{row.referencia}</td>
                    <td>{row.detalle}</td>
                    <td>{row.extra}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-secondary py-4">
                    Sin resultados para la consulta actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Consultas
