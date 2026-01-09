import { DebugLog } from "./debugLog.js"
import { Hasher } from "./Hash.js"
import { procedureInitialList } from "./procedureInitialList.js"

export class Data {
    constructor() {
        this.procedures = []

        this.salary = {}
        this._cost = {}

        this.groups = {}
        this.percents = {}
        this._proceduresAlphabet = {}
        this._proceduresAlphabetReverse = {}
        this.procedureNames = []

        this.time = {}
        this.workingMinutes = {}

        this._zipedData = []

        this.hasher = new Hasher()
    }

    importData(data) {
        if (!data && !this.hasher.hash) this.importInitialData()
        else this.loadSavedData(data)
    }

    importInitialData() {
        this._unzipProcedureList(procedureInitialList)
    }

    _unzipProcedureList(list) {
        list.forEach(procedure => {
            if (typeof procedure[0] !== 'string') return

            this.addProcedure(...procedure)
            this._zipedData.push([...procedure])
        })
    }


    loadSavedData(data) {

        try {

            let savedData = this.hasher.hash ?
                this.hasher.parseHash() : JSON.parse(data)

            if (!savedData.initialProcedureList) {

                this.salary = { ...savedData.salary }
                this.procedures = [...savedData.procedures]
                this.workingMinutes = { ...savedData.workingMinutes }

                if (savedData.procedureList) this._zipedData = [...savedData.procedureList]
                else this._zipedData = [...procedureInitialList]

                this.save()
                savedData = JSON.parse(localStorage.data)
            }

            for (let i = 0; i < procedureInitialList.length; i++) {

                let ind = this._findMathing(procedureInitialList[i][0], savedData.initialProcedureList)

                if (ind < 0) {
                    savedData.initialProcedureList.push(procedureInitialList[i])
                    savedData.procedureList.push(procedureInitialList[i])
                    continue;
                }

                if (procedureInitialList[0][0]) {
                    savedData.procedureList[ind - 1] = [...procedureInitialList[i]]
                    savedData.initialProcedureList[ind] = [...procedureInitialList[i]]

                    continue
                }

                for (let j = 1; j < procedureInitialList[i].length; j++) {
                    if (!savedData.initialProcedureList[ind][j] || savedData.initialProcedureList[ind][j] !== procedureInitialList[i][j]) {
                        savedData.procedureList[ind][j] = procedureInitialList[i][j]
                        savedData.initialProcedureList[ind][j] = procedureInitialList[i][j]
                    }
                }
            }

            this._unzipProcedureList(savedData.procedureList)

            this.procedures = [...savedData.procedures]
            this.salary = { ...savedData.salary }
            this.workingMinutes = { ...savedData.workingMinutes }

            this.modifySalaryFor_01_09_2026_Update()

            this.save()

        } catch (error) {
            DebugLog(error)
        }
    }

    _findMathing(id, list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] == id) return i
        }
        return -1
    }

    addProcedure(id, name, groupName, cost, percent, time) {

        if (this._proceduresAlphabet.hasOwnProperty(id)) return 0

        this._proceduresAlphabet[id] = name
        this._proceduresAlphabetReverse[name] = id
        this.groups[id] = groupName
        this.procedureNames.push(id)
        this.time[id] = time


        if (cost) {
            this._cost[id] = cost
            this.percents[id] = percent
        }

        return 1
    }

    _modifyUnencoded() {

    }

    changeCostsAndPercents(tempCosts, tempPercents) {
        for (let i = 0; i < this._zipedData.length; i++) {
            this._cost[this._zipedData[i][0]] = tempCosts[this._zipedData[i][0]]
            this.percents[this._zipedData[i][0]] = tempPercents[this._zipedData[i][0]]

            this._zipedData[i][3] = tempCosts[this._zipedData[i][0]]
            this._zipedData[i][4] = tempPercents[this._zipedData[i][0]]
        }
    }

    save() {
        let data = { salary: this.salary, workingMinutes: this.workingMinutes, procedures: this.procedures, procedureList: this._zipedData, initialProcedureList: procedureInitialList }
        data = JSON.stringify(data)

        localStorage.clear()
        localStorage.setItem("data", data)
    }

    createPort() {
        let data = { salary: this.salary, procedures: this.procedures, procedureList: this._zipedData }
        data = JSON.stringify(data)

        return "https://orkasst.github.io/salaryCounter/#" + this.hasher.toHash(data)
    }


    modifySalaryFor_01_09_2026_Update() {
        throw new Error("kugsdvdsvksdbvk")
        for (let checkName in this.salary) {
            if (this.salary.hasOwnProperty(checkName)) {// && this.salary[checkName].length == 2) {
                this.salary = {}
                for (let i = 0; i < this.procedures.length; i++) {
                    if (!this.salary[this.procedures[i][0].month]) {
                        this.salary[this.procedures[i][0].month] = [...new Array(32)].fill(0)
                    }

                    let salary = parseFloat(this.procedures[i][1].split("_")[3])
                    this.salary[this.procedures[i][0].month][this.procedures[i][0].day] += salary
                }
            }
            break
        }
    }
}   