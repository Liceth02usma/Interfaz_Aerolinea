// version tailwind: https://drive.google.com/drive/folders/1m-RskOpDB1enwETp6sTgksY5BqMhaRHG

export default class Modal {
    #id
    #modal

    constructor({
        style = "w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12",
        title = "",
        content = "",
        buttons = [], // los botones que se agregan al footer
        callBack = null, // un callBack
    } = {}) {
        // una de las muchas formas de agregar un elemento al DOM con un id único
        // hacer caso omiso a la advertencia del flex/hidden
        this.#id = "modal-" + Math.floor(Math.random() * 99999999999999).toString().padStart(14, "0")
        document.querySelector("body").insertAdjacentHTML(
            "beforeend", `
              <div id="${this.#id}" class="flex fixed inset-0 z-[99999999999] justify-center items-center bg-blue-900 bg-opacity-30 hidden">
                  <div class="relative mx-auto my-6 ${style}">
                      <div class="flex selection:relative flex-col w-full bg-white rounded-lg border-0 shadow-lg outline-none focus:outline-none">
                          <header class="flex justify-between items-start px-5 py-2 rounded-t border-b-2 border-gray-200 border-solid">
                              <h2 id="title-${this.#id}" class="text-xl font-medium text-sky-950"></h2>
                              <button id="close"
                                  class="float-right p-1 ml-auto text-3xl font-semibold leading-none text-gray-300 bg-transparent border-0 outline-none focus:outline-none">
                                  <span class="block w-2 h-0 text-2xl bg-transparent outline-none focus:outline-none">
                                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
                                          <line x1="1" y1="11" x2="11" y2="1" stroke="black" stroke-width="2" />
                                          <line x1="1" y1="1" x2="11" y2="11" stroke="black" stroke-width="2" />
                                      </svg>
                                  </span>
                              </button>
                          </header>
                          <main id="main-${this.#id}" class="overflow-y-auto relative flex-auto p-2 mx-4 my-1 max-h-96"></main>
                          <footer class="bg-gray-200 px-4 pt-2.5 pb-1.5 text-right rounded-b-lg"></footer>
                      </div>
                  </div>
              </div>`
        )
        this.title = title
        this.content = content
        this.buttons = buttons
        this.#modal = document.querySelector(`#${this.#id}`)

        if (typeof callBack === "function") {
            callBack(this.#id)
        }
    }

    get id() {
        return this.#id
    }

    /**
     * Establecer el título del cuadro de diálogo
     * @param {string} _title
     */
    set title(_title) {
        document.querySelector(`#title-${this.#id}`).innerHTML = _title
        return this
    }

    /**
     * Establecer el contenido del cuadro de diálogo
     * @param {string} _content
     */
    set content(_content) {
        document.querySelector(`#main-${this.#id}`).innerHTML = _content
        return this
    }

    /**
     * Agregar botones al pie de página del modal u ocultar el pie de página
     * @param {any[]} _buttons
     */
    set buttons(_buttons) {
        const footer = document.querySelector(`#${this.#id} footer`)
        if (_buttons.length > 0) {
            _buttons.forEach((item) => {
                const html = `<button id="${item.id}" class="${item.style}">${item.html}</button>`
                footer.insertAdjacentHTML("beforeend", html)
                const button = document.querySelector(`#${this.#id} footer #${item.id}`)

                if (button && typeof item.callBack === "function") {
                    button.addEventListener("click", (e) => item.callBack(e))
                }
            })
        } else {
            footer.classList.add("hidden")
        }

        // el botón de cerrar de la parte superior derecha del modal
        document.querySelector(`#${this.#id} header #close`).addEventListener("click", () => this.close())
    }

    show() {
        if (this.#modal) {
            this.#modal.classList.remove("hidden")
        } else {
            console.log("No hay un Modal referenciado por esta variable")
        }
        return this
    }

    close() {
        this.#modal.classList.add("hidden")
        return this
    }

    dispose() {
        this.#modal.parentNode.removeChild(this.#modal)
        this.#modal = null
    }
}
