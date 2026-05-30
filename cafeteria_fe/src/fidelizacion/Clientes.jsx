import { useEffect, useState } from 'react'
import { getNextId } from './utils'

const emptyCliente = {
  id: null,
  nombre: '',
  apellido: '',
  numero_documento: '',
  tipo_documento: 'CI',
  nacionalidad: '',
  email: '',
  telefono: '',
  fecha_nacimiento: ''
}

function Clientes({ clientes, setClientes }) {
  const [form, setForm] = useState(emptyCliente)

  useEffect(() => {
    if (!form.id && clientes.length) {
      setForm(clientes[0])
    }
  }, [clientes])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  const handleNew = () => {
    setForm(emptyCliente)
  }

  const handleSave = () => {
    if (!form.nombre || !form.apellido || !form.numero_documento) {
      return
    }

    if (form.id) {
      setClientes(
        clientes.map((cliente) =>
          cliente.id === form.id ? { ...form } : cliente
        )
      )
    } else {
      const nuevoCliente = { ...form, id: getNextId(clientes) }
      setClientes([...clientes, nuevoCliente])
      setForm(nuevoCliente)
    }
  }

  const handleDelete = (clienteId) => {
    const remainingClientes = clientes.filter((cliente) => cliente.id !== clienteId)
    setClientes(remainingClientes)
    setForm(remainingClientes[0] || emptyCliente)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">Administracion de clientes</h3>
          <button className="btn btn-primary" onClick={handleNew}>
            Nuevo cliente
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{`${cliente.nombre} ${cliente.apellido}`}</td>
                      <td>{`${cliente.tipo_documento} ${cliente.numero_documento}`}</td>
                      <td>{cliente.email}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setForm(cliente)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(cliente.id)}
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
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Nombre</label>
                <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Apellido</label>
                <input className="form-control" name="apellido" value={form.apellido} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Numero de documento</label>
                <input
                  className="form-control"
                  name="numero_documento"
                  value={form.numero_documento}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Tipo de documento</label>
                <select className="form-select" name="tipo_documento" value={form.tipo_documento} onChange={handleChange}>
                  <option value="CI">CI</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Nacionalidad</label>
                <input className="form-control" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Telefono</label>
                <input className="form-control" name="telefono" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label">Email</label>
                <input className="form-control" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label">Fecha de nacimiento</label>
                <input
                  className="form-control"
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 d-grid">
                <button className="btn btn-success" onClick={handleSave}>
                  Guardar cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clientes
