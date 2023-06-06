
export default class Aviones {
    static #url = localStorage.getItem("url")
    static #table
    static #modal
    static #formAviones


    constructor() {
        throw new Error("Esta clase no permite el uso del constructor. Utilice Aviones.init()")
    }
    static async init() {


        this.#formAviones = await Helpers.loadPage("./resources/html/form-avion.html")

        let response = await Helpers.fetchData(`${localStorage.getItem('url')}/sillas/total`)
        const data = Helpers.flat(response.data)
        console.log(data)



        document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <select id="filter-field" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="matricula">Matricula</option>
          <option value="modelo">Modelo</option>
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
      <div id="aviones-table" class="relative mt-[20%]  m-2"></div>
      </div></br></br></br></br></br></br></br></br>
        `
        let filtroCabecera = document.querySelector("#filter-field");
        let tipoFiltro = document.querySelector("#filter-type");
        let valorFiltro = document.querySelector("#filter-value");

        function actualizarFiltro() {
            let valorFiltro2 = filtroCabecera.value
            let valorTipo = tipoFiltro.value
            let valor = valorFiltro.value


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
        let table = new Tabulator("#aviones-table", {
            height: "86,5vh", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: data, //assign data to table
            layout: "fitColumns", //fit columns to width of table (optional)
            columns: [ //Define Table Columns
                { title: "MATRICULA", field: "matricula", hozAlign: "center" },
                { title: "MODELO", field: "modelo", hozAlign: "center" },
                { title: "S. EJECUTIVAS", field: "ejecutivas", hozAlign: "center" },
                { title: "S. ECONOMICAS", field: "economicas", hozAlign: "center" },
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

        this.#table.on("tableBuilt", () => {
            document.querySelector("#add-users").addEventListener("click", this.#adicionarVuelos)
        })

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
        if (!Helpers.okForm("#form-aviones")) {
            return
        }

        const data = this.#getFormData()

        try {
            // enviar la solicitud de creación con los datos del formulario
            let response = await Helpers.fetchData(`${this.#url}/aviones`, {
                method: "POST",
                body: data,
            })

            if (response.message === "ok") {
                // agregar la fila a la tabla pero antes agregar el atributo matricula que se requiere como columna de la tabla
                let response = await Helpers.fetchData(`${this.#url}/sillas`, {
                    method: "POST",
                    body: {
                        avion: data.matricula,
                        ejecutivas: data.ejecutivas,
                        economicas: data.economicas
                    },
                })


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
            title: "Actualizar un avion",
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


    static #update = async (row) => {
        // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
        if (!Helpers.okForm("#form-aviones")) {
            return
        }

        const data = this.#getFormData()
        console.log(data)

        try {
            // enviar la solicitud de actualización con los datos del formulario
            let response = await Helpers.fetchData(`${this.#url}/aviones/${row.getData().matricula}`, {
                method: "PUT",
                body: {
                    matricula : data.matricula,
                    modelo : data.modelo
                },
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
            title: "Eliminar un vuelo",
            content: `
                Confirme la eliminación del avion:<br>
                Matricula ${cell.getRow().getData().matricula}
                Modelo: ${cell.getRow().getData().modelo}<br>
                Ejecutivas: ${cell.getRow().getData().ejecutivas}  Economicas: ${cell.getRow().getData().economicas}
                <br>
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
        // crear un array de strings key=value y usar join() para luego unir sus elementos con &
        const queryString = row.getData().matricula
        // información importante si se requiere encodeURIComponent
        // https://howchoo.com/javascript/how-to-turn-an-object-into-query-string-parameters-in-javascript#parameter-encoding

        try {
            // enviar la solicitud de eliminación
            let response = await Helpers.fetchData(`${this.#url}/sillas/avion/${queryString}`, {
                method: "DELETE"
            })

            if (response.message === "ok") {
                let response2 = await Helpers.fetchData(`${this.#url}/aviones/${queryString}`, {
                    method: "DELETE"
                })

                alert(response2.message)
                // eliminar la fila de la tabla
                if(response2.message){
                    row.delete()
                    //Helpers.toast({ icon: `${icons.checkSquare}`, message: "Registro eliminado" })
                    this.#modal.dispose()
                }
            } else {
                //Helpers.toast({ icon: `${icons.exclamationTriangle}`, message: "No se pudo eliminar el registro", response })
                console.log(response)
            }
        } catch (e) {
           // Helperstoast({ icon: `${icons.exclamationTriangle}`, message: "Sin acceso a la eliminación de registros", e })
           console.log(e)
        }
    }

    /**
   *
   * @param {Object} Un objeto con los datos de la fila a actualizar o nada si se va a agregar un registro
   * @returns
   */
    static #createForm = ({ modelo = "", matricula = "", ejecutivas = 4, economicas = 6 } = {}) => {
        let listEjecutivas = []
        for (let index = 4; index < 100; index += 4) {
            listEjecutivas.push({ numero: index })
        }

        let listEconomicas = []
        for (let index = 6; index < 250; index += 6) {
            listEconomicas.push({ numero: index })
        }


        const economicasLista = Helpers.toOptionList({
            items: listEconomicas,
            value: 'numero',
            text: 'numero',
            selected: economicas,
        })

        const ejecutivasLista = Helpers.toOptionList({
            items: listEjecutivas,
            value: 'numero',
            text: 'numero',
            selected: ejecutivas,
        })

        // inyectar en el formulario de vuelos los datos del objeto recibido como argumento
        const htmlForm = this.#formAviones.translate(matricula, modelo, ejecutivasLista, economicasLista)
        return htmlForm
    }


    /**
      * Recupera los datos del formulario y crea un objeto para ser retornado
      * @returns Un objeto con los datos del vuelo
      */
    static #getFormData() {
        // ubicar el trayecto con base en el índice del elemento de lista seleccionado
        const matricula = document.querySelector(`#${this.#modal.id} #matricula`).value
        //Duration.fromISO(vuelo.trayecto.duracion).toFormat('hh:mm')

        // ubicar el avión con base en el índice del elemento de lista seleccionado
        const modelo = document.querySelector(`#${this.#modal.id} #modelo`).value
        const ejecutivas = document.querySelector(`#${this.#modal.id} #ejecutivas`).value
        const economicas = document.querySelector(`#${this.#modal.id} #economicas`).value


        return {
            modelo,
            matricula,
            ejecutivas,
            economicas,
        }
    }
}