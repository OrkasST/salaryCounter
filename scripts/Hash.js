export class Hasher {
    constructor() {
        this.lib = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        console.log('this.lib: ', this.lib.length);
        window.addEventListener("hashchange", (e) => {
            console.log(this.readHash())
        })

        this.hash = this.readHash()
        console.log('this.hash: ', this.hash);
        window.location.hash = ''

        // let n = this._numberToCode()
        // console.log(n)
        console.log(this._codeToNumber("ZZZ"))
    }

    toHash(input) {
        let code = ""

        for (let i = 0; i < input.length; i++) {
            let part = input.charCodeAt(i)
            part = this._numberToCode(part)
            if (part.length < 3 && i > 0) part = "-" + part
            code += part
        }
        console.log(code.length);
        console.log(this.parseHash(code));
        return code
    }

    readHash() {
        return window.location.hash.substring(1)
    }

    parseHash(code) {
        let parsed = ""
        let hash = code

        let tempNum = ""
        for (let i = 0; i <= hash.length; i++) {
            if (hash[i] == "-" || tempNum.length == 3 || i == hash.length) {
                parsed += String.fromCharCode(this._codeToNumber(tempNum))
                tempNum = ""
            }
            else tempNum += hash[i]
        }
        console.log(parsed.length);
        console.log("~~~~~~~~");
        return JSON.parse(parsed)
    }

    _numberToCode(number) {
        let res = ''
        let x = number

        while (x > 0) {
            let temp = x
            x = Math.floor(x / this.lib.length)
            res = this.lib[temp % this.lib.length] + res
        }

        return res
    }

    _codeToNumber(code) {
        if (code.length == 1) return this.lib.indexOf(code)

        let r = this.lib.indexOf(code[0]) * Math.pow(this.lib.length, code.length-1) + this._codeToNumber(code.substring(1))
        return r
    }

    compare(str1, str2) {
        for (let i = 0; i < str1.length; i++) {
            if (str1[i] != str2[i]) console.log(`(${i}) str1: ${str1[i]} | str2: ${str2[i]}`)
        }
    }
}