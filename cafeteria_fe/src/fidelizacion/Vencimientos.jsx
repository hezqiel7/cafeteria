import { useEffect, useState } from 'react'
import { getNextId } from './utils'

const emptyVencimiento = {
  id: null,
  fecha_inicio: '',
  fecha_fin: '',
  dias_duracion: ''
}

function Vencimientos({ vencimientos, setVencimientos }) {
  const [form, setForm] = useState(emptyVencimiento)

  useEffect(() => {
    if (!form.id && vencimientos.length) {
      setForm(vencimientos[0])
    }
  }, [vencimientos])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  const handleSave = () => {
    if (!form.fecha_inicio || !form.fecha_fin || !form.dias_duracion) {
      return
    }

    const vencimientoToSave = {
      ...form,
      dias_duracion: Number(form.dias_duracion)
    }

    if (vencimientoToSave.id) {
      setVencimientos(
        vencimientos.map((vencimiento) =>
          vencimiento.id === vencimientoToSave.id ? vencimientoToSave : vencimiento
        )
      )
    } else {
      const nuevoVencimiento = {
        ...vencimientoToSave,
        id: getNextId(vencimientos)
      }
      setVencimientos([...vencimientos, nuevoVencimiento])
      setForm(nuevoVencimiento)
    }
  }

  const handleDelete = (vencimientoId) => {
    const remainingVencimientos = vencimientos.filter(
      (vencimiento) => vencimiento.id !== vencimientoId
    )
    setVencimientos(remainingVencimientos)
    setForm(remainingVencimientos[0] || emptyVencimiento)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">Parametrizacion de vencimientos</h3>
          <button className="btn btn-primary" onClick={() => setForm(emptyVencimiento)}>
            Nuevo vencimiento
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Dias de duracion</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vencimientos.map((vencimiento) => (
                    <tr key={vencimiento.id}>
                      <td>{vencimiento.fecha_inicio}</td>
                      <td>{vencimiento.fecha_fin}</td>
                      <td>{vencimiento.dias_duracion}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setForm(vencimiento)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(vencimiento.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="mb-3">
              <label className="form-label">Fecha de inicio</label>
              <input className="form-control" type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha fin</label>
              <input className="form-control" type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Dias de duracion</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="dias_duracion"
                value={form.dias_duracion}
                onChange={handleChange}
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-success" onClick={handleSave}>
                Guardar vencimiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vencimientos
