export class LinkPopupHandler {
    constructor(copyBtnCallback) {
        this.container = document.getElementById("linkCopyPopup")
        this.copyBtn = document.getElementById("copyTextBtn")
        this.closeBtn = document.getElementById("closePopupBtn")

        this.link = document.getElementById("link")

        this.copyBtn.addEventListener("click", () => {
            link.select();
            link.setSelectionRange(0, 99999);

            navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    navigator.clipboard.writeText(this.link.value).then(() => alert("Ссылка скопирована"))
                }
            });
        })
        this.closeBtn.addEventListener("click", () => {
            this.link.value = ""
            this.hide()
        })
    }

    changeText(text) {
        this.link.value = text
    }
    show() {
        this.container.classList.remove("disabled")
    }
    hide() {
        this.container.classList.add("disabled")
    }
}