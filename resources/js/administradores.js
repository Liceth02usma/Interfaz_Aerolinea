export default class Administradores {

  _callBack

  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Administradores.init()")
  }

  static async init(callBack, data) {
    this._callBack = callBack


    document.querySelector('#menu-container').innerHTML = `
    <a href="#" id="opcion"  class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Gestion Aviones</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Gestion Trayectos</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Gestion Vuelos</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Gestion Usuarios</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Edición Promociones</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ayuda</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Salir</a>
`
    document.querySelector('#menu').innerHTML = `
    <a href="#" id="opcion" class="mx-6 my-2">${data.nombres}</a>
    <a href="#" id="opcion" class="mx-6 my-2">Ayuda</a>
    <a href="#" id="opcion" class="mx-6 my-2">Salir</a>
    `
    document.querySelector('nav').innerHTML = `
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Gestion Aviones</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Gestion Trayectos</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Gestion Vuelos</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Gestion Usuarios</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Edición Promociones</a>
    `
    if (localStorage.getItem('ubicacion') != '')
      this.mainMenu(localStorage.getItem('ubicacion'))


    document.querySelector('#navbar-toggle').addEventListener("click", e => {
      document.querySelector('#menu-container').classList.toggle('hide')
    })

    const listOptions = document.querySelectorAll('#opcion')
    listOptions.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault()
        this.mainMenu(e.target.text)
      })
    })
  }

  static async mainMenu(option) {
    switch (option) {
      case 'Gestion Aviones':
        localStorage.setItem('ubicacion', option)
        const { default: Aviones } = await import(`./aviones.js`)
        Aviones.init()
        break
      case 'Gestion Trayectos':
        localStorage.setItem('ubicacion', option)
        const { default: Trayectos } = await import(`./trayectos.js`)
        Trayectos.init()
        break
      case 'Gestion Vuelos':
        localStorage.setItem('ubicacion', option)
        const { default: Vuelos } = await import(`./vuelos.js`)
        Vuelos.init()
        break
      case 'Gestion Usuarios':
        localStorage.setItem('ubicacion', option)
        const { default: Usuarios } = await import(`./usuarios.js`)
        Usuarios.init()
        break
      case 'Salir':
        localStorage.setItem('user', "false")
        localStorage.setItem('ubicacion', '')
        this._callBack()
        break
      default:
      // ...
    }
  }

}