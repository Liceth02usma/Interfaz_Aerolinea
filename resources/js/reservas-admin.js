//import { TabulatorFull as Tabulator } from 'tabulator-tables/dist/js/tabulator_esm.js'

export default class Reservas {


  static #data
  static #url = localStorage.getItem("url")
  static #table
  static #vuelosVuelta
  static #sillas_ida
  static #table2
  static #modal
  static #formReservas
  static #vuelos
  static #usuarios
  static #sillas
  static #ejecutivo
  static #data2
  static #cont = 0

  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Reservas.init()")
  }

  static async init() {

    this.#usuarios = await Helpers.fetchData(`${this.#url}/usuarios/pasajeros`)
    this.#usuarios.data.forEach((t) => (t.toString = `${t.identificacion} – ${t.nombres} ${t.apellidos}`))


    this.#vuelos = await Helpers.fetchData(`${this.#url}/vuelos`)
    this.#vuelos.data.forEach((t) => (t.toString = `${DateTime.fromISO(t.fechaHora).toFormat('yyyy-MM-dd hh:mm a')}  ${t.trayecto.origen} - ${t.trayecto.destino}  ${t.avion.matricula}`))


    
    let responseVuelos = await Helpers.fetchData(`${localStorage.getItem('url')}/vuelos-reservas`)

    this.#formReservas = await Helpers.loadPage("./resources/html/form-reservas.html")

    Reservas.#data2 = responseVuelos

    // https://tabulator.info/docs/5.4/quickstart
    let response = await Helpers.fetchData(`${localStorage.getItem('url')}/reservas`)
    let data = Helpers.flat(response.data)


    let nestedData = responseVuelos.data



    document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <h1 class="py-3 font-bold text-[1.5em]">Tabla de Reservas</h1>
        <select id="filter-field" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="identificacion">ID</option>
          <option value="fechaHora">Fecha/Hora</option>
          <option value="cancelada">Cancelado</option>
        </select>
      
        <select id="filter-type" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option value="=">=</option>
          <option value="<"><</option>
          <option value="<="><=</option>
          <option value=">">></option>
          <option value=">=">>=</option>
          <option value="!=">!=</option>
          <option value="like">like</option>
        </select>
      
        <input id="filter-value" type="text" placeholder="valor" class="shadow appearance-none border w-[15%] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
      
        <button id="filter-clear" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Limpiar</button>
      </div>
      
      <div id="reservas-table" class="relative mt-[20%] w-[100%]"></div>
      </br></br></br></br></br></br></br></br>
        `
    let filtroCabecera = document.querySelector("#filter-field");
    let tipoFiltro = document.querySelector("#filter-type");
    let valorFiltro = document.querySelector("#filter-value");

    function actualizarFiltro() {
      let valorFiltro2 = filtroCabecera.value
      let valorTipo = tipoFiltro.value
      let valor = valorFiltro.value

      if (valorFiltro2 === "fechaHora") {
        let fecha = valor.split(" ")
        let horaMinutos = fecha[1].split(":")
        let hora = fecha[2] === "PM" ? `${parseInt(horaMinutos[0], 10) + 12}` : horaMinutos[0]
        valor = `${fecha[0]}T${hora}:${horaMinutos[1]}`
      }

      table.setFilter(valorFiltro2, valorTipo, valor);

    }
    filtroCabecera.addEventListener("change", actualizarFiltro)
    tipoFiltro.addEventListener("change", actualizarFiltro)
    valorFiltro.addEventListener("keyup", actualizarFiltro)


    document.querySelector("#filter-clear").addEventListener("click", () => {
      filtroCabecera.value = "";
      tipoFiltro.value = "=";
      valorFiltro.value = "";

      table.clearFilter();
    });


  //define table
  const table = new Tabulator('#reservas-table', {
      height: '725px',
      layout: 'fitColumns',
      columnDefaults: {
          resizable: true
      },
      data: nestedData,
      columns: [
        { title: "USUARIO", field: "usuario.identificacion", hozAlign: "center" },
        { title: "FECHA/HORA RESERVA", field: "fechaHora", hozAlign: "center", formatter: (cell, formatterParams) => {
            const { outputFormat = "yyyy-MM-dd hh:mm a" } = formatterParams
            let value = cell.getValue()
            return DateTime.fromISO(value).toFormat(outputFormat)
          }
        },
        { title: "CANCELADO", field: "cancelado", hozAlign: "center", formatter:"tickCross" },
        { formatter: Reservas.#addChildButton, width: 40, hozAlign: 'center', cellClick: Reservas.#adicionarVuelos },
        { formatter: this.#editRowButton, width: 40, hozAlign: "center", cellClick: this.#editRow },
        { formatter: this.#deleteRowButton, width: 40, hozAlign: "center", cellClick: this.#deleteRow }
      ],
      rowFormatter: function (row) {
          //create and style holder elements
          var holderEl = document.createElement('div')
          var tableEl = document.createElement('div')

          holderEl.style.boxSizing = 'border-box'
          holderEl.style.padding = '10px 30px 10px 10px'
          holderEl.style.borderTop = '1px solid #333'
          holderEl.style.borderBotom = '1px solid #333'

          tableEl.style.border = '1px solid #333'

          holderEl.appendChild(tableEl)

          row.getElement().appendChild(holderEl)

          this.table2 = new Tabulator(tableEl, {
              layout: 'fitColumns',
              data: row.getData().vuelos,
              columns: [
                { title: "ORIGEN", field: "vuelo.trayecto.origen", width: 90 },
                { title: "DESTINO", field: "vuelo.trayecto.destino", hozAlign: "left" },
                // problema con conversión de fechas/horas ISO >> https://github.com/olifolkerd/tabulator/issues/3505
                // solución temporal:
                { title: "COSTO", field: "vuelo.trayecto.costo", hozAlign: "center", formatter: "money" },
                { title: "SILLA", field: "silla.posicion", hozAlign: "left", width: 90 },
                { title: "UBICACION", field: "silla.ubicacion", hozAlign: "left" },
                {
                  title: "MENU", field: "silla.menu", hozAlign: "left", width: 150, formatter: (cell) => {
                    try {
                      return cell.getValue().toLowerCase().replace("_", " ").replace("_", " ")
                    } catch (error) {
                      return cell.getValue()
                    }
                  }
                },
                {
                  title: "LICOR", field: "silla.licor", hozAlign: "left", formatter: (cell) => {
                    try {
                      return cell.getValue().toLowerCase().replace("_", " ")
                    } catch (error) {
                      return cell.getValue()
                    }
                  }
                },
                {
                  title: "TIPO", field: "silla.menu", hozAlign: "center", formatter: (cell) => {
                    try {
   
                      return "Ejecutivo"
                    } catch (error) {
                      return "Economico"
                    }
                  }
                },
                { title: "CHECK-IN", field: "checkIn", hozAlign: "center", formatter: "tickCross" },
                { formatter: Reservas.#editRowButton, width: 40, hozAlign: "center", cellClick: Reservas.#editRowClick },
                { formatter: Reservas.#deleteRowButton, width: 40, hozAlign: "center", cellClick: Reservas.#deleteRowClick }
              ]
              
          })
      },
      footerElement: `
              <div class='flex justify-end w-full'>
              <button id='add-users' class='btn-teal'>Agregar</button>
          </div>
          `.trim(),
  })
  this.#table = table
  this.#table.on("tableBuilt", () => {
    document.querySelector("#add-users").addEventListener("click", this.#adicionarVuelos2)
})



//nota: adicionar un boton agregar para poner una reserva completamente nueva


  }
  static #editRowButton = (cell, formatterParams, onRendered) => `
        <button id="edit-row" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar">
            ${icons.actualizar}
        </button>
    `
  static #editRow = async (e, cell) => {

   



  }

  static #addChildButton = (cell, formatterParams, onRendered) => `
  <button id="add-child" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Agregar hijo">${icons.addChild}</button>
`

  static #adicionarVuelos2 = async () => {
    


}


static #add2 = async (cell) => {

}



  static #update2 = async (row) => {

}

  static #deleteRowButton = (cell, formatterParams, onRendered) => `
        <button class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Eliminar">
        ${icons.eliminar}
        </button>
    `
  static #deleteRow = (e, cell) => {
    
  }

  static async #delete2(row) {
    
}

  static #editRowClick = async (e,cell) => { 



  
  }

  static #update = async (row) => {


}

  static #deleteRowClick = (e,cell) => { 

  }

  static async #delete(row) {

}
 

  /**
   * Despliega el cuadro de diálogo que permite agregar registros
   * @param {Event} e
   */
  static #adicionarVuelos = async (e, cell) => {

}


  static #createForm = async (cell,{ checkIn = "", reserva ="", vuelo="", silla="", cancelada=""} = {}) => {


  }


  static #add = async (cell) => {

    

    
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del vuelo
   */
  static #getFormData(cell, usuario = "", fechaHoraR = "") {
            
  }

 
    


}