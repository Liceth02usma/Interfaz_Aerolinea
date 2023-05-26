export default class Auxiliares {

  _callBack

  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Auxiliares.init()")
  }

  static async init(callBack, data) {
    this._callBack = callBack

    document.querySelector('#menu-container').innerHTML = `
      <a href="#" id="opcion"  class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Check-In</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Vuelos</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Reservas</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ayuda</a>
      <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Salir</a>
`

    document.querySelector('#menu').innerHTML = `
    <a href="#" id="opcion" class="mx-6 my-2">${data.nombres}</a>
    <a href="#" id="opcion" class="mx-6 my-2">Ayuda</a>
    <a href="#" id="opcion" class="smx-6 my-2">Salir</a>
    `
    document.querySelector('nav').innerHTML = `
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Check-In</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Vuelos</a>
    <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Reservas</a>
    `

    document.querySelector('#navbar-toggle').addEventListener("click", e => {
      document.querySelector('#menu-container').classList.toggle('hide')
    })

    if (localStorage.getItem('ubicacion') != '')
      this.mainMenu(localStorage.getItem('ubicacion'))

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
      case 'Check-In':
        break
      case 'Reservas':
        localStorage.setItem('ubicacion', option)
        const { default: Reservas } = await import(`./reservas aux.js`)
        Reservas.init()
        break
      case 'Vuelos':
        localStorage.setItem('ubicacion', option)
        const { default: Vuelos } = await import(`./vuelos aux.js`)
        Vuelos.init()
        break
      case 'Salir':
        localStorage.setItem('ubicacion', '')
        localStorage.setItem('user', "false")
        this._callBack()
        break
      default:
      // ...
    }
  }

}