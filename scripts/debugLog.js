const logContainerEl = document.createElement("div")
const logEl = document.createElement("div")

const closeBtn = document.createElement("button")

export function DebugLog(text) {
    logEl.innerHTML += `<div style="background-color: red; margin-left: 10%;">${text}</div>`
}
export function OnError(name, message, file, fnc) {
    logEl.innerHTML += `<div style="background-color: red; margin-left: 10%;">
            <div>${name}</div>
            <div>${message}</div>
            <div>${file}</div>
            <div>${fnc}</div>
        </div>`
}

export function ShowLog() {
    logContainerEl.style = "padding: 0; margin: 0; position: absolute; z-index: 3; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; overflow: hidden;"
    logEl.style = "margin: 1vw; overflow-y: scroll; height: 80%; border: 1px solid black; display: flex; flex-direction: column; gap: 1vh"
    closeBtn.style = "margin: 10% 50%;"
    closeBtn.innerText = "Закрыть"

    logContainerEl.append(logEl)
    logContainerEl.append(closeBtn)
    document.body.append(logContainerEl)

    closeBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()

        logContainerEl.remove()
    })
}