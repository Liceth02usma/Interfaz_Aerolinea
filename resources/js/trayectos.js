

export default class Trayectos {
  static #url = localStorage.getItem("url")
  static #table
  static #modal
  static #formTrayectos


  constructor() {
    throw new Error("Esta clase no permite el uso del constructor. Utilice Personal.init()")
  }

  static async init() {

    this.#formTrayectos = await Helpers.loadPage("./resources/html/form-trayectos.html")



    // https://tabulator.info/docs/5.4/quickstart
    let response = await Helpers.fetchData(`${localStorage.getItem('url')}/trayectos`)
    document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <select id="filter-field" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="origen">Origen</option>
          <option value="destino">Destino</option>
          <option value="costo">Costo</option>
          <option value="duracion">Duracion</option>
        </select>
      
        <select id="filter-type" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
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
      <div id="trayectos-table" class="relative mt-[20%]  m-2"></div>
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
        let pass = "pass"
        valor = valor.includes(",") || valor.includes(".") ? valor.replace(",", "").split(".")[0] : pass

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

    //initialize this.#table
    let table = new Tabulator("#trayectos-table", {
      height: "86,5vh", // set height of this.#table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: response.data, //assign data to this.#table
      layout: "fitColumns", //fit columns to width of this.#table (optional)
      columns: [ //Define this.#table Columns
        { title: "ORIGEN", field: "origen", width: 150 },
        { title: "DESTINO", field: "destino", hozAlign: "CENTER" },
        { title: "COSTO", field: "costo", hozAlign: "center", formatter: "money" },
        {
          title: "DURACIÓN", field: "duracion", hozAlign: "center", formatter: (cell, formatterParams) => {
            const { outputFormat = "hh:mm" } = formatterParams
            let value = cell.getValue()
            return Duration.fromISO(value).toFormat(outputFormat)
          }
        },
        { formatter: this.#editRowButton, width: 40, hozAlign: "center", cellClick: this.#editRowClick },
        { formatter: this.#deleteRowButton, width: 40, hozAlign: "center", cellClick: this.#deleteRowClick }
      ],
      footerElement: `
        <div class='flex justify-end w-full'>
        <button id='add-users' class='btn-teal'>Agregar</button>
    </div>
    `.trim(),
    })

    this.#table = table

    //trigger an alert message when the row is clicked

    this.#table.on("tableBuilt", () => {
      document.querySelector("#add-users").addEventListener("click", this.#adicionarVuelos)
    })
  }

  static #editRowButton = (cell, formatterParams, onRendered) => `
        <button id="edit-row" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar">
            ${icons.actualizar}
        </button>
    `
  /**
       * Despliega el cuadro de diálogo que permite actualizar registros
       * @param {Event} e
       * @param {Cell} cell
       */
  static #editRowClick = (e, cell) => {
    (this.#modal = new Modal({
      title: "Actualizar un trayecto",
      // se pasan los datos de la fila al formulario
      content: this.#createForm(cell.getRow().getData()),
      buttons: [
        {
          id: "add-flights",
          style: "btn-teal",
          html: `<span>Actualizar</span>`,
          callBack: () => this.#update(cell.getRow()),
        },
        {
          id: "cancel-add-flights",
          style: "btn-red",
          html: `<span>Cancelar</span>`,
          callBack: () => this.#modal.dispose(),
        },
      ],
    })).show()
  }


  /**
       * Despliega el cuadro de diálogo que permite agregar registros
       * @param {Event} e
       */
  static #adicionarVuelos = (e) => {
    this.#modal = new Modal({
      title: "Agregar un vuelo",
      content: this.#createForm(),
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
  }

  static #add = async () => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-trayectos")) {
      return
    }

    const data = this.#getFormData()
    console.log(data)

    try {
      // enviar la solicitud de creación con los datos del formulario
      let response = await Helpers.fetchData(`${this.#url}/trayectos`, {
        method: "POST",
        body: data,
      })
      console.log(response)

