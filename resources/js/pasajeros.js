export default class Pasajeros {


  _callBack
  _Data

  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Pasajeros.init()")
  }

  static async init(callBack, data) {
    this._callBack = callBack

    this._Data = data

    document.querySelector('#menu-container').innerHTML = `
      <a href="#" id="opcion"  class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ofertas</a>
        <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Mis Vuelos</a>
        <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Mis datos</a>
        <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Ayuda</a>
        <a href="#" id="opcion" class="flex justify-center mb-[7px] text-white text-[1.15em] no-underline">Salir</a>
  `

    document.querySelector('#menu').innerHTML = `
      <a href="#" id="opcion" class="mx-6 my-2">Telefono 0180034890</a>
      <a href="#" id="opcion" class="mx-6 my-2">${data.nombres}</a>
      <a href="#" id="opcion" class="mx-6 my-2">Ayuda</a>
      <a href="#" id="opcion" class="mx-6 my-2">Salir</a>
      `
    document.querySelector('nav').innerHTML = `
      <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Ofertas</a>
      <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Mis Vuelos</a>
      <a href="#" id="opcion" class="mx-0 hover:bg-sky-500/30 hover:rounded-full px-5 py-2">Mis datos</a>
      `


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

      case 'Ofertas':
        break
      case 'Mis Vuelos':
        localStorage.setItem('ubicacion', option)
        const { default: VuelosReservados } = await import(`./vuelos-reservados.js`)
        VuelosReservados.init(this._Data)
        break
      case 'Mis datos':
        break
      case 'Personal':
        break
      case 'Salir':
        localStorage.setItem('user', "false")
        localStorage.setItem('ubicacion', '')
        this._callBack()
        break
      default:
    }
  }

}