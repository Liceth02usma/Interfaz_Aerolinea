import { TabulatorFull as Tabulator } from '../../node_modules/tabulator-tables/dist/js/tabulator_esm.js'
//NOTA: Preguntar actualizacion y hacer el eliminar 
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


    const nestedData = responseVuelos.data


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
      height: '800px',
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

    (this.#modal = new Modal({
      title: "Actualizar una Reserva",
      // se pasan los datos de la fila al formulario
      content: await this.#createForm(cell, cell.getRow().getData()),
      buttons: [
          {
              id: "add-flights",
              style: "btn-teal",
              html: `<span>Actualizar</span>`,
              callBack: () => this.#update2(cell.getRow()),
          },
          {
              id: "cancel-add-flights",
              style: "btn-red",
              html: `<span>Cancelar</span>`,
              callBack: () => this.#modal.dispose(),
          },
      ],
  })).show()

  document.querySelector('#fechaHora').classList.remove('hidden')
 
  document.querySelector('#usuario').classList.remove('hidden')
  document.querySelector('#checkIn2').classList.remove('hidden')
  document.querySelector('#check-ida2').classList.add('hidden')
  document.querySelector('#vuelo1').classList.add('hidden')
  console.log(document.querySelector('#vuelo1'))
  document.querySelector('#silla2').classList.add('hidden')
  document.querySelector('#menu2').classList.add('hidden')
  document.querySelector('#licor2').classList.add('hidden')


  }

  static #adicionarVuelos2 = async () => {
    let cell = ""
    this.#modal = new Modal({
        title: "Agregar una reserva",
        content: await this.#createForm(cell),
        buttons: [
            {
                id: "add-flights",
                style: "btn-teal",
                html: `Agregar`,
                callBack: () => this.#add2(cell),
            },
            {
                id: "cancel-add-flights",
                style: "btn-red",
                html: `Cancelar`,
                callBack: () => this.#modal.dispose(),
            }
        ],
    }).show()

    document.querySelector('#fechaHora').classList.remove('hidden')
    document.querySelector('#fecha-hora').removeAttribute('disabled')
    document.querySelector('#usuario').classList.remove('hidden')
    document.querySelector('#usuarios').disabled = false

    document.querySelector(`#${this.#modal.id} #vuelos`).addEventListener('change', async () => {
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelos.data[iVuelo]
      this.#sillas = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${vuelo.fechaHora}&origen=${vuelo.origen}&destino=${vuelo.destino}&avion=${vuelo.avion.matricula}`)
      console.log(this.#sillas.data)
      Helpers.populateSelectList(
        `#${this.#modal.id} #sillas`, this.#sillas.data, 'posicion', 'posicion'
      )
    })

    

    let vuelo_ida = async () => {
      
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelos.data[iVuelo]
      this.#vuelosVuelta = []
      this.#vuelos.data.forEach(t =>{
        if( t.trayecto.origen == vuelo.trayecto.destino && t.trayecto.destino == vuelo.trayecto.origen){

          this.#vuelosVuelta.push(t)
        }
      })
      if(this.#vuelosVuelta.length !=0){
        Helpers.populateSelectList(
        `#${this.#modal.id} #vuelos-ida`, this.#vuelosVuelta, 'toString', 'toString'
      )
      let sillas_ida
      if(document.querySelector(`#${this.#modal.id} #check-ida`).checked){
        sillas_ida = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${this.#vuelosVuelta[0].fechaHora}&origen=${this.#vuelosVuelta[0].origen}&destino=${this.#vuelosVuelta[0].destino}&avion=${this.#vuelosVuelta[0].avion.matricula}`)
        Helpers.populateSelectList(
          `#${this.#modal.id} #sillas-ida`, sillas_ida.data, 'posicion', 'posicion'
      )}
      this.#sillas_ida = sillas_ida
    }else{
        document.querySelector(`#${this.#modal.id} #vuelos-ida`).innerHTML = ""
        document.querySelector(`#${this.#modal.id} #sillas-ida`).innerHTML = ""
        document.querySelector(`#${this.#modal.id} #vuelos-ida`).add(new Option("No hay devuélvase en bus :(", 0))
        document.querySelector(`#${this.#modal.id} #sillas-ida`).add(new Option("No hay vuelos ahora menos sillas :(", 0))

      }
    }

    document.querySelector(`#${this.#modal.id} #check-ida`).addEventListener('change', async () =>{
      document.querySelector(`#${this.#modal.id} #vuelos-ida2`).classList.toggle('hidden')
      document.querySelector(`#${this.#modal.id} #sillas-ida2`).classList.toggle('hidden')
      await vuelo_ida()
    })

    document.querySelector(`#${this.#modal.id} #vuelos`).addEventListener('change', vuelo_ida)

    document.querySelector(`#${this.#modal.id} #vuelos-ida`).addEventListener('change', async()=>{
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelosVuelta[iVuelo]
      let sillas_ida = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${vuelo.fechaHora}&origen=${vuelo.origen}&destino=${vuelo.destino}&avion=${vuelo.avion.matricula}`)
      Helpers.populateSelectList(
        `#${this.#modal.id} #sillas-ida`, sillas_ida.data, 'posicion', 'posicion'
      )
    })

    
    let cambioSillas = async () => {
      const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
      const silla = this.#sillas.data[iSilla]
      let silla1 = silla
      if(document.querySelector(`#${this.#modal.id} #check-ida`).checked) { 
        const iSilla1 = document.querySelector(`#${this.#modal.id} #sillas-ida`).selectedIndex
        silla1 = this.#sillas_ida.data[iSilla1]
      }
      console.log(document.querySelector(`#${this.#modal.id} #check-ida`).value)

      let menu = document.querySelector(`#${this.#modal.id} #menu`)
      let licor = document.querySelector(`#${this.#modal.id} #licor`)
      if (silla.hasOwnProperty('licor') || silla1.hasOwnProperty('licor')) {
        menu.disabled = false
        licor.disabled = false
        this.#ejecutivo = true
      } else {
        menu.disabled = true
        licor.disabled = true
        this.#ejecutivo = false
      }
    }
    document.querySelector(`#${this.#modal.id} #sillas`).addEventListener('change', cambioSillas)
    document.querySelector(`#${this.#modal.id} #sillas-ida`).addEventListener('change', cambioSillas)


}


