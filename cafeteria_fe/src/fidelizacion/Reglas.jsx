import { useEffect, useState } from 'react'
import { getNextId } from './utils'

const emptyRegla = {
  id: null,
  limite_inferior: '',
  limite_superior: '',
  monto_equivalencia: ''
}

function Reglas({ reglas, setReglas }) {
  const [form, setForm] = useState(emptyRegla)

  useEffect(() => {
    if (!form.id && reglas.length) {
      setForm(reglas[0])
    }
  }, [reglas])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  const handleSave = () => {
    if (form.limite_inferior === '' || form.monto_equivalencia === '') {
      return
    }

    const reglaToSave = {
      ...form,
      limite_inferior: Number(form.limite_inferior),
      limite_superior: form.limite_superior === '' ? '' : Number(form.limite_superior),
      monto_equivalencia: Number(form.monto_equivalencia)
    }

    if (reglaToSave.id) {
      setReglas(reglas.map((regla) => (regla.id === reglaToSave.id ? reglaToSave : regla)))
    } else {
      const nuevaRegla = { ...reglaToSave, id: getNextId(reglas) }
      setReglas([...reglas, nuevaRegla])
      setForm(nuevaRegla)
    }
  }

  const handleDelete = (reglaId) => {
    const remainingReglas = reglas.filter((regla) => regla.id !== reglaId)
    setReglas(remainingReglas)
    setForm(remainingReglas[0] || emptyRegla)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">Reglas de asignacion de puntos</h3>
          <button className="btn btn-primary" onClick={() => setForm(emptyRegla)}>
            Nueva regla
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Limite inferior</th>
                    <th>Limite superior</th>
                    <th>1 punto cada</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reglas.map((regla) => (
                    <tr key={regla.id}>
                      <td>{regla.limite_inferior}</td>
                      <td>{regla.limite_superior === '' ? 'Sin limite' : regla.limite_superior}</td>
                      <td>{regla.monto_equivalencia}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setForm(regla)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(regla.id)}
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
              <label className="form-label">Limite inferior</label>
              <input
                className="form-control"
                type="number"
                min="0"
                name="limite_inferior"
                value={form.limite_inferior}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Limite superior</label>
              <input
                className="form-control"
                type="number"
                min="0"
                name="limite_superior"
                value={form.limite_superior}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Monto de equivalencia de 1 punto</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="monto_equivalencia"
                value={form.monto_equivalencia}
                onChange={handleChange}
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-success" onClick={handleSave}>
                Guardar regla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reglas
