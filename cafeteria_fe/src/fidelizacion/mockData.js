export const initialFidelizacionData = {
  clientes: [
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'Gomez',
      numero_documento: '1234567',
      tipo_documento: 'CI',
      nacionalidad: 'Paraguaya',
      email: 'ana@example.com',
      telefono: '0981000001',
      fecha_nacimiento: '1998-04-05'
    },
    {
      id: 2,
      nombre: 'Luis',
      apellido: 'Benitez',
      numero_documento: '2345678',
      tipo_documento: 'CI',
      nacionalidad: 'Paraguaya',
      email: 'luis@example.com',
      telefono: '0981000002',
      fecha_nacimiento: '1994-11-11'
    },
    {
      id: 3,
      nombre: 'Maria',
      apellido: 'Fernandez',
      numero_documento: '3456789',
      tipo_documento: 'Pasaporte',
      nacionalidad: 'Argentina',
      email: 'maria@example.com',
      telefono: '0981000003',
      fecha_nacimiento: '2000-08-21'
    }
  ],
  conceptos: [
    { id: 1, descripcion: 'Vale de descuento', puntos_requeridos: 10 },
    { id: 2, descripcion: 'Vale de premio', puntos_requeridos: 20 },
    { id: 3, descripcion: 'Vale de consumicion', puntos_requeridos: 15 }
  ],
  reglas: [
    { id: 1, limite_inferior: 0, limite_superior: 199999, monto_equivalencia: 50000 },
    { id: 2, limite_inferior: 200000, limite_superior: 499999, monto_equivalencia: 30000 },
    { id: 3, limite_inferior: 500000, limite_superior: '', monto_equivalencia: 20000 }
  ],
  vencimientos: [
    { id: 1, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', dias_duracion: 90 },
    { id: 2, fecha_inicio: '2026-06-01', fecha_fin: '2026-12-31', dias_duracion: 120 }
  ],
  bolsas: [
    {
      id: 1,
      cliente_id: 1,
      fecha_asignacion: '2026-05-01',
      fecha_caducidad: '2026-07-30',
      puntaje_asignado: 12,
      puntaje_utilizado: 2,
      saldo_puntos: 10,
      monto_operacion: 600000,
      vencido: false
    },
    {
      id: 2,
      cliente_id: 2,
      fecha_asignacion: '2026-05-10',
      fecha_caducidad: '2026-09-07',
      puntaje_asignado: 8,
      puntaje_utilizado: 0,
      saldo_puntos: 8,
      monto_operacion: 250000,
      vencido: false
    }
  ],
  usos: [
    {
      id: 1,
      cliente_id: 1,
      concepto_id: 1,
      puntaje_utilizado: 2,
      fecha: '2026-05-15',
      detalle: [{ id: 1, bolsa_id: 1, puntaje_utilizado: 2 }]
    }
  ],
  procesos: {
    ultima_ejecucion: '2026-05-20T10:00:00',
    proxima_ejecucion: '2026-05-20T16:00:00',
    bolsas_vencidas: 0
  }
}
