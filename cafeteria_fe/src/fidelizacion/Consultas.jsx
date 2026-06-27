import { useEffect, useState } from 'react'

function Consultas({ data, onConsultar }) {
  const [consulta, setConsulta] = useState('uso_concepto')
  const [valor, setValor] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadRows = async () => {
      setLoading(true)
      try {
        const nextRows = await onConsultar(consulta, valor)
        if (!ignore) {
          setRows(nextRows)
        }
      } catch (error) {
        if (!ignore) {
          setRows([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadRows()
    return () => {
      ignore = true
    }
  }, [consulta, valor, data])

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-3">Consultas y reportes</h3>
        {loading && <div className="alert alert-info">Consultando datos...</div>}
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
