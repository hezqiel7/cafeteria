import { useEffect, useState, useRef } from 'react'
import { buildApiUrl } from './config'

function Productos({
  accesstoken,
  productosElegidos,
  setProductosElegidos,
  totalPrecio,
  setTotalPrecio,
  editable
}) {
  const productos = useRef(null) // Lista de productos completa
  const idMasGrande = useRef(null)
  const [listaProductos, setListaProductos] = useState(null) // Lista de productos con el filtro de busqueda
  const [mostrarDetalle, setMostrarDetalle] = useState(null)

  useEffect(() => {
    fetch(buildApiUrl('/productos/'), {
      headers: {
        Authorization: 'Bearer ' + accesstoken
      }
    })
      .then((response) => response.json())
      .then((data) => {
        productos.current = data
        setListaProductos(data)
        setMostrarDetalle(data[0])
      })
  }, [])

  const handleClickProducto = (producto) => {
    if (!editable) {
      let arr = [...productosElegidos]
      arr.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      })
      setProductosElegidos(arr)
      setTotalPrecio(totalPrecio + producto.precio)
    } else {
      setMostrarDetalle(producto)
    }
  }

  const handleChangeBuscar = (e) => {
    const data = e.target.value
    let lista_productos = productos.current.filter((p) => {
      // Normalizar para ignorar cualquier tilde
      let nombre = p.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      let buscado = data
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return nombre.includes(buscado)
    })
    setListaProductos(lista_productos)
  }

  const handleClickAgregar = () => {
    // Buscar el id mas grande actualmente
    idMasGrande.current = listaProductos.reduce((anterior, actual) => {
      return actual.id > anterior.id ? actual : anterior
    }).id

    const lista = document.getElementsByClassName('list-group-item')
    for (let i = 0; i < lista.length; i++) lista[i].classList.add('disabled')

    setMostrarDetalle({
      id: idMasGrande.current + 1,
      nombre: '',
      precio: ''
    })
  }

  const handleClickEliminar = () => {
    if (!idMasGrande.current) {
      const id = mostrarDetalle.id

      fetch(buildApiUrl(`/productos/${id}/`), {
        headers: {
          Authorization: 'Bearer ' + accesstoken
        },
        method: 'DELETE'
      })
        .then((response) => {
          if (response.ok) {
            const arr = [...listaProductos]
            const index = arr.findIndex((p) => p.id === id)
            arr.splice(index, 1)
            setListaProductos(arr)
            setMostrarDetalle(listaProductos[0])
          }
        })
        .catch((error) => console.log(error))
    } else {
      const lista = document.getElementsByClassName('list-group-item')
      for (let i = 0; i < lista.length; i++)
        lista[i].classList.remove('disabled')
      idMasGrande.current = null
      setMostrarDetalle(listaProductos[0])
    }
  }

  const handleClickGuardar = () => {
    let id = mostrarDetalle.id
    const nombre = mostrarDetalle.nombre
    const precio = mostrarDetalle.precio

    const data = {
      id: id,
      nombre: nombre,
      precio: parseInt(precio)
    }

    fetch(
      idMasGrande.current
        ? buildApiUrl('/productos/')
        : buildApiUrl(`/productos/${id}/`),
      {
        headers: {
          Authorization: 'Bearer ' + accesstoken,
          'Content-Type': 'application/json'
        },
        method: idMasGrande.current ? 'POST' : 'PUT',
        body: JSON.stringify(data)
      }
    )
      .then((response) => {
        if (response.ok) {
          const arr = [...listaProductos]
          if (idMasGrande.current) {
            arr.push(data)
            idMasGrande.current = null
          } else {
            let index = arr.findIndex((p) => p.id === id)
            arr[index] = data
          }
          setListaProductos(arr)
          const lista = document.getElementsByClassName('list-group-item')
          for (let i = 0; i < lista.length; i++)
            lista[i].classList.remove('disabled')
        }
      })
      .catch((error) => console.log(error))
  }

  return (
    <div className={editable ? 'container' : ''}>
      {editable && (
        <div className="d-grid">
          <button
            className="btn btn-primary my-3"
            type="button"
            onClick={handleClickAgregar}
          >
            <i className="fa-solid fa-square-plus fa-xl"></i>
          </button>
        </div>
      )}
      <div className="d-flex justify-content-between flex-column flex-md-row">
        {editable && (
          <div className="text-center col col-md-5 order-md-2 mb-3">
            <div className="mb-4">
              <label className="form-label" htmlFor="nombre">
                Nombre
              </label>
              <input
                className="form-control"
                onChange={(e) =>
                  setMostrarDetalle({
                    ...mostrarDetalle,
                    nombre: e.target.value
                  })
                }
                value={mostrarDetalle ? mostrarDetalle.nombre : ''}
                id="nombre"
              />
            </div>
            <div className="mb-5">
              <label className="form-label" htmlFor="precio">
                Precio
              </label>
              <input
                className="form-control"
                type="number"
                onChange={(e) =>
                  setMostrarDetalle({
                    ...mostrarDetalle,
                    precio: e.target.value
                  })
                }
                value={mostrarDetalle ? mostrarDetalle.precio : ''}
                id="precio"
              />
            </div>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-danger w-25"
                onClick={handleClickEliminar}
              >
                <i className="fa-solid fa-trash-can fa-lg"></i>
              </button>
              <button
                className="btn btn-success w-25"
                onClick={handleClickGuardar}
              >
                <i className="fa-solid fa-floppy-disk fa-lg"></i>
              </button>
            </div>
          </div>
        )}
        <div className={editable ? 'col col-md-6 order-md-1' : 'w-100'}>
          <div className="input-group rounded mb-2">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar"
              onChange={handleChangeBuscar}
            />
            <span className="input-group-text border-0">
              <i className="fas fa-search"></i>
            </span>
          </div>
          <ul className="list-group gap">
            {listaProductos &&
              listaProductos.map((producto) => (
                <li
                  className={'list-group-item list-group-item-action list-group-item-info '.concat(
                    productosElegidos &&
                      productosElegidos.find((p) => p.id === producto.id)
                      ? 'disabled'
                      : ''
                  )}
                  key={producto.id}
                  onClick={() => handleClickProducto(producto)}
                >
                  {producto.nombre}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Productos
