import { useMemo, useState } from 'react'
import {
  addDays,
  calculateEquivalencia,
  consumePuntosFIFO,
  getClienteNombre,
  getClienteSaldo,
  getDuracionVigente,
  getNextId
} from './utils'

function Servicios({ data, setData }) {
  const [clienteCargaId, setClienteCargaId] = useState(data.clientes[0]?.id || '')
  const [montoCarga, setMontoCarga] = useState('')
  const [clienteUsoId, setClienteUsoId] = useState(data.clientes[0]?.id || '')
  const [conceptoUsoId, setConceptoUsoId] = useState(data.conceptos[0]?.id || '')
  const [montoConsulta, setMontoConsulta] = useState('')
  const [mensaje, setMensaje] = useState('')

  const saldoCliente = useMemo(
    () => getClienteSaldo(data.bolsas, clienteUsoId),
    [data.bolsas, clienteUsoId]
  )

  const handleCargarPuntos = () => {
    const monto = Number(montoCarga)
    const puntos = calculateEquivalencia(data.reglas, monto)

    if (!clienteCargaId || !monto || puntos <= 0) {
      setMensaje('No se pudo generar la carga de puntos con los datos ingresados.')
      return
    }

    const fechaAsignacion = new Date().toISOString().slice(0, 10)
    const diasDuracion = getDuracionVigente(data.vencimientos, fechaAsignacion)
    const nuevaBolsa = {
      id: getNextId(data.bolsas),
      cliente_id: Number(clienteCargaId),
      fecha_asignacion: fechaAsignacion,
      fecha_caducidad: addDays(fechaAsignacion, diasDuracion),
      puntaje_asignado: puntos,
      puntaje_utilizado: 0,
      saldo_puntos: puntos,
      monto_operacion: monto,
      vencido: false
    }

    setData((previousData) => ({
      ...previousData,
      bolsas: [...previousData.bolsas, nuevaBolsa]
    }))
    setMontoCarga('')
    setMensaje(
      `Se cargaron ${puntos} puntos para ${getClienteNombre(data.clientes, clienteCargaId)}.`
    )
  }

  const handleUsarPuntos = () => {
    const concepto = data.conceptos.find(
      (item) => Number(item.id) === Number(conceptoUsoId)
    )

    if (!clienteUsoId || !concepto) {
      setMensaje('No se pudo registrar el uso de puntos.')
      return
    }

    const consumo = consumePuntosFIFO(
      data.bolsas,
      Number(clienteUsoId),
      Number(concepto.puntos_requeridos)
    )

    if (!consumo.success) {
      setMensaje('El cliente no tiene saldo suficiente para utilizar ese concepto.')
      return
    }

    const nuevoUso = {
      id: getNextId(data.usos),
      cliente_id: Number(clienteUsoId),
      concepto_id: Number(conceptoUsoId),
      puntaje_utilizado: Number(concepto.puntos_requeridos),
      fecha: new Date().toISOString().slice(0, 10),
      detalle: consumo.detalle
    }

    setData((previousData) => ({
      ...previousData,
      bolsas: consumo.bolsas,
      usos: [...previousData.usos, nuevoUso]
    }))
    setMensaje(
      `Se registraron ${concepto.puntos_requeridos} puntos utilizados para ${getClienteNombre(
        data.clientes,
        clienteUsoId
      )}.`
    )
  }

  const puntosEquivalentes = montoConsulta
    ? calculateEquivalencia(data.reglas, Number(montoConsulta))
    : 0

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
              <button className="btn btn-success" onClick={handleCargarPuntos}>
                Simular carga
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
              <button className="btn btn-primary" onClick={handleUsarPuntos}>
                Simular uso FIFO
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
            <div className="col-12 col-md-8">
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
