import { useState } from 'react'
import coffee from './assets/coffee.png'
import { buildApiUrl } from './config'

function Login(props) {
  const [textError, setTextError] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Lee los datos del formulario
    const form = e.target
    const formData = new FormData(form)
    const recuerdame = formData.get('chkRecuerdame')

    fetch(buildApiUrl('/api/token/'), {
      method: form.method,
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        // Si retornó algún error
        if (data.detail || data.username || data.password) {
          setTextError(data.detail)
          setUsernameError(data.username)
          setPasswordError(data.password)
        } else {
          // Si se marco para recordar la sesión se guarda en el localstorage
          // si no en el sessionstorage
          if (recuerdame) {
            localStorage.setItem('accesstoken', data.access)
            localStorage.setItem('refreshtoken', data.refresh)
          } else {
            sessionStorage.setItem('accesstoken', data.access)
            sessionStorage.setItem('refreshtoken', data.refresh)
          }
          props.setAccesstoken(data.access)
          // setRefreshtoken(data.refresh)
        }
      })
      .catch((error) => console.error(error))
  }

  return (
    <div className="container-login text-center">
      <img src={coffee} alt="Logo cafetería" className="w-50 mb-4" />
      <form method="post" onSubmit={handleSubmit}>
        {/* Email input */}
        <div className="form-floating mb-4">
          <input
            type="text"
            className="form-control"
            id="floatingUsername"
            name="username"
            placeholder="Usuario"
          />
          <label htmlFor="floatingUsername">Usuario</label>
          {usernameError && (
            <div id="usernameError" className="form-text text-danger">
              {usernameError}
            </div>
          )}
        </div>

        {/* Password input */}
        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            name="password"
            placeholder="Contraseña"
          />
          <label htmlFor="floatingPassword">Contraseña</label>
          {passwordError && (
            <div id="passwordError" className="form-text text-danger">
              {passwordError}
            </div>
          )}
        </div>

        {/* 2 column grid layout for inline styling */}
        <div className="row mb-4">
          <div className="col d-flex justify-content-center">
            {/* Checkbox */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value="True"
                id="chkRecuerdame"
                name="chkRecuerdame"
              />
              <label className="form-check-label" htmlFor="form2Example31">
                Recuérdame
              </label>
            </div>
          </div>

          <div className="col fw-light">
            {/* Simple link */}
            <a href="#!">Se olvidó la contraseña?</a>
          </div>
        </div>

        {/* Mensaje de error */}
        {textError && (
          <div id="error" className="form-text text-danger text-center mb-2">
            {textError}
          </div>
        )}

        {/* Submit button */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary btn-block mb-4">
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
