import { useEffect, useState } from 'react'
import { buildApiUrl } from './config'

const Pedido = ({
  accesstoken,
  id,
  fecha,
  mesa,
  precio,
  cliente,
  icon,
  color,
  lista_productos_id,
  pedidos,
  setPedidos,
  listo
}) => {
  let aux = 0
  const [productos, setProductos] = useState(null)
  const [animation, setAnimation] = useState(false)

  useEffect(() => {
    fetch(buildApiUrl(`/pedidos/${id}/productos/`), {
      headers: {
        Authorization: 'Bearer ' + accesstoken
      }
    })
      .then((response) => response.json())
      .then((data) => setProductos(data))
  }, [])

  const handleClickListo = () => {
    setAnimation(true)
    setTimeout(() => {
      setAnimation(false)
    }, 908)

    if (!listo) {
      const data = {
        id: id,
        mesa: parseInt(mesa),
        listo: true,
        fecha_pedido: fecha,
        lista_productos: lista_productos_id,
        total_precio: precio,
        nombre_cliente: cliente
      }

      fetch(buildApiUrl(`/pedidos/${id}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accesstoken
        },
        body: JSON.stringify(data)
      })
        .then((response) => {
          if (response.ok) {
            let tmp = [...pedidos]
            let ped = tmp.find((p) => p.id === id)
            ped.listo = true
            setPedidos(tmp)
          }
        })
        .catch((error) => console.error(error))
    } else {
      fetch(buildApiUrl(`/pedidos/${id}/`), {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + accesstoken
        }
      })
        .then((response) => {
          if (response.ok) {
            let tmp = [...pedidos]
            let index = tmp.findIndex((p) => p.id === id)
            tmp.splice(index, 1)
            setPedidos(tmp)
          }
        })
        .catch((error) => console.error(error))
    }
  }

  return (
    <div className="card" style={{ width: '300px' }}>
      <div className="card-header">
        <p className="card-title mb-0 text-end">{cliente}</p>
        <p className="card-subtitle text-body-secondary text-start">
          {new Date(fecha).toLocaleString('Es-es')}
        </p>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between px-1">
          <h6 className="card-subtitle mb-2 text-body-secondary fw-normal mb-3">
            Mesa {mesa}
          </h6>
          <h6 className="card-subtitle mb-2 text-body-secondary fw-normal mb-3">
            ₲ {precio}
          </h6>
        </div>
        <ul className="list-group">
          {productos ? (
            productos.map((prod) => {
              return (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={(aux += 1)}
                >
                  <span className="badge bg-success rounded-pill">
                    {prod.cantidad}
                  </span>
                  {prod.producto.nombre}
                </li>
              )
            })
          ) : (
            <p className="card-text placeholder-glow text-center">
              <span className="placeholder col-6 mx-1"></span>
              <span className="placeholder col-4 mx-1"></span>
              <span className="placeholder col-4 mx-1"></span>
              <span className="placeholder col-6 mx-1"></span>
              <span className="placeholder col-8 mx-1"></span>
              <span className="placeholder col-2 mx-1"></span>
            </p>
          )}
        </ul>
      </div>
      <div className="card-footer d-grid">
        <button
          className={'btn '.concat(color)}
          type="button"
          onClick={handleClickListo}
        >
          <i className={icon.concat(animation ? 'fa-bounce' : '')}></i>
        </button>
      </div>
    </div>
  )
}

export default Pedido
