export class Hasher {
    constructor() {
        // console.log(this.readHash());
        window.addEventListener("hashchange", (e) => {
            console.log(this.readHash())
        })
    }

    toHash(input) {
        let hash = input.map(el => el.join("$$")).join("%%")

        let code = ''
        for (let i = 0; i < hash.length; i++) {
            let part = hash.charCodeAt(i).toString(2)
            code += "0".repeat(16 - part.length) + part
            // console.log("BIN code part", "0".repeat(16 - part.length) + part);
        }
        // console.log(code.length);

        let hex = ''
        for (let i = 0; i < code.length; i += 16) {
            // let part = parseInt(code.substring(i, i + 16), 2).toString(16)
            let part = hash.charCodeAt(i).toString(16)
            hex += "0".repeat(4 - part.length) + part
            // console.log("HEX code part", "0".repeat(4 - part.length) + part);
        }
        console.log(hex.length);

        // this.parseHash(hex)
    }

    readHash() {
        return window.location.hash.substring(1)
    }

    parseHash(hash) {
        let parsed = ''

        let bin = ''
        for (let i = 0; i < hash.length; i += 4) {
            let part = parseInt(hash.substring(i, i + 4), 16).toString(2)
            bin += "0".repeat(16 - part.length) + part
        }

        // console.log(hash);
        console.log("Parsed bin: ", bin.length);
    }
}