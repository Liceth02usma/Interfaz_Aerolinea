

export default class Vuelos {


  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Vuelos.init()")
  }

  static async init() {

    let response = await Helpers.fetchData(`${localStorage.getItem('url')}/vuelos`)
    const data = Helpers.flat(response.data)
    document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <select id="filter-field" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="origen">Origen</option>
          <option value="destino">Destino</option>
          <option value="matricula">Avion</option>
          <option value="costo">Costo</option>
          <option value="fechaHora">Fecha/hora</option>
          <option value="duracion">Duracion</option>
          <option value="cancelado">Cancelado</option>
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
      
      <div class="p-2 w-full">
      <div id="vuelos-aux-table" class="relative mt-[20%]  m-2"></div>
      </div></br></br></br></br></br></br></br></br>
        `
    let filtroCabecera = document.querySelector("#filter-field");
    let tipoFiltro = document.querySelector("#filter-type");
    let valorFiltro = document.querySelector("#filter-value");

    function actualizarFiltro() {
      let valorFiltro2 = filtroCabecera.value
      let valorTipo = tipoFiltro.value
      let valor = valorFiltro.value

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
    let table = new Tabulator("#vuelos-aux-table", {
      height: "86,5vh", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: data, //assign data to table
      layout: "fitColumns", //fit columns to width of table (optional)
      columns: [ //Define Table Columns
        { title: "ORIGEN", field: "origen", width: 150 },
        { title: "DESTINO", field: "destino", hozAlign: "left" },
        { title: "AVIÓN", field: "matricula", hozAlign: "left" },

        {
          title: "FECHA/HORA", field: "fechaHora", width: 200, hozAlign: "center", formatter: (cell, formatterParams) => {
            const { outputFormat = "yyyy-MM-dd hh:mm a" } = formatterParams
            let value = cell.getValue()
            return DateTime.fromISO(value).toFormat(outputFormat)
          }
        },
        {
          title: "DURACIÓN", field: "duracion", hozAlign: "center", formatter: (cell, formatterParams) => {
            const { outputFormat = "hh:mm" } = formatterParams
            let value = cell.getValue()
            return Duration.fromISO(value).toFormat(outputFormat)
          }
        },
        { title: "COSTO", field: "costo", hozAlign: "center", formatter: "money" },
        { title: "CANCELADO", field: "cancelado", hozAlign: "center", formatter: "tickCross" },

      ],
      footerElement: `
        <div class='flex justify-end w-full'>
        <button class='bg-teal-900 text-gray-50 rounded px-3 py-1'>Agregar</button>
        </div>
    `.trim(),
    })


  }

}