      if (response.message === "ok") {
        // agregar la fila a la tabla pero antes agregar el atributo matricula que se requiere como columna de la tabla
        data.matricula = data.avion
        this.#table.addRow(data)

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
  }



  static #update = async (row) => {
    // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
    if (!Helpers.okForm("#form-trayectos")) {
      return
    }

    const data = this.#getFormData()
    console.log(data)

    try {
      // enviar la solicitud de actualización con los datos del formulario
      let response = await Helpers.fetchData(`${this.#url}/trayectos`, {
        method: "PUT",
        body: data,
      })

      if (response.message === "ok") {
        // modificar los datos de la fila teniendo en cuenta que en la tabla existe la columna matrícula y no avión
        data.matricula = data.avion
        row.update(data)
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
  static #deleteRowClick = (e, cell) => {
    (this.#modal = new Modal({
      title: "Eliminar un trayecto",
      content: `
              Confirme la eliminación del vuelo:<br>
              ${cell.getRow().getData().origen} – ${cell.getRow().getData().destino}<br>
              Duracion: ${Duration.fromISO(cell.getRow().getData().duracion).toFormat("hh:mm:ss")}<br>
          `,
      buttons: [
        {
          id: "add-flights",
          style: "btn-teal",
          html: `<span>Eliminar</span>`,
          callBack: () => this.#delete(cell.getRow()),
        },
        {
          id: "cancel-add-flights",
          style: "btn-red",
          html: `<span>Cancelar</span>`,
          callBack: () => this.#modal.dispose(),
        },
      ],
    })).show()
  }


  static async #delete(row) {
    const data = row.getData()
    // la tabla tiene el atributo matrícula pero la petición requiere el atributo avión
    data.avion = data.matricula
    // crear un array de strings key=value y usar join() para luego unir sus elementos con &
    const queryString = Object.keys(data).map((key) => `${key}=${data[key]}`).join("&")
    console.log(queryString)
    // información importante si se requiere encodeURIComponent
    // https://howchoo.com/javascript/how-to-turn-an-object-into-query-string-parameters-in-javascript#parameter-encoding

    try {
      // enviar la solicitud de eliminación
      let response = await Helpers.fetchData(`${this.#url}/trayectos/${queryString}`, {
        method: "DELETE"
      })

      if (response.message === "ok") {
        // eliminar la fila de la tabla
        row.delete()
        Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro eliminado" })
        this.#modal.dispose()
      } else {
        Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo eliminar el registro", response })
      }
    } catch (e) {
      Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la eliminación de registros", e })
    }
  }


  /**
 *
 * @param {Object} Un objeto con los datos de la fila a actualizar o nada si se va a agregar un registro
 * @returns
 */
  static #createForm = ({ origen = "", destino = "", costo = "", duracion = "" } = {}) => {
    // crear la lista de opciones para el select de trayectos





    // inyectar en el formulario de vuelos los datos del objeto recibido como argumento
    const htmlForm = this.#formTrayectos.translate(origen, destino, Duration.fromISO(duracion).toFormat("hh:mm:ss"), costo)
    return htmlForm
  }


  /**
    * Recupera los datos del formulario y crea un objeto para ser retornado
    * @returns Un objeto con los datos del vuelo
    */
  static #getFormData() {
    // ubicar el trayecto con base en el índice del elemento de lista seleccionado

    // ubicar el avión con base en el índice del elemento de lista seleccionado
    const costo = document.querySelector(`#${this.#modal.id} #costo`).value
    const destino = document.querySelector(`#${this.#modal.id} #destino`).value
    const origen = document.querySelector(`#${this.#modal.id} #origen`).value
    let duracion = document.querySelector(`#${this.#modal.id} #duracion`).value

    duracion = duracion.split(":")

    duracion = `PT${duracion[0]}H${duracion[1]}M${duracion[2]}S`
    return {
      costo,
      origen,
      destino,
      duracion
    }
  }

}