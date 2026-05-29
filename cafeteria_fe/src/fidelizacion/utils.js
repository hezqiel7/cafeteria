export const getNextId = (items) => {
  if (!items.length) {
    return 1
  }

  return (
    items.reduce((highestId, item) => {
      const currentId = Number(item.id) || 0
      return currentId > highestId ? currentId : highestId
    }, 0) + 1
  )
}

export const getClienteNombre = (clientes, clienteId) => {
  const cliente = clientes.find((item) => Number(item.id) === Number(clienteId))
  return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente'
}

export const getConceptoDescripcion = (conceptos, conceptoId) => {
  const concepto = conceptos.find((item) => Number(item.id) === Number(conceptoId))
  return concepto ? concepto.descripcion : 'Sin concepto'
}

export const getClienteSaldo = (bolsas, clienteId) => {
  return bolsas
    .filter((bolsa) => Number(bolsa.cliente_id) === Number(clienteId) && !bolsa.vencido)
    .reduce((total, bolsa) => total + Number(bolsa.saldo_puntos || 0), 0)
}

export const calculateEquivalencia = (reglas, monto) => {
  const montoNumerico = Number(monto)
  const reglaAplicable = [...reglas]
    .sort((leftRule, rightRule) => Number(leftRule.limite_inferior) - Number(rightRule.limite_inferior))
    .find((regla) => {
      const limiteInferior = Number(regla.limite_inferior || 0)
      const limiteSuperior = regla.limite_superior === '' ? null : Number(regla.limite_superior)
      const cumpleMinimo = montoNumerico >= limiteInferior
      const cumpleMaximo = limiteSuperior === null ? true : montoNumerico <= limiteSuperior
      return cumpleMinimo && cumpleMaximo
    })

  if (!reglaAplicable) {
    return 0
  }

  return Math.floor(montoNumerico / Number(reglaAplicable.monto_equivalencia || 1))
}

export const addDays = (dateValue, days) => {
  const targetDate = new Date(`${dateValue}T00:00:00`)
  targetDate.setDate(targetDate.getDate() + Number(days || 0))
  return targetDate.toISOString().slice(0, 10)
}

export const getDuracionVigente = (vencimientos, fechaBase) => {
  const currentDate = new Date(`${fechaBase}T00:00:00`)
  const configuracion = vencimientos.find((vencimiento) => {
    const fechaInicio = new Date(`${vencimiento.fecha_inicio}T00:00:00`)
    const fechaFin = new Date(`${vencimiento.fecha_fin}T00:00:00`)
    return currentDate >= fechaInicio && currentDate <= fechaFin
  })

  return configuracion ? Number(configuracion.dias_duracion || 0) : 90
}

export const consumePuntosFIFO = (bolsas, clienteId, puntosRequeridos) => {
  let puntosPendientes = Number(puntosRequeridos)
  const detalle = []

  const bolsasOrdenadas = [...bolsas]
    .map((bolsa) => ({ ...bolsa }))
    .sort(
      (leftBolsa, rightBolsa) =>
        new Date(leftBolsa.fecha_asignacion) - new Date(rightBolsa.fecha_asignacion)
    )

  const saldoDisponible = getClienteSaldo(bolsasOrdenadas, clienteId)
  if (saldoDisponible < puntosPendientes) {
    return { success: false, bolsas: bolsasOrdenadas, detalle }
  }

  bolsasOrdenadas.forEach((bolsa) => {
    if (
      puntosPendientes > 0 &&
      Number(bolsa.cliente_id) === Number(clienteId) &&
      !bolsa.vencido &&
      Number(bolsa.saldo_puntos) > 0
    ) {
      const puntosConsumidos = Math.min(Number(bolsa.saldo_puntos), puntosPendientes)
      bolsa.puntaje_utilizado = Number(bolsa.puntaje_utilizado) + puntosConsumidos
      bolsa.saldo_puntos = Number(bolsa.saldo_puntos) - puntosConsumidos
      detalle.push({
        id: detalle.length + 1,
        bolsa_id: bolsa.id,
        puntaje_utilizado: puntosConsumidos
      })
      puntosPendientes -= puntosConsumidos
    }
  })

  return { success: true, bolsas: bolsasOrdenadas, detalle }
}

export const runExpirationProcess = (data, currentDate = new Date()) => {
  const dateText = currentDate.toISOString().slice(0, 10)
  let bolsasVencidas = 0

  const bolsasActualizadas = data.bolsas.map((bolsa) => {
    if (!bolsa.vencido && bolsa.fecha_caducidad < dateText && Number(bolsa.saldo_puntos) > 0) {
      bolsasVencidas += 1
      return {
        ...bolsa,
        puntaje_utilizado: Number(bolsa.puntaje_utilizado) + Number(bolsa.saldo_puntos),
        saldo_puntos: 0,
        vencido: true
      }
    }

    if (!bolsa.vencido && bolsa.fecha_caducidad < dateText) {
      return {
        ...bolsa,
        vencido: true
      }
    }

    return bolsa
  })

  const ultimaEjecucion = currentDate.toISOString()
  const proximaFecha = new Date(currentDate)
  proximaFecha.setHours(proximaFecha.getHours() + 6)

  return {
    ...data,
    bolsas: bolsasActualizadas,
    procesos: {
      ultima_ejecucion: ultimaEjecucion,
      proxima_ejecucion: proximaFecha.toISOString(),
      bolsas_vencidas: bolsasVencidas
    }
  }
}
