import { useMemo, useState } from 'react'
import { getClienteNombre, getClienteSaldo } from './utils'

function Servicios({ data, onCargarPuntos, onUsarPuntos, onConsultarEquivalencia }) {
  const [clienteCargaId, setClienteCargaId] = useState(data.clientes[0]?.id || '')
  const [montoCarga, setMontoCarga] = useState('')
  const [clienteUsoId, setClienteUsoId] = useState(data.clientes[0]?.id || '')
  const [conceptoUsoId, setConceptoUsoId] = useState(data.conceptos[0]?.id || '')
  const [montoConsulta, setMontoConsulta] = useState('')
  const [puntosEquivalentes, setPuntosEquivalentes] = useState(0)
  const [mensaje, setMensaje] = useState('')

  const saldoCliente = useMemo(
    () => getClienteSaldo(data.bolsas, clienteUsoId),
    [data.bolsas, clienteUsoId]
  )

  const handleCargarPuntos = async () => {
    const monto = Number(montoCarga)

    if (!clienteCargaId || !monto) {
      setMensaje('No se pudo generar la carga de puntos con los datos ingresados.')
      return
    }

    try {
      const response = await onCargarPuntos({
        cliente_id: Number(clienteCargaId),
        monto_operacion: monto
      })
      const puntos = response.bolsa?.puntaje_asignado || 0
      setMontoCarga('')
      setMensaje(
        `Se cargaron ${puntos} puntos para ${getClienteNombre(data.clientes, clienteCargaId)}.`
      )
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const handleUsarPuntos = async () => {
    const concepto = data.conceptos.find(
      (item) => Number(item.id) === Number(conceptoUsoId)
    )
    const cliente = data.clientes.find(
      (item) => Number(item.id) === Number(clienteUsoId)
    )

    if (!clienteUsoId || !concepto || !cliente) {
      setMensaje('No se pudo registrar el uso de puntos.')
      return
    }

    try {
      await onUsarPuntos({
        cliente_id: Number(clienteUsoId),
        concepto_id: Number(conceptoUsoId)
      })
      setMensaje(
        `Se registraron ${concepto.puntos_requeridos} puntos utilizados para ${getClienteNombre(
          data.clientes,
          clienteUsoId
        )} y se genero el comprobante para ${cliente.email}.`
      )
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const handleConsultarEquivalencia = async () => {
    try {
      const response = await onConsultarEquivalencia(Number(montoConsulta))
      setPuntosEquivalentes(response.puntos || 0)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Servicio de carga de puntos</h3>
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label">Cliente</label>
              <select
                className="form-select"
                value={clienteCargaId}
                onChange={(event) => setClienteCargaId(event.target.value)}
              >
                {data.clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {`${cliente.nombre} ${cliente.apellido}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Monto de la operacion</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={montoCarga}
                onChange={(event) => setMontoCarga(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-3 d-grid align-items-end">
              <button className="btn btn-success" onClick={handleCargarPuntos} disabled={!data.clientes.length}>
                Cargar puntos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Servicio de uso de puntos</h3>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Cliente</label>
              <select
                className="form-select"
                value={clienteUsoId}
                onChange={(event) => setClienteUsoId(event.target.value)}
              >
                {data.clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {`${cliente.nombre} ${cliente.apellido}`}
                  </option>
                ))}
              </select>
              <div className="form-text">Saldo disponible actual: {saldoCliente} puntos</div>
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label">Concepto de uso</label>
              <select
                className="form-select"
                value={conceptoUsoId}
                onChange={(event) => setConceptoUsoId(event.target.value)}
              >
                {data.conceptos.map((concepto) => (
                  <option key={concepto.id} value={concepto.id}>
                    {`${concepto.descripcion} (${concepto.puntos_requeridos} pts)`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3 d-grid align-items-end">
              <button className="btn btn-primary" onClick={handleUsarPuntos} disabled={!data.clientes.length || !data.conceptos.length}>
                Usar puntos FIFO
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Consulta de equivalencia de puntos</h3>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label">Monto a consultar</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={montoConsulta}
                onChange={(event) => setMontoConsulta(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-3 d-grid">
              <button className="btn btn-outline-primary" onClick={handleConsultarEquivalencia}>
                Consultar
              </button>
            </div>
            <div className="col-12 col-md-5">
              <div className="alert alert-info mb-0">
                El monto ingresado equivale a <strong>{puntosEquivalentes}</strong> puntos.
              </div>
            </div>
          </div>
        </div>
      </div>

      {mensaje && <div className="alert alert-secondary mb-0">{mensaje}</div>}
    </div>
  )
}

export default Servicios
