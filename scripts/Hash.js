export class Hasher {
    constructor() {}

    toHash(input) {
        let hash = procedureInitialList.map(el => el.join("$$")).join("%%")

    let dec = ''
    for (let i = 0; i<hash.length; i++) {
        dec += hash.charCodeAt(i)
    }

    let code = ''
    for (let i = 0; i<hash.length; i++) {
        code += hash.charCodeAt(i).toString(2)
    }

    let hex = ''
    for (let i = 0; i < code.length; i+=8) {
        hex += parseInt(code.substring(i, i+8), 2).toString(16)
    }
    console.log(dec.length)
    console.log(code.length)
    console.log(hex.length)
    console.log(hash.length)

    console.log("Logical operators")
    console.log(2 & 1)
    }
}