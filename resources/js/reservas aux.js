import { TabulatorFull as Tabulator } from '../../node_modules/tabulator-tables/dist/js/tabulator_esm.js'
//NOTA: Hacer validaciones para obtener las sillas disponibles de un avion cotejandolo con vuelos-reservados
export default class Reservas {

  static #data
  static #url = localStorage.getItem("url")
  static #table
  static #table2
  static #modal
  static #formReservas
  static #vuelos
  static #usuarios
  static #sillas
  static #ejecutivo
  static #data2

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

    const nestedData = responseVuelos.data
    console.log(responseVuelos.data)

    // data.forEach(t =>{
    //   console.log(responseVuelos)
    //   let pass = "pass"
    //   responseVuelos.data.forEach(item => item.pasajero.identificacion == t.identificacion && item.fechaHora == t.fechaHora ? t.vuelos = item.vuelos : pass)
    //   nestedData.push(t)
    // })

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


  //   const nestedData = [
  //     {
  //         id: 1,
  //         make: 'Ford',
  //         model: 'focus',
  //         reg: 'P232 NJP',
  //         color: 'white',
  //         serviceHistory: [
  //             { date: '01/02/2016', engineer: 'Steve Boberson', actions: 'Changed oli filter' },
  //             { date: '07/02/2017', engineer: 'Martin Stevenson', actions: 'Break light broken' }
  //         ]
  //     },
  //     {
  //         id: 1,
  //         make: 'BMW',
  //         model: 'm3',
  //         reg: 'W342 SEF',
  //         color: 'red',
  //         serviceHistory: [
  //             { date: '22/05/2017', engineer: 'Jimmy Brown', actions: 'Aligned wheels' },
  //             { date: '11/02/2018', engineer: 'Lotty Ferberson', actions: 'Changed Oil' },
  //             { date: '04/04/2018', engineer: 'Franco Martinez', actions: 'Fixed Tracking' }
  //         ]
  //     }
  // ]

