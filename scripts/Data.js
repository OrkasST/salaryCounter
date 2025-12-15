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

        this._zipedData = []

        this.hasher = new Hasher()
    }

    importData(data) {
        if (!data) this.importInitialData()
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
        let savedData = JSON.parse( data )
        console.log('savedData: ', savedData);

        if (!savedData.initialProcedureList) {
            this._salary = {...savedData.salary}
            this.procedures = {...savedData.procedures}
            this._zipedData = [...procedureInitialList]

            this.save()
        }

        for (let i = 0; i < savedData.initialProcedureList.length; i++) {

            let initialProcedure = procedureInitialList.filter(el => el[0] == savedData.initialProcedureList[i][0])[0]

            for (let j = 1; j < savedData.initialProcedureList[i].length; j++) {
                if (savedData.initialProcedureList[i][j] !== initialProcedure[j])
                {
                    console.log('savedData.initialProcedureList[i][j]: ', savedData.initialProcedureList[i][j]);
                    savedData.procedureList[i][j] = initialProcedure[j] 
                    savedData.initialProcedureList[i][j] = initialProcedure[j]
                    console.log('savedData.initialProcedureList[i][j]: ', savedData.initialProcedureList[i][j]);
                }
            }
        }

        this._unzipProcedureList(savedData.procedureList)

        this.procedures = [...savedData.procedures]
        this.salary = {...savedData.salary}

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

    _modifyUnencoded() {

    }

    changeCostsAndPercents(tempCosts, tempPercents) {
        for (let i = 0; i < this._zipedData.length; i++) {
            this._cost[this._zipedData[i][0]] = tempCosts[this._zipedData[i][0]]
            this.percents[this._zipedData[i][0]] = tempPercents[this._zipedData[i][0]]

            this._zipedData[i][3] = tempCosts[this._zipedData[i][0]]
            this._zipedData[i][4] = tempPercents[this._zipedData[i][0]]
            console.log('tempPercents[this._zipedData[i][0]]: ', tempPercents[this._zipedData[i][0]]);
        }
    }

    save() {
        let data = {salary: this.salary, procedures: this.procedures, procedureList: this._zipedData, initialProcedureList: procedureInitialList}
        data = JSON.stringify(data)

        localStorage.clear()
        localStorage.setItem("data", data)
    }
}