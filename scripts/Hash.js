export class Hasher {
    constructor() {
        window.addEventListener("hashchange", (e) => {
            console.log(this.readHash())
        })

        this.hash = this.readHash()
        window.location.hash = ''
    }

    toHash(input) {
        let hex = ''
        for (let i = 0; i < input.length; i++) {
            hex += input.codePointAt(i).toString(16) + (i == input.length - 1 ? "" : "-")
        }

        return hex
    }

    readHash() {
        return window.location.hash.substring(1)
    }

    parseHash() {
        let parsed = ''
        let hash = this.hash.split("-")

        for (let i = 0; i < hash.length; i++) {
            parsed += String.fromCharCode(parseInt(hash[i], 16).toString(10))
        }

        return JSON.parse(parsed)
    }
}