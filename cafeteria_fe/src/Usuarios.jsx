import { useEffect, useState } from 'react'
import { buildApiUrl } from './config'

function Usuarios({ accesstoken }) {
  const [usuarios, setUsuarios] = useState(null)

  useEffect(() => {
    fetch(buildApiUrl('/usuarios/'), {
      headers: {
        Authorization: 'Bearer ' + accesstoken
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data)
      })
  }, [])

  // Funciones
  const handleClickAgregar = () => {}
  const handleClickEditar = () => {}
  const handleClickEliminar = () => {}
  const handleClickGuardar = () => {}

  return (
    <div className="container">
      <div className="d-grid">
        <button
          className="btn btn-primary my-3"
          type="button"
          onClick={handleClickAgregar}
        >
          <i className="fa-solid fa-square-plus fa-xl"></i>
        </button>
      </div>
      <table className="table">
        <thead>
          <tr className="text-center">
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Apellido</th>
            <th scope="col">Usuario</th>
            <th scope="col">Email</th>
            <th scope="col">Staff</th>
            <th scope="col">Editar</th>
            <th scope="col">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {usuarios &&
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="text-center">
                <th scope="row">{usuario.id}</th>
                <td>{usuario.first_name}</td>
                <td>{usuario.last_name}</td>
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={usuario.is_staff}
                    disabled
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClickEditar}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleClickEliminar}
                  >
                    <i className="fa-solid fa-trash-can fa-lg"></i>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Usuarios