  //define table
  const table = new Tabulator('#reservas-table', {
      height: '500px',
      layout: 'fitColumns',
      columnDefaults: {
          resizable: true
      },
      data: nestedData,
      columns: [
        { title: "USUARIO", field: "pasajero.identificacion", hozAlign: "center" },
        { title: "FECHA/HORA RESERVA", field: "fechaHora", hozAlign: "center", formatter: (cell, formatterParams) => {
            const { outputFormat = "yyyy-MM-dd hh:mm a" } = formatterParams
            let value = cell.getValue()
            return DateTime.fromISO(value).toFormat(outputFormat)
          }
        },
        { title: "CANCELADO", field: "cancelado", hozAlign: "center", formatter:"tickCross" },
        { formatter: Reservas.#addChildButton, width: 40, hozAlign: 'center', cellClick: Reservas.#addChildClick },
        { formatter: this.#editRowButton, width: 40, hozAlign: "center", cellClick: this.#editRowClick },
        { formatter: this.#deleteRowButton, width: 40, hozAlign: "center", cellClick: this.#deleteRowClick }
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

          const subTable = new Tabulator(tableEl, {
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
                      console.log(cell.getData().silla.menu.toLowerCase())
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
      }
  })





    /////////////////////////////////////////////////////////////////////////////////////////////
    // Crear la función formatter para la tabla anidada

    /////////////////////////////////////////////////////////////////////////////////////////////////

    //initialize table
    // let table = new Tabulator("#example-table", {
    //     height: 300, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    //     data: lista, //assign data to table
    //     layout: "fitColumns", //fit columns to width of table (optional)
    //     columns: [ //Define Table Columns

    //     ],
    //     footerElement: `
    //     <div class='flex justify-end w-full'>
    //     <button id='add-users' class='btn-teal'>Agregar</button>
    // </div>
    // `.trim(),
    // })

    //trigger an alert message when the row is clicked
    // table.on("rowClick", function (e, row) {
    //   let lista
    //   let pass = "pass"
    //   responseVuelos.data.forEach(item => item.pasajero.identificacion == row.getData().identificacion ? lista = item.vuelos : pass)
    //   Reservas.#data= Helpers.flat(lista)
    //   console.log(Reservas.#data)
    //   Reservas.TablaReservasVuelos(Reservas.#data)

    // });
  }
  static #editRowButton = (cell, formatterParams, onRendered) => `
        <button id="edit-row" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar">
            ${icons.actualizar}
        </button>
    `
  static #editRow(e, cell) {
    console.info('clic sobre ', e.target);
    console.info('datos de la fila', cell.getRow().getData())
  }

  static #deleteRowButton = (cell, formatterParams, onRendered) => `
        <button class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Eliminar">
        ${icons.eliminar}
        </button>
    `
  static #deleteRow = (e, cell) => {
    console.log('clic sobre ', e.target);
    console.info('datos de la fila', cell.getRow().getData())
  }



  static TablaReservasVuelos = async (data2) => {
    let table2 = new Tabulator(document.createElement("div"), {
      height: 150, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: data2, //assign data to table
      layout: "fitColumns", //fit columns to width of table (optional)
      columns: [ //Define Table Columns
        { title: "ORIGEN", field: "origen", width: 90 },
        { title: "DESTINO", field: "destino", hozAlign: "left" },
        { title: "AVIÓN", field: "matricula", hozAlign: "left" },
        // problema con conversión de fechas/horas ISO >> https://github.com/olifolkerd/tabulator/issues/3505
        // solución temporal:
        { title: "COSTO", field: "costo", hozAlign: "center", formatter: "money" },
        { title: "SILLA", field: "posicion", hozAlign: "left", width: 90 },
        { title: "UBICACION", field: "ubicacion", hozAlign: "left" },
        {
          title: "MENU", field: "menu", hozAlign: "left", width: 150, formatter: (cell) => {
            try {
              return cell.getValue().toLowerCase().replace("_", " ").replace("_", " ")
            } catch (error) {
              return cell.getValue()
            }
          }
        },
        {
          title: "LICOR", field: "licor", hozAlign: "left", formatter: (cell) => {
            try {
              return cell.getValue().toLowerCase().replace("_", " ")
            } catch (error) {
              return cell.getValue()
            }
          }
        },
        {
          title: "FECHA/HORA", field: "fechaHora", hozAlign: "center", width: 150, formatter: (cell, formatterParams) => {
            const { outputFormat = "yyyy-MM-dd hh:mm a" } = formatterParams
            let value = cell.getValue()
            return DateTime.fromISO(value).toFormat(outputFormat)
          }
        },
        {
          title: "TIPO", field: "menu", hozAlign: "center", formatter: (cell) => {
            try {
              console.log(cell.getData().menu.toLowerCase())
              return "Ejecutivo"
            } catch (error) {
              return "Economico"
            }
          }
        },
        { title: "CHECK-IN", field: "checkIn", hozAlign: "center", formatter: "tickCross" },
        { title: "CANCELADO", field: "cancelado", hozAlign: "center", formatter: "tickCross" },
        { formatter: this.#editRowButton, width: 40, hozAlign: "center", cellClick: this.#editRowClick },
        { formatter: this.#deleteRowButton, width: 40, hozAlign: "center", cellClick: this.#deleteRowClick }
      ],
      footerElement: `
        <div class='flex justify-end w-full'>
        <button id='add-users' class='btn-teal'>Agregar</button>
    </div>
    `.trim(),
    })

    this.#table2 = table2

    //   this.#table2.on("tableBuilt", () => {
    //     document.querySelector("#add-users").addEventListener("click", this.#adicionarVuelos)
    // })
    return table2
  }

  static #editRowClick = (e) => { }

  static #deleteRowClick = (e) => { }


  /**
   * Despliega el cuadro de diálogo que permite agregar registros
   * @param {Event} e
   */
  static #adicionarVuelos = async (e) => {
    e.preventDefault()
    this.#modal = new Modal({
      title: "Agregar una Reserva",
      content: await Reservas.#createForm(),
      buttons: [
        {
          id: "add-flights",
          style: "btn-teal",
          html: `<span>Agregar</span>`,
          callBack: () => this.#add(),
        },
        {
          id: "cancel-add-flights",
          style: "btn-red",
          html: `<span>Cancelar</span>`,
          callBack: () => this.#modal.dispose(),
        }
      ],
    }).show()
    document.querySelector(`#${this.#modal.id} #vuelos`).addEventListener('change', async () => {
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelos.data[iVuelo]
      this.#sillas = await Helpers.fetchData(`${this.#url}/sillas/select/${vuelo.avion.matricula}`)
      console.log(this.#sillas.data)
      Helpers.populateSelectList(
        `#${this.#modal.id} #sillas`, this.#sillas.data, 'posicion', 'posicion'
      )
    })
    document.querySelector(`#${this.#modal.id} #sillas`).addEventListener('change', async () => {
      const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
      const silla = this.#sillas.data[iSilla]
      let menu = document.querySelector(`#${this.#modal.id} #menu`)
      let licor = document.querySelector(`#${this.#modal.id} #licor`)
      if (silla.hasOwnProperty('licor')) {
        menu.disabled = false
        licor.disabled = false
        this.#ejecutivo = true
      } else {
        menu.disabled = true
        licor.disabled = true
        this.#ejecutivo = false
      }
    })
  }


  static #createForm = async ({ fechaHora = "", origen = "", destino = "", matricula = "", identificacion = "", nombres = "", apellidos = "", posicion = "" } = {}) => {
    // crear la lista de opciones para el select de trayectos
    const vuelos = Helpers.toOptionList({
      items: this.#vuelos.data,
      value: "toString",
      text: "toString",
      selected: `${DateTime.fromISO(fechaHora).toFormat('yyyy-MM-dd hh:mm a')}  ${origen} - ${destino}  ${matricula}`,
    })

    // crear la lista de opciones para el select de aviones
    const usuarios = Helpers.toOptionList({
      items: this.#usuarios.data,
      value: "identificacion",
      text: "toString",
      selected: `${identificacion} – ${nombres} ${apellidos}`,
    })

    // document.querySelector('#vuelos').addEventListener("change", evento)
    matricula = (matricula === "") ? this.#vuelos.data[0].avion.matricula : matricula
    console.log(matricula)


    this.#sillas = await Helpers.fetchData(`${this.#url}/sillas/select/${matricula}`)


    const sillas = Helpers.toOptionList({
      items: this.#sillas.data,
      value: "posicion",
      text: "posicion",
      selected: `${posicion}`,
    })

    this.#ejecutivo = this.#sillas.data[0].hasOwnProperty('licor')


    // inyectar en el formulario de vuelos los datos del objeto recibido como argumento

    const htmlForm = this.#formReservas.translate(usuarios, vuelos, sillas, this.#ejecutivo ? "" : "disabled")
    return htmlForm
  }

  static #add = async () => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-reservas")) {
      return
    }