static #add2 = async (cell) => {
  // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
  if (!Helpers.okForm("#form-reservas")) {
    return
  }

  const data = this.#getFormData(cell,document.querySelector('#usuarios').value,document.querySelector('#fecha-hora').value)/////////////////////////////
  console.log(data)

  data.forEach( async t =>{
    try {
        // enviar la solicitud de creación con los datos del formulario
        let response = await Helpers.fetchData(`${this.#url}/reservas`, {
          method: "POST",
          body: {
            fechaHora: t.fechaHoraReserva,
            usuario: t.usuario
          }
        })
  
        if (response.message === "ok") {
  
          let response2 = await Helpers.fetchData(`${this.#url}/vuelos-reservas`, {
            method: "POST",
            body: t,
          })
          if (response2.message === "ok") {
            this.#table.addRow({
              fechaHora: t.fechaHoraReserva,
              usuario: t.usuario
            })
            this.#table2.addRow(t)
  
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
  })

  
}



  static #update2 = async (row) => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-reservas")) {
        return
    }
    const data = {
      fechaHora: row.getData().fechaHora,
      usuario: row.getData().usuario.identificacion,
      cancelada: document.querySelector('#checkIn').checked
    }

    try {
        // enviar la solicitud de actualización con los datos del formulario
        let response = await Helpers.fetchData(`${this.#url}/reservas`, {
            method: "PUT",
            body: data,
        })

        if (response.message === "ok") {
            // modificar los datos de la fila teniendo en cuenta que en la tabla existe la columna matrícula y no avión
            row.getData().cancelada = data.cancelada
            row.update( row.getData())
            Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro actualizado" })
            this.#modal.dispose()
        } else {
            Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo actualizar el registro", response })
        }
    } catch (e) {
        Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la actualización de registros", e })
    }
}

  static #deleteRowButton = (cell, formatterParams, onRendered) => `
        <button class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Eliminar">
        ${icons.eliminar}
        </button>
    `
  static #deleteRow = (e, cell) => {
    (this.#modal = new Modal({
      title: "Eliminar una reserva",
      content: `
        Confirme la eliminación de la reserva:<br>
        Fecha y hora: ${DateTime.fromISO(cell.getRow().getData().fechaHora).toFormat('yyyy-MM-dd hh:mm a')} <br>
        Pasajero : ${cell.getRow().getData().usuario.identificacion}
    `,
      buttons: [
          {
              id: "add-flights",
              style: "btn-teal",
              html: `${icons.add}<span>Eliminar</span>`,
              callBack: () => this.#delete2(cell.getRow()),
          },
          {
              id: "cancel-add-flights",
              style: "btn-red",
              html: `${icons.xLg}<span>Cancelar</span>`,
              callBack: () => this.#modal.dispose(),
          },
      ],
  })).show()
  }

  static async #delete2(row) {
    const data = row.getData()

    const queryString = `fechaHora=${data.fechaHora}&usuario=${data.usuario.identificacion}`


    try {
        // enviar la solicitud de eliminación

        if(data.vuelos.length > 0){
          data.vuelos.forEach(async t=>{
            await this.#delete(t)
          })
        }
        let response = await Helpers.fetchData(`${this.#url}/reservas/${queryString}`, {
            method: "DELETE"
        })

        if (response.message === "ok") {
            // eliminar la fila de la tabla
            row.delete()
            //Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro eliminado" })
            this.#modal.dispose()
        } else {
           // Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo eliminar el registro", response })
        }
    } catch (e) {
        //Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la eliminación de registros", e })
    }
}

  static #editRowClick = async (e,cell) => { 
    (this.#modal = new Modal({
      title: "Actualizar una reserva Vuelo",
      // se pasan los datos de la fila al formulario
      content: await  this.#createForm(cell,cell.getRow().getData()),
      buttons: [
          {
              id: "add-flights",
              style: "btn-teal",
              html: `<span>Actualizar</span>`,
              callBack: () => this.#update(cell),
          },
          {
              id: "cancel-add-flights",
              style: "btn-red",
              html: `<span>Cancelar</span>`,
              callBack: () => this.#modal.dispose(),
          },
      ],
  })).show()
  let cambioSillas = async () => {
    const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
    const silla = this.#sillas.data[iSilla]
    let silla1 = silla

    let menu = document.querySelector(`#${this.#modal.id} #menu`)
    let licor = document.querySelector(`#${this.#modal.id} #licor`)
    if (silla.hasOwnProperty('licor') || silla1.hasOwnProperty('licor')) {
      menu.disabled = false
      licor.disabled = false
      this.#ejecutivo = true
    } else {
      menu.disabled = true
      licor.disabled = true
      this.#ejecutivo = false
    }
  }
  document.querySelector(`#${this.#modal.id} #sillas`).addEventListener('change', cambioSillas)
  document.querySelector(`#${this.#modal.id} #check-ida2`).classList.add('hidden')
  
  }

  static #update = async (row) => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-reservas")) {
        return
    }
    let data2 = row.getRow().getData()
    let reserva = data2.reserva
    let silla = data2.silla
    let vuelo = data2.vuelo
    const c = `fechaHoraReserva=${reserva.fechaHora}&usuario=${reserva.usuario.identificacion}&fechaHoraVuelo=${vuelo.fechaHora}&origen=${vuelo.trayecto.origen}&destino=${vuelo.trayecto.destino}&avion=${vuelo.avion.matricula}&fila=${silla.fila}&columna=${silla.columna}`

    console.log(vuelo.trayecto.origen)
    const data = this.#getFormData(row,data2.reserva.usuario.identificacion, data2.reserva.fechaHora)[0]


    

    try {
        // enviar la solicitud de actualización con los datos del formulario
        let response = await Helpers.fetchData(`${this.#url}/vuelos-reservas/${c}`, {
            method: "PUT",
            body: data,
        })

        if (response.message === "ok") {
            // modificar los datos de la fila teniendo en cuenta que en la tabla existe la columna matrícula y no avión
            
            row.getRow.update(data)
            //Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro actualizado" })
            this.#modal.dispose()
        } else {
            //Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo actualizar el registro", response })
        }
    } catch (e) {
        //Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la actualización de registros", e })
    }
}

  static #deleteRowClick = (e,cell) => { 
    (this.#modal = new Modal({
      title: "Eliminar una Reserva-Vuelo",
      content: `
        Confirme la eliminación de la Reserva-Vuelo:<br>
        ${cell.getRow().getData().vuelo.trayecto.origen} – ${cell.getRow().getData().vuelo.trayecto.destino}<br>
        Silla: ${cell.getRow().getData().silla.posicion}     Pasajero: ${cell.getRow().getData().reserva.usuario.identificacion} <br>
    `,
      buttons: [
          {
              id: "add-flights",
              style: "btn-teal",
              html: `${icons.add}<span>Eliminar</span>`,
              callBack: () => this.#delete(cell.getRow()),
          },
          {
              id: "cancel-add-flights",
              style: "btn-red",
              html: `${icons.xLg}<span>Cancelar</span>`,
              callBack: () => this.#modal.dispose(),
          },
      ],
  })).show()
  }

  static async #delete(row) {
    let data
    try {
      data = row.getData()
    } catch (error) {
      data = row
    }
    let data2 = data
    let reserva = data2.reserva
    let silla = data2.silla
    let vuelo = data2.vuelo
    
    const queryString = `fechaHoraReserva=${reserva.fechaHora}&usuario=${reserva.usuario.identificacion}&fechaHoraVuelo=${vuelo.fechaHora}&origen=${vuelo.trayecto.origen}&destino=${vuelo.trayecto.destino}&avion=${vuelo.avion.matricula}&fila=${silla.fila}&columna=${silla.columna}
    `
    console.log(queryString,data)

    try {
        // enviar la solicitud de eliminación
        let response = await Helpers.fetchData(`${this.#url}/vuelos-reservas/${queryString}`, {
            method: "DELETE"
        })

        if (response.message === "ok") {
            // eliminar la fila de la tabla
            row.delete()
            // Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro eliminado" })
            this.#modal.dispose()
        } else {
            // Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo eliminar el registro", response })
            console.log(response)
        }
    } catch (e) {
        // Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la eliminación de registros", e })
    }
}
 

  /**
   * Despliega el cuadro de diálogo que permite agregar registros
   * @param {Event} e
   */
  static #adicionarVuelos = async (e, cell) => {
    e.preventDefault()
    this.#modal = new Modal({
      title: "Agregar una Reserva",
      content: await Reservas.#createForm(cell),
      buttons: [
        {
          id: "add-flights",
          style: "btn-teal",
          html: `<span>Agregar</span>`,
          callBack: () => this.#add(cell),
        },
        {
          id: "cancel-add-flights",
          style: "btn-red",
          html: `<span>Cancelar</span>`,
          callBack: () => this.#modal.dispose(),
        }
      ],
    }).show()
    let reserva = cell.getRow().getData()
    document.querySelector(`#${this.#modal.id} #vuelos`).addEventListener('change', async () => {
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelos.data[iVuelo]
      this.#sillas = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${vuelo.fechaHora}&origen=${vuelo.origen}&destino=${vuelo.destino}&avion=${vuelo.avion.matricula}`)
      console.log(this.#sillas.data)
      Helpers.populateSelectList(
        `#${this.#modal.id} #sillas`, this.#sillas.data, 'posicion', 'posicion'
      )
    })

    

    let vuelo_ida = async () => {
      
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelos.data[iVuelo]
      this.#vuelosVuelta = []
      this.#vuelos.data.forEach(t =>{
        if( t.trayecto.origen == vuelo.trayecto.destino && t.trayecto.destino == vuelo.trayecto.origen){

          this.#vuelosVuelta.push(t)
        }
      })
      if(this.#vuelosVuelta.length !=0){
        Helpers.populateSelectList(
        `#${this.#modal.id} #vuelos-ida`, this.#vuelosVuelta, 'toString', 'toString'
      )
      let sillas_ida
      if(document.querySelector(`#${this.#modal.id} #check-ida`).checked){
        sillas_ida = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${this.#vuelosVuelta[0].fechaHora}&origen=${this.#vuelosVuelta[0].origen}&destino=${this.#vuelosVuelta[0].destino}&avion=${this.#vuelosVuelta[0].avion.matricula}`)
        Helpers.populateSelectList(
          `#${this.#modal.id} #sillas-ida`, sillas_ida.data, 'posicion', 'posicion'
      )}
      this.#sillas_ida = sillas_ida
    }else{
        document.querySelector(`#${this.#modal.id} #vuelos-ida`).innerHTML = ""
        document.querySelector(`#${this.#modal.id} #sillas-ida`).innerHTML = ""
        document.querySelector(`#${this.#modal.id} #vuelos-ida`).add(new Option("No hay devuélvase en bus :(", 0))
        document.querySelector(`#${this.#modal.id} #sillas-ida`).add(new Option("No hay vuelos ahora menos sillas :(", 0))

      }
    }

    document.querySelector(`#${this.#modal.id} #check-ida`).addEventListener('change', async () =>{
      document.querySelector(`#${this.#modal.id} #vuelos-ida2`).classList.toggle('hidden')
      document.querySelector(`#${this.#modal.id} #sillas-ida2`).classList.toggle('hidden')
      await vuelo_ida()
    })

    document.querySelector(`#${this.#modal.id} #vuelos`).addEventListener('change', vuelo_ida)

    document.querySelector(`#${this.#modal.id} #vuelos-ida`).addEventListener('change', async()=>{
      const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
      const vuelo = this.#vuelosVuelta[iVuelo]
      let sillas_ida = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${vuelo.fechaHora}&origen=${vuelo.origen}&destino=${vuelo.destino}&avion=${vuelo.avion.matricula}`)
      Helpers.populateSelectList(
        `#${this.#modal.id} #sillas-ida`, sillas_ida.data, 'posicion', 'posicion'
      )
    })

    
    let cambioSillas = async () => {
      const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
      const silla = this.#sillas.data[iSilla]
      let silla1 = silla
      if(document.querySelector(`#${this.#modal.id} #check-ida`).checked) { 
        const iSilla1 = document.querySelector(`#${this.#modal.id} #sillas-ida`).selectedIndex
        silla1 = this.#sillas_ida.data[iSilla1]
      }
      console.log(document.querySelector(`#${this.#modal.id} #check-ida`).value)

      let menu = document.querySelector(`#${this.#modal.id} #menu`)
      let licor = document.querySelector(`#${this.#modal.id} #licor`)
      if (silla.hasOwnProperty('licor') || silla1.hasOwnProperty('licor')) {
        menu.disabled = false
        licor.disabled = false
        this.#ejecutivo = true
      } else {
        menu.disabled = true
        licor.disabled = true
        this.#ejecutivo = false
      }
    }
    document.querySelector(`#${this.#modal.id} #sillas`).addEventListener('change', cambioSillas)
    document.querySelector(`#${this.#modal.id} #sillas-ida`).addEventListener('change', cambioSillas)
  }


  static #createForm = async (cell,{ checkIn = "", reserva ="", vuelo="", silla="", cancelada=""} = {}) => {
    // crear la lista de opciones para el select de trayectos

    let seleccionado = vuelo == "" ? "" : `${DateTime.fromISO(vuelo.fechaHora).toFormat('yyyy-MM-dd hh:mm a')}  ${vuelo.trayecto.origen} - ${vuelo.trayecto.destino}  ${vuelo.avion.matricula}` 
    const vuelos = Helpers.toOptionList({
      items: this.#vuelos.data,
      value: "toString",
      text: "toString",
      selected: seleccionado,
    })
    //let seleccionado2 = reserva == "" ? "" : `${reserva.usuario.identificacion}` 
    let seleccionado2 = !(cancelada === "") ? `${cell.getRow().getData().usuario.identificacion}`: reserva == "" ? "" : `${reserva.usuario.identificacion}` 
    // crear la lista de opciones para el select de aviones

    let menus = [
      {
        value: "POLLO_A_LA_NARANJA",
        text: "Pollo a la naranja"
      },
      {
        value: "FILETE_DE_PESCADO",
        text: "Filete de pescado"
      },
      {
        value: "VEGETARIANO",
        text: "Vegetariano"
      },
      {
        value: "INDEFINIDO",
        text: "Indefinido"
      }
    ]

    let licores = [
      {
        value: "VINO",
        text: "Vino"
      },
      {
        value: "OPORTO",
        text: "Oporto"
      },
      {
        value: "WHISKEY",
        text: "Whiskey"
      },
      {
        value: "NINGUNO",
        text: "Ninguno"
      }
    ]

    const usuarios = Helpers.toOptionList({
      items: this.#usuarios.data,
      value: "identificacion",
      text: "toString",
      selected: seleccionado2,
    })

    vuelo = vuelo == "" ? this.#vuelos.data[0] : vuelo

    console.log(vuelo)

    this.#sillas = await Helpers.fetchData(`${this.#url}/vuelos-reservas/libres/fechaHora=${vuelo.fechaHora}&origen=${vuelo.origen}&destino=${vuelo.destino}&avion=${vuelo.avion.matricula}`)

    let seleccionado3 = silla == "" ? "" : `${silla.posicion}`

    const sillas = Helpers.toOptionList({
      items: this.#sillas.data,
      value: "posicion",
      text: "posicion",
      selected: seleccionado3 ,
    })

    this.#ejecutivo = silla =="" ? this.#sillas.data[0].hasOwnProperty('licor') : silla.licor != null ? silla.hasOwnProperty('licor') : false
  
    console.log(this.#ejecutivo,silla)

    let seleccionado4 = silla == "" ||( !(this.#ejecutivo) && silla != "") ? menus[3].value : silla.menu
    

    console.log(seleccionado4)
    const menu = Helpers.toOptionList({
      items: menus,
      value: "value",
      text: "text",
      selected: seleccionado4 ,
    })


    let seleccionado5 = silla == "" ||( !(this.#ejecutivo) && silla != "") ? licores[3].value : silla.licor
    console.log("esto es", seleccionado4)

    const licor = Helpers.toOptionList({
      items: licores,
      value: "value",
      text: "text",
      selected: seleccionado5 ,
    })

    const fechaHora = cancelada === "" ? "" : `${cell.getRow().getData().fechaHora}` 
    const cancelada2 = cancelada === "" ? false : cancelada

    console.log("fecha Hora: ", cancelada == "")

    //inyectar en el formulario de vuelos los datos del objeto recibido como argumento

    const htmlForm = this.#formReservas.translate(usuarios, vuelos, sillas, this.#ejecutivo ? "" : "disabled", menu,licor,fechaHora, cancelada2 ? "checked" : "")

    // return htmlForm
    return htmlForm

  }


  static #add = async (cell) => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-reservas")) {
      return
    }

    const data = this.#getFormData(cell)
    console.log(data)

    data.forEach( async t =>{
      console.log(t)
      try {
          // enviar la solicitud de creación con los datos del formulario
          let response = await Helpers.fetchData(`${this.#url}/vuelos-reservas`, {
            method: "POST",
            body: t
          })
          console.log(response)

          if (response.message === "ok") {

              this.#table2.addRow(t)

              Toast.info({
                message: "Registro agregado",
                mode: 'success',
                error: response
              })
              this.#modal.dispose()
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
    })

    
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del vuelo
   */
  static #getFormData(cell, usuario = "", fechaHoraR = "") {
    // ubicar el trayecto con base en el índice del elemento de lista seleccionado
    // const iUsuario = document.querySelector(`#${this.#modal.id} #usuarios`).selectedIndex
    usuario = usuario == "" ? cell.getRow().getData().usuario.identificacion : usuario



    const iVuelo = document.querySelector(`#${this.#modal.id} #vuelos`).selectedIndex
    const vuelo = this.#vuelos.data[iVuelo]


    const iSilla = document.querySelector(`#${this.#modal.id} #sillas`).selectedIndex
    const silla = this.#sillas.data[iSilla]

    const fechaHoraReserva = fechaHoraR == "" ? cell.getRow().getData().fechaHora : fechaHoraR
 
    let obj = {
      fechaHoraReserva,
      usuario,
      fechaHoraVuelo: vuelo.fechaHora,
      origen: vuelo.trayecto.origen,
      destino: vuelo.trayecto.destino,
      avion: vuelo.avion.matricula,
      fila: silla.fila,
      columna: silla.columna
    }

    if (this.#ejecutivo === true) {
      obj.menu = document.querySelector(`#${this.#modal.id} #menu`).value
      obj.licor = document.querySelector(`#${this.#modal.id} #licor`).value
    }
    if(document.querySelector(`#${this.#modal.id} #check-ida`).checked && this.#vuelosVuelta){
      const iVuelo1 = document.querySelector(`#${this.#modal.id} #vuelos-ida`).selectedIndex
      const vuelo1 =  this.#vuelosVuelta[iVuelo1]

      const iSilla1 = document.querySelector(`#${this.#modal.id} #sillas-ida`).selectedIndex
      const silla1 = this.#sillas_ida.data[iSilla1]


      let obj2 = {
        fechaHoraReserva,
        usuario,
        fechaHoraVuelo: vuelo1.fechaHora,
        origen: vuelo1.trayecto.origen,
        destino: vuelo1.trayecto.destino,
        avion: vuelo1.avion.matricula,
        fila: silla1.fila,
        columna: silla1.columna
      }
      if (silla1.hasOwnProperty('licor')) {
        obj2.menu = document.querySelector(`#${this.#modal.id} #menu`).value
        obj2.licor = document.querySelector(`#${this.#modal.id} #licor`).value
      }

      
      return [obj, obj2]
    }

    return [obj]               
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