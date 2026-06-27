import { ADMIN_URL } from './config'

function Navbar({
  accesstoken,
  setAccesstoken,
  setActualTab,
  grupo,
  setGrupo
}) {
  const handleLogOut = (e) => {
    localStorage.clear()
    sessionStorage.clear()
    setAccesstoken(null)
    setGrupo(null)
  }

  return (
    <nav className="navbar navbar-expand bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          App Cafetería
        </a>
        {/* <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button> */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link"
                onClick={() => setActualTab('pedido')}
                href="#pedido"
              >
                Pedidos
              </a>
            </li>
            {grupo && grupo === 'administrador' && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  onClick={() => setActualTab('productos')}
                  href="#productos"
                >
                  Productos
                </a>
              </li>
            )}
            {grupo && (grupo === 'administrador' || grupo === 'recepcion') && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  onClick={() => setActualTab('fidelizacion')}
                  href="#fidelizacion"
                >
                  Fidelizacion
                </a>
              </li>
            )}
            {grupo && grupo === 'administrador' && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  onClick={() => setActualTab('usuarios')}
                  href={ADMIN_URL}
                >
                  Trabajadores
                </a>
              </li>
            )}
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link" onClick={handleLogOut}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
