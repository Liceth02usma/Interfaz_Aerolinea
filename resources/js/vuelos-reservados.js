

export default class Vuelos {


  _Data

  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Pasajeros.init()")
  }

  static async init(data1) {
    this._Data = data1
    let lista = []
    // https://tabulator.info/docs/5.4/quickstart
    let response = await Helpers.fetchData(`${localStorage.getItem('url')}/vuelos-reservas`)

    let pass = "pass"
    response.data.forEach(item => item.pasajero.identificacion == this._Data.identificacion ? lista = item.vuelos : pass)

    const data = Helpers.flat(lista)
    document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <select id="filter-field" class="text-gray-700  mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="origen">Origen</option>
          <option value="destino">Destino</option>
          <option value="matricula">Avion</option>
          <option value="costo">Costo</option>
          <option value="posicion">Silla</option>
          <option value="ubicacion">Ubicacion de la Silla</option>
          <option value="menu">Menu</option>
          <option value="licor">Licor</option>
          <option value="fechaHora">Fecha/hora</option>
          <option value="duracion">Duracion</option>
          <option value="checkIn">Check-In</option>
          <option value="cancelado">Cancelado</option>
        </select>
      
        <select id="filter-type" class="text-gray-700 mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">>
          <option value="=">=</option>
          <option value="<"><</option>
          <option value="<="><=</option>
          <option value=">">></option>
          <option value=">=">>=</option>
          <option value="!=">!=</option>
          <option value="like">como</option>
        </select>
      
        <input id="filter-value" type="text" placeholder="valor" class="shadow appearance-none border w-[15%] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
      
        <button id="filter-clear" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Limpiar</button>
      </div>
      
      <div class="p-2 w-full">
      <div id="reservas-table" class="relative mt-[20%]  m-2"></div>
      </div></br></br></br></br></br></br></br></br>
        `
    let filtroCabecera = document.querySelector("#filter-field");
    let tipoFiltro = document.querySelector("#filter-type");
    let valorFiltro = document.querySelector("#filter-value");

    function actualizarFiltro() {
      let valorFiltro2 = filtroCabecera.value
      let valorTipo = tipoFiltro.value
      let valor = valorFiltro.value

      valorFiltro2 === "ubicacion" ? valor = valor.toUpperCase() : pass
      valorFiltro2 === "menu" || "licor" ? valor = valor.toUpperCase().replace(" ", "_").replace(" ", "_") : pass

      if (valorFiltro2 === "duracion") {
        let tiempo = valor.split(":")
        valor = tiempo[0] === "00" ? `PT${tiempo[1]}M` : `PT${tiempo[0]}H${tiempo[1]}M`
      }

      if (valorFiltro2 === "costo") {
        valor = valor.includes(",") || valor.includes(".") ? valor.replace(",", "").split(".")[0] : valor
      }
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
    //initialize table
    let table = new Tabulator("#reservas-table", {
      height: 90, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: data, //assign data to table
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
              return "Ejecutivo"
            } catch (error) {
              return "Economico"
            }
          }
        },
        { title: "CHECK-IN", field: "checkIn", hozAlign: "center", formatter: "tickCross" },
        { title: "CANCELADO", field: "cancelado", hozAlign: "center", formatter: "tickCross" },
        { formatter: this.#editRowButton, width: 40, hozAlign: "center", cellClick: this.#editRow },
        { formatter: this.#deleteRowButton, width: 40, hozAlign: "center", cellClick: this.#deleteRow }
      ],
      footerElement: `
        <div class='flex justify-end w-full'>
        <button class='bg-teal-900 text-gray-50 rounded px-3 py-1'>Agregar</button>
        </div>
    `.trim(),
    })

    //trigger an alert message when the row is clicked
    table.on("rowClick", function (e, row) {
      alert("Row " + row.getData().origen + " Clicked!!!!");
    });
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
}