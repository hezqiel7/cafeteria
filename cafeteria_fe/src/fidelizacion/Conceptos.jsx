import { useEffect, useState } from 'react'
import { getNextId } from './utils'

const emptyConcepto = {
  id: null,
  descripcion: '',
  puntos_requeridos: ''
}

function Conceptos({ conceptos, setConceptos }) {
  const [form, setForm] = useState(emptyConcepto)

  useEffect(() => {
    if (!form.id && conceptos.length) {
      setForm(conceptos[0])
    }
  }, [conceptos])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  const handleSave = () => {
    if (!form.descripcion || !form.puntos_requeridos) {
      return
    }

    const conceptoToSave = {
      ...form,
      puntos_requeridos: Number(form.puntos_requeridos)
    }

    if (conceptoToSave.id) {
      setConceptos(
        conceptos.map((concepto) =>
          concepto.id === conceptoToSave.id ? conceptoToSave : concepto
        )
      )
    } else {
      const nuevoConcepto = {
        ...conceptoToSave,
        id: getNextId(conceptos)
      }
      setConceptos([...conceptos, nuevoConcepto])
      setForm(nuevoConcepto)
    }
  }

  const handleDelete = (conceptoId) => {
    const remainingConceptos = conceptos.filter((concepto) => concepto.id !== conceptoId)
    setConceptos(remainingConceptos)
    setForm(remainingConceptos[0] || emptyConcepto)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">Conceptos de uso de puntos</h3>
          <button className="btn btn-primary" onClick={() => setForm(emptyConcepto)}>
            Nuevo concepto
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Descripcion</th>
                    <th>Puntos requeridos</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {conceptos.map((concepto) => (
                    <tr key={concepto.id}>
                      <td>{concepto.descripcion}</td>
                      <td>{concepto.puntos_requeridos}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setForm(concepto)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(concepto.id)}
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
              <label className="form-label">Descripcion del concepto</label>
              <input className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Puntos requeridos</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="puntos_requeridos"
                value={form.puntos_requeridos}
                onChange={handleChange}
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-success" onClick={handleSave}>
                Guardar concepto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Conceptos
