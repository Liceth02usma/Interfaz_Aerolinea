import Helpers from './helpers.js'
//import { TabulatorFull as Tabulator } from 'tabulator-tables/dist/js/tabulator_esm.js'
import { TabulatorFull as Tabulator } from '../../node_modules/tabulator-tables/dist/js/tabulator_esm.js'
import { DateTime, Duration } from "../../node_modules/luxon/build/es6/luxon.js"
import Modal from "./modal.js"
import Toast from "./toast.js"
import icons from "./icons.js"

let current = null // opción actual
let user = {} // usuario actual
let contador = 0
let frmLogin

export default (async () => {
  window.DateTime = DateTime
  window.Duration = Duration
  window.Modal = Modal
  window.Toast = Toast
  window.icons = icons
  window.Helpers = Helpers
  window.Tabulator = Tabulator

  const config = await Helpers.fetchData('./resources/assets/config.json')

  localStorage.setItem('url', config.url)


  console.log(localStorage.getItem('user'))
  console.log(localStorage.getItem('response'))

  if (localStorage.getItem('user') != "false") {
    loadUserPage(JSON.parse(localStorage.getItem('response')))
  }

  document.querySelector('#navbar-toggle').addEventListener("click", e => document.querySelector('#menu-container').classList.toggle('hidden'))

  await init()
})()

/**
 * Inyecta las componentes de la pagina principal
 */
async function init() {
  let pass = "pass"
  contador > 0 ? await Helpers.loadPage("./resources/html/inicio.html", 'main') : pass


  document.querySelector('#menu-container').innerHTML = `
      <a href="#" id="opcion1"  class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Iniciar Sesión</a>
        <a href="#" id="opcion1" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ayuda</a>
        <a href="#" id="opcion1" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ofertas</a>
        <a href="#" id="opcion1" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Mis Viajes</a>
        <a href="#" id="opcion1" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Vuelos</a>
        <a href="#" id="opcion1" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Salir</a> 
  `

  document.querySelector('#menu').innerHTML = `
  <a href="#" id="opcion1" class="mx-6 my-2"> Telefono 0180034890</a>
  <a href="#" id="opcion1"  class=" text-blue-500  font-semibold h-10 px-5 py-2  bg-white border  border-blue-500 rounded-lg">Iniciar Sesión</a>
  <a href="#" id="opcion1"class="mx-6  my-2">Ayuda</a>

  `///////////////////////////////////////////////////////////////////////////////////////////////////
  document.querySelector('nav').innerHTML = `
  <a href="#" id="opcion1" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Ofertas</a>
  <a href="#" id="opcion1" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2" >Mis Viajes</a>
  <a href="#" id="opcion1" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Vuelos</a>
  `
  // mostrar u ocultar las opciones al pulsar el icono hamburguesa




  // establecer la respuesta a los eventos clic de las opciones del menú
  const listOptions = document.querySelectorAll('#opcion1')


  listOptions.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault()   // evite el evento por defecto 
      console.log(e.target.text)
      mainMenu(e.target.text)
    })
  })
  contador += 1
}


/**
 * Dependiendo de lo escogido determina que hacer
 * @param {String} option El texto que selecciono el usuario
 */
async function mainMenu(option) {
  switch (option) {
    case 'Iniciar Sesión':
      await login()
      break;
    case 'Ofertas':
      await login()
      break;
    case 'Mis Viajes':
      await login()
      break;
    case 'Vuelos':

      await login()
      break;
    case 'Ayuda':
      await Helpers.loadPage("./resources/html/ayuda.html", 'main');
      break;
    default:
      await init()
      break;
  }
}



/**
 * Carga una página de opciones según el usuario autenticado
 * Importante: se usa la carga dinámica de módulos JS:
 * https://blog.webdevsimplified.com/2021-03/dynamic-module-imports/
 * @param {Object} response El objeto que contiene el perfil del usuario
 */
async function loadUserPage(response) {
  user = response.data
  localStorage.setItem('user', 'true')

  Toast.info({
    message: `Hola ${response.data.nombres}`,
    mode: 'success',
    error: response
  }
  )
  localStorage.setItem('response', JSON.stringify(response))
  if (response.data.perfil === 'ADMINISTRADOR') {
    document.querySelector('title').innerHTML = `Aerolinea.com | Admin`
    await Helpers.loadPage("./resources/html/admin.html", 'main')
    const { default: Administradores } = await import(`./administradores.js`)
    current = Administradores.init(init, response.data)
  } else if (response.data.perfil === 'PASAJERO') {
    document.querySelector('title').innerHTML = `Aerolinea.com | Clientes`
    await Helpers.loadPage("./resources/html/clientes.html", 'main')
    const { default: Pasajeros } = await import(`./pasajeros.js`)
    current = Pasajeros.init(init, response.data)
  } else if (response.data.perfil === 'AUXILIAR') {
    document.querySelector('title').innerHTML = `Aerolinea.com | Auxiliares`
    await Helpers.loadPage("./resources/html/auxiliares.html", 'main')
    const { default: Auxiliares } = await import(`./auxiliares.js`)
    current = Auxiliares.init(init, response.data)
  }

}