    const data = this.#getFormData()
    console.log(data)

    try {
      // enviar la solicitud de creación con los datos del formulario
      let response = await Helpers.fetchData(`${this.#url}/vuelos-reservas`, {
        method: "POST",
        body: data
      })
      console.log(response)

      if (response.message === "ok") {

        let response2 = await Helpers.fetchData(`${this.#url}/vuelos-reservas`, {
          method: "POST",
          body: data,
        })
        console.log(response2)
        if (response2.message === "ok") {
          this.#table.addRow({
            fechaHora: data.fechaHoraReserva,
            usuario: data.usuario
          })
          this.#table2.addRow(data)

          Toast.info({
            message: "Registro agregado",
            mode: 'success',
            error: response
          })
          this.#modal.dispose()
        }
      } else {

        Toast.info({
          message: "No se pudo agregar el registro",
          mode: 'warning',
          error: response
        })
      }
    } catch (e) {

      Toast.info({
        message: "Sin acceso a la creación de registros",
        mode: 'danger',
        error: response
      })
    }
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del vuelo
   */
  static #getFormData() {
    // ubicar el trayecto con base en el índice del elemento de lista seleccionado
    const iUsuario = document.querySelector(`#${this.#modal.id} #usuarios`).selectedIndex
    const usuario = this.#usuarios.data[iUsuario]


    const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
    const vuelo = this.#vuelos.data[iVuelo]


    const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
    const silla = this.#sillas.data[iSilla]

    const now = DateTime.local();
    const fechaHoraReserva = now.toFormat('yyyy-MM-dd HH:mm').replace(" ", "T")

    let obj = {
      fechaHoraReserva,
      usuario: usuario.identificacion,
      fechaHoraVuelo: vuelo.fechaHora,
      origen: vuelo.trayecto.origen,
      destino: vuelo.trayecto.destino,
      avion: vuelo.avion.matricula,
      fila: silla.fila,
      columna: silla.columna
    }

    if (this.#ejecutivo === true) {
      obj.menu = document.querySelector(`#${this.#modal.id} #menu`)
      obj.licor = document.querySelector(`#${this.#modal.id} #licor`)
    }
    console.log(obj)
    return obj
  }

  static #addChildButton = (cell, formatterParams, onRendered) => `
  <button id="add-child" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Agregar hijo">${icons.addChild}</button>
`

  static #addChildClick = (e, cell) => {
  console.log('agregar hijo', cell.getRow().getData())
}

static #editRowChildButton = (cell, formatterParams, onRendered) => `
        <button id="edit-row-child" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar hijo">${icons.edit}</button>
    `

    static #editRowChildClick = (e, cell) => {
        console.log('edit child', cell.getRow().getData())
    }

    static #deleteRowChildButton = (cell, formatterParams, onRendered) => `
        <button id="delete-row-child" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Eliminar hijo">${icons.delete}</button>
    `
    static #deleteRowChildClick = (e, cell) => {
        console.log('delete child', cell.getRow().getData())
    }


}