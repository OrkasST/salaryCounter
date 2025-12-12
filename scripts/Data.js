import { procedureInitialList } from "./procedureInitialList.js"

export class Data {
    constructor() {
        this.procedures = []
        this.salary = {}
        this._cost = {
            // "spa30": 80,
            // "spa60": 150,
            // "spa90": 200,

            // "stone60": 90,
            // "stone90": 120,

            // "relax60": 80,
            // "relax90": 100,

            // "full": 230,

            // "percent": 0.35
        }
        this.groups = {
            // "spa30": "== СПА ==",
            // "spa60": "== СПА ==",
            // "spa90": "== СПА ==",

            // "stone60": "== Стоун ==",
            // "stone90": "== Стоун ==",

            // "relax60": "== Релакс ==",
            // "relax90": "== Релакс ==",

            // "full": "== Иные =="
        }

        this.percents = {}

        this._proceduresAlphabet = {
            // "spa30": "СПА 30",
            // "spa60": "СПА 60",
            // "spa90": "СПА 90",

            // "stone60": "Стоун 60",
            // "stone90": "Стоун 90",

            // "relax60": "Релакс 60",
            // "relax90": "Релакс 90",

            // "full": "Полный (Стоун 60 + СПА 60)"
        }
        this._proceduresAlphabetReverse = {
            // "СПА 30": "spa30",
            // "СПА 60": "spa60",
            // "СПА 90": "spa90",

            // "Стоун 60": "stone60",
            // "Стоун 90": "stone90",

            // "Релакс 60": "relax60",
            // "Релакс 90": "relax90",

            // "Полный (Стоун 60 + СПА 60)": "full"
        }
        this.procedureNames = [
            // "spa30","spa60","spa90","stone60","stone90","relax60","relax90","full"
        ]
    }

    importInitialData() {
        procedureInitialList.forEach(procedure => {
            this.addProcedure(procedure[0], procedure[1], procedure[2], procedure[3], procedure[4])
        })
        console.log(this);
    }

    importData() {
        let savedData = JSON.parse( localStorage.data );

        if (!savedData._proceduresAlphabet.hasOwnProperty(savedData.procedures[0][1].split("_")[0])) {
            for (let i = 0; i < savedData.procedures.length; i++) {
                let log = savedData.procedures[i][1].split("_")
                log[0] = this._proceduresAlphabetReverse[log[0]]
                savedData.procedures[i][1] = log.join("_")
            }
        }

        this.procedures = [...savedData.procedures]
        this.salary = {...this.salary, ...savedData.salary}
        this._cost = {...this._cost, ...savedData._cost}
        this._proceduresAlphabet = {...this._proceduresAlphabet, ...savedData._proceduresAlphabet}
        this._proceduresAlphabetReverse = {...this._proceduresAlphabetReverse, ...savedData._proceduresAlphabetReverse}

        console.log(this);
    }

    addProcedure(id, name, groupName, cost, percent) {
        if (this._proceduresAlphabet.hasOwnProperty(id)) return 0
        this._proceduresAlphabet[id] = name
        this._proceduresAlphabetReverse[name] = id
        this.groups[id] = groupName
        this.procedureNames.push(id)
        if (cost) {
            this._cost[id] = cost
            this.percents[id] = percent
        }
        return 1
    }
}