// version tailwind: https://drive.google.com/drive/folders/1m-RskOpDB1enwETp6sTgksY5BqMhaRHG

export default class Toast {
    static #init(mode) {
        const colors = {
            "bg-blue-500": "blue-500",
            "bg-green-500": "green-500",
            "bg-yellow-400": "yellow-400",
            "bg-red-500": "red-500",
        }

        switch (mode) {
            case "success":
                return {
                    title: "Acción exitosa",
                    colour: colors["bg-green-500"],
                    icon: icons.checkSquare,
                }
            case "warning":
                return {
                    title: "¡Cuidado!",
                    colour: colors["bg-yellow-400"],
                    icon: icons.xSquare,
                }
            case "danger":
                return {
                    title: "Lo siento...",
                    colour: colors["bg-red-500"],
                    icon: icons.exclamationTriangle,
                }
            default:
                return {
                    title: "...",
                    colour: colors["bg-blue-500"],
                    icon: icons.rayCircle,
                }
        }
    }

   

    static info({ message = "", mode = "info", error = "", sleep = 3000 } = {}) {
        const { title, colour, icon } = this.#init(mode)
        const id = `toast-${Math.floor(Math.random() * 99999999999999).toString().padStart(14, "0")}`
        const html = `
        <div id="${id}" class="absolute right-2 top-2 z-[999999999999] mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-gray-800">
            <div class="bg-${colour} flex bg-opacity-98 shadow-inner">
                <div class="bg-${colour} flex w-12 items-center justify-center transition-all duration-1000 ease-in-out">
                    ${icon}
                </div>
                 <div class="-mx-3 рх-4 ру-2">
                    <div class="mx-3">
                        <span class="text-${colour} dark:text-${colour} font-semibold">${title}</span>
                        <p class="text-sm text-gray-600 dark:text-gray-200">${message}</p>
                    </div>
                </div>
             </div>
        </div>
        `
        document.querySelector("body").insertAdjacentHTML("afterbegin", html)

        setTimeout(() => document.querySelector(`#${id}`).remove(), sleep)
        if (error) {
            console.error("Houston, tenemos un problema -> ", error)
        }
    }




}
