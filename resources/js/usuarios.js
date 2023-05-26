

export default class Usuarios {
    static #url = localStorage.getItem("url")
    static #table
    static #modal
    static #formUsuarios
    static #tipoUsuario


    constructor() {
        throw new Error("Esta clase no permite el uso del constructor. Utilice Usuarios.init()")
    }

    static async init() {

        this.#formUsuarios = await Helpers.loadPage("./resources/html/form-usuarios.html")

        this.#tipoUsuario = {
            data: [
                {
                    tipo: "PASAJERO"
                },
                {
                    tipo: "AUXILIAR"
                },
                {
                    tipo: "ADMINISTRADOR"
                }
            ]
        }

        this.#tipoUsuario.data.forEach((t) => { t.toString = `${(t.tipo).toLowerCase()}` })

        console.log(this.#tipoUsuario)



        // https://tabulator.info/docs/5.4/quickstart
        let response = await Helpers.fetchData(`${localStorage.getItem('url')}/usuarios/todos`)
        document.querySelector('main').innerHTML = `
        <div id="container-filter" class="relative ml-[25%] translate-y-[180px] mb:translate-y-[90px]">
        <select id="filter-field" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">
          <option></option>
          <option value="identificacion">ID</option>
          <option value="nombres">Nombres</option>
          <option value="apellidos">Apellidos</option>
          <option value="perfil">Perfil</option>
          <option value="n&a">Nombre y Apellido</option>
        </select>
      
        <select id="filter-type" class="text-gray-700 font-bold mb-2 w-[15%] rounded py-2 px-3 shadow appearance-none border">>
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
      <div id="usuarios-table" class="relative mt-[20%]  m-2"></div>
      </div></br></br></br></br></br></br></br></br>
        `
        let filtroCabecera = document.querySelector("#filter-field");
        let tipoFiltro = document.querySelector("#filter-type");
        let valorFiltro = document.querySelector("#filter-value");

        function actualizarFiltro() {
            let valorFiltro2 = filtroCabecera.value
            let valorTipo = tipoFiltro.value
            let valor = valorFiltro.value

            if (valorFiltro2 === "n&a") {
                let nombreApellido = valor.split(" ")
                if (nombreApellido.length <= 4) {
                    let nombre
                    let apellido
                    if (nombreApellido.length == 3) {
                        nombre = `${nombreApellido[0]}`
                        apellido = `${nombreApellido[1]} ${nombreApellido[2]}`
                    }
                    if (nombreApellido.length == 4) {
                        nombre = `${nombreApellido[0]} ${nombreApellido[1]}`
                        apellido = `${nombreApellido[2]} ${nombreApellido[3]}`
                    }
                    if (nombreApellido.length == 2) {
                        nombre = `${nombreApellido[0]}`
                        apellido = `${nombreApellido[1]}`
                    }
                    this.#table.setFilter([
                        { field: "nombres", type: valorTipo, value: nombre },
                        { field: "apellidos", type: valorTipo, value: apellido }
                    ])
                }
            } else {
                table.setFilter(valorFiltro2, valorTipo, valor);
            }

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
        let table = new Tabulator("#usuarios-table", {
            height: "86,5vh", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: response.data, //assign data to table
            layout: "fitColumns", //fit columns to width of table (optional)
            columns: [ //Define Table Columns
                { title: "ID", field: "identificacion", width: 150 },
                { title: "NOMBRES", field: "nombres", hozAlign: "left" },
                { title: "APELLIDOS", field: "apellidos" },
                { title: "PERFIL", field: "perfil", hozAlign: "left" },
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
        if (!Helpers.okForm("#form-usuarios")) {
            return
        }

        const data = this.#getFormData()
        console.log(data)
        try {
            // enviar la solicitud de creación con los datos del formulario
            let response = await Helpers.fetchData(`${this.#url}/usuarios`, {
                method: "POST",
                body: data,
            })

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
            title: "Actualizar un vuelo",
            // se pasan los datos de la fila al formulario
            content: this.#createForm(cell.getRow().getData()),
            buttons: [
                {
                    id: "add-usuario",
                    style: "btn-teal",
                    html: `<span>Actualizar</span>`,
                    callBack: () => this.#update(cell.getRow()),
                },
                {
                    id: "cancel-add-usuario",
                    style: "btn-red",
                    html: `<span>Cancelar</span>`,
                    callBack: () => this.#modal.dispose(),
                },
            ],
        })).show()
    }


    static #update = async (row) => {
        // verificar si los datos cumplen con las restricciones indicadas en el formulario HTML
        if (!Helpers.okForm("#form-usuarios")) {
            return
        }

        const data = this.#getFormData()

        try {
            // enviar la solicitud de actualización con los datos del formulario
            let response = await Helpers.fetchData(`${this.#url}/usuarios/${row.getData.identificacion}`, {
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

    /**
     *
     * @param {Object} Un objeto con los datos de la fila a actualizar o nada si se va a agregar un registro
     * @returns
     */
    static #createForm = ({ nombres = "", identificacion = "", apellidos = "", perfil = "", contraseña = "" } = {}) => {
        // crear la lista de opciones para el select de trayectos

        // crear la lista de opciones para el select de aviones
        const perfiles = Helpers.toOptionList({
            items: this.#tipoUsuario.data,
            value: "tipo",
            text: "toString",
            selected: perfil.toLowerCase(),
        })

        console.log(perfiles)



        // inyectar en el formulario de vuelos los datos del objeto recibido como argumento
        const htmlForm = this.#formUsuarios.translate(identificacion, nombres, apellidos, contraseña, perfiles)
        return htmlForm
    }


    static #deleteRowButton = (cell, formatterParams, onRendered) => `
        <button class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Eliminar">
        ${icons.eliminar}
        </button>
    `
    static #deleteRowClick = (e, cell) => {
        (this.#modal = new Modal({
            title: "Eliminar un usurio",
            content: `
                Confirme la eliminación del usuario:<br>
                ${cell.getRow().getData().nombres}  ${cell.getRow().getData().apellidos}<br>
                Perfil: ${cell.getRow().getData().perfil}<br>
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
        const data = row.getData()
        // la tabla tiene el atributo matrícula pero la petición requiere el atributo avión

        // crear un array de strings key=value y usar join() para luego unir sus elementos con &
        //const queryString = Object.keys(data).map((key) => `${key}=${data[key]}`).join("&")

        try {
            // enviar la solicitud de eliminación
            let response = await Helpers.fetchData(`${this.#url}/vuelos/${data.identificacion}`, {
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
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del vuelo
   */
    static #getFormData() {
        const identificacion = document.querySelector(`#${this.#modal.id} #id`).value
        const nombres = document.querySelector(`#${this.#modal.id} #nombres`).value
        const contraseña = document.querySelector(`#${this.#modal.id} #contraseña`).value
        const iPerfil = document.querySelector(`#${this.#modal.id} #perfil`).selectedIndex
        const perfil = this.#tipoUsuario.data[iPerfil].tipo
        const apellidos = document.querySelector(`#${this.#modal.id} #apellidos`).value

        return {
            identificacion,
            nombres,
            apellidos,
            perfil,
            password: contraseña
        }
    }
}