/**
 * Permite autenticarse como usuario del sistema. Si la autenticación es exitosa
 * carga la pagina correspondiente
 */
async function login() {
  document.querySelector('title').innerHTML = `Aerolinea.com | Inicio Sesion`
  frmLogin = new Modal({
    title: "Ingreso de usuarios",
    content: `
        <form class="w-full">
            <div class="inline-grid w-full mb-3">
                <label class="mb-2" for="">Usuario</label>
                <input type="text" id="usuario" class="input-indigo" placeholder="Usuario">
            </div>
            <div class="inline-grid w-full mb-3">
                <label class="mb-2" for="">Contraseña</label>
                <input type="password" id="contraseña" class="input-indigo" placeholder="Contraseña">
            </div>
        </form>
    `,
    buttons: [
      {
        id: "entrar",
        style: "btn-blue",
        html: `<span>Ingresar</span>`,
        callBack: entrar,
      },
      {
        id: "registro",
        style: "btn-dark",
        html: `<span>Registrarse</span>`,
        callBack: registerUser,
      },
    ],
  }).show()

  async function entrar(e) {
    e.preventDefault()
    console.log(document.querySelector('#usuario').value, document.querySelector('#contraseña').value)

    try {

      let response = await Helpers.fetchData(`${localStorage.getItem('url')}/usuarios/autenticar`, {
        method: 'POST',
        body: {
          identificacion: document.querySelector('#usuario').value,
          password: document.querySelector('#contraseña').value
        }
      })

      if (response.message === 'ok') {
        frmLogin.close()
        loadUserPage(response)
      } else {

        Toast.info({
          message: "Usuario y/o Contraseña incorrecta",
          mode: 'danger',
          error: response
        }
        )
        // mostrar un mensaje de error al usuario por unos segundos
      }
    } catch (e) {
      console.log(e);
    }
  }
}

/**
 * Permite registrarse como usuario del sistema. Si el registro 
 * es correcto se muestra el login
 */
async function registerUser() {
  frmLogin.close()
  let frmRegistro = new Modal({
    title: "Registro",
    content: `
        <form class="w-full">
            <div class="inline-grid w-full mb-3">
                <label class="mb-2" for="id">Identificacion</label>
                <input type="text" id="id" class="input-indigo" placeholder="Identificacion">
            </div>
            <div class="inline-grid w-full mb-3">
              <label class="mb-2" for="id">Nombres</label>
              <input type="text" id="nombres" class="input-indigo" placeholder="Nombres">
            </div>
            <div class="inline-grid w-full mb-3">
            <label class="mb-2" for="id">Apellidos</label>
            <input type="text" id="apellidos" class="input-indigo" placeholder="Apellidos">
          </div>
            <div class="inline-grid w-full mb-3">
                <label class="mb-2" for="">Contraseña</label>
                <input type="password" id="contraseña2" class="input-indigo" placeholder="Contraseña">
            </div>
            <div class="inline-grid w-full mb-3">
            <label class="mb-2" for="">Tipo de usuario</label>
            <select class="input-indigo" id="tipo">
            <option value="PASAJERO" selected>Pasajero</option>
            <option value="ADMINISTRADOR" disabled>Administrador</option>
            <option value="AUXILIAR" disabled>Auxiliar</option>
          </select>
        </div>
        </form>
    `,
    buttons: [
      {
        id: "registro",
        style: "btn-cyan",
        html: `<span>Registrarse</span>`,
        callBack: registro,
      },
    ],
  }).show()

  async function registro(e) {
    e.preventDefault()  //ojo

    try {
      let response = await Helpers.fetchData(`${localStorage.getItem('url')}/usuarios`, {
        method: 'POST',
        body: {
          identificacion: document.querySelector('#id').value,
          nombres: document.querySelector('#nombres').value,
          apellidos: document.querySelector('#apellidos').value,
          perfil: document.querySelector('#tipo').value,
          password: document.querySelector('#contraseña2').value
        }
      })

      if (response.message === 'ok') {

        Toast.info({
          message: "El registro se realizo correctamente",
          mode: 'success',
          error: response
        })
      } else {
        Toast.info({
          message: "El registro a fallado",
          mode: 'danger',
          error: response
        })
      }
    } catch (e) {
      console.log(e);
    }
  }
}
