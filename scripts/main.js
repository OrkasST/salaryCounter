document.addEventListener("DOMContentLoaded", () => {
    const app = new App()
    app.init()
})

class App {
    constructor() {
        //html elements
        this.addProcedureBtn = document.getElementById("addProcedure")
        this.procedureAcceptBtn = document.getElementById("finishAdding")

        this.changeCostBtn = document.getElementById("changeCost")
        this.finishEditingBtn = document.getElementById("finishEditing")
        this.cancelEditingBtn = document.getElementById("cancelEditing")

        this.procedureForm = document.getElementById("addingProcedureForm")
        this.procedureList = document.getElementById("procedure")

        this.changeForm = document.getElementById("changeForm")
        this.costFields = document.getElementById("costFields")

        this.fulfilledProcedures = document.getElementById("fulfilled")
        this.calendar = document.getElementById("calendar")
        this.monthUI = document.getElementById("month")
        this.slaryPeriod = document.getElementById("slaryPeriod")
        this.slaryPeriodCount = document.getElementById("slaryPeriodCount")
        this.filter = document.getElementById("filter")
        this.countFilter = document.getElementById("countFilter")

        this.salaryCounterUI = document.getElementById("slaryCount")
        this.procedureCounterUI = document.getElementById("proceduresCount")

        //data
        this.data = {
            procedures: [],
            salary: {},
            _cost: {
                "spa30": 80,
                "spa60": 150,
                "spa90": 200,

                "stone60":90,
                "stone90": 120,

                "relax60": 80,
                "relax90": 100,

                "full": 230,

                "percent": 0.35
            },
            _proceduresAlphabet: {
                "spa30": "СПА 30",
                "spa60": "СПА 60",
                "spa90": "СПА 90",

                "stone60": "Стоун 60",
                "stone90": "Стоун 90",

                "relax60": "Релакс 60",
                "relax90": "Релакс 90",

                "full": "Полный (Стоун 60 + СПА 60)"
            }
        }

        this.today = {
            year: null,
            month: null,
            day: null,
            date: null
        }

        this.procedureCount = 0
    }

    init() {
        let date = new Date()
        this.today.year = date.getFullYear()
        this.today.month = date.getMonth() + 1
        this.today.day = date.getDate()
        this.today.date = date.toISOString().substring(0, 10) 

        this.calendar.value = this.today.date

        if (localStorage.data) {
            let data = JSON.parse( localStorage.data );
            this.data = {...data}
            this.showFulfilled()
        }
        
        this.updateMonthUI()
        this.updateProcedureCountUI()
        this.updateSalaryUI(this.today.month)
        this.updatePeriod()
        this.updateCountFilter()

        this.addProcedureBtn.addEventListener("click", this.addProcedureStart.bind(this))
        this.procedureAcceptBtn.addEventListener("click", this.addProcedureFinish.bind(this))

        this.changeCostBtn.addEventListener("click", this.startCostEditing.bind(this))
        this.finishEditingBtn.addEventListener("click", this.finishCostEditing.bind(this))
        this.cancelEditingBtn.addEventListener("click", this.cancelCostEditing.bind(this))
        
        this.calendar.addEventListener("input", this.updateDate.bind(this))
        this.filter.addEventListener("input", this.onFilterUpdate.bind(this))
    }

    updateProcedureCountUI() {
        this.procedureCounterUI.innerText = this.data.procedures.length
    }
    updateSalaryUI(month) {
        this.salaryCounterUI.innerText = this.data.salary[month] ? this.data.salary[month][0] + this.data.salary[month][1] : "0"
        this.updateSalaryPeriodUI()
    }
    updateDate() {
        let date = this.calendar.value
        let parcedDate = this.calendar.value.split("-").map(el => parseInt(el, 10))

        this.today.date = date
        this.today.day = parcedDate[2]
        this.today.month = parcedDate[1]
        this.today.year = parcedDate[0]

        this.showFulfilled()
        this.updatePeriod()
        this.updateSalaryUI(this.today.month)
        this.updateMonthUI()
    }
    updatePeriod() {
        this.slaryPeriod.innerText = this.today.day > 15 ? "16-31" : "1-15"
    }
    onFilterUpdate() {
        this.showFulfilled()
        this.updateCountFilter()
    }
    updateMonthUI() {
        this.monthUI.innerText = this.today.month < 10 ? "0" + this.today.month : this.today.month
    }
    updateCountFilter() {
        countFilter.innerText = this.filter.value !== "все время" ? "текущий " + this.filter.value : this.filter.value
    }

    addProcedureStart() {
        this.procedureForm.classList.remove("disabled")
    }
    addProcedureFinish() {
        this.addProcedure(this.procedureList.value)
        this.procedureForm.classList.add("disabled")

        this.save()

        this.updateProcedureCountUI()
        this.updateSalaryUI(this.today.month)

        this.writeProcedure(this.data.procedures[this.data.procedures.length-1], this.data.procedures.length-1)
    }

    addProcedure(procedure) {
        let log = ''
        let date = {
            year: this.today.year,
            month: this.today.month,
            day: this.today.day,
            full: this.today.date
        }

        log += this.data._proceduresAlphabet[procedure] + "_"
        log += this.data._cost[procedure] + "_"
        log += this.data._cost["percent"]*100 + "_"
        log += this.countCost(procedure)
        
        this.data.procedures.push([date, log])

        this.addSalary(procedure)
    }

    addSalary(procedure, date = null, ammount = null) {
        let period
        if (!date) period = this.today.day > 15 ? 1 : 0
        else period = date.day > 15 ? 1 : 0

        if (!this.data.salary.hasOwnProperty(this.today.month)) {
            this.data.salary[this.today.month] = [0, 0]
        }
        this.data.salary[date?.month || this.today.month][period] += ammount || this.countCost(procedure)
    }
    
    countCost(procedure) {
        return parseInt((this.data._cost[procedure]*this.data._cost["percent"]).toFixed(2), 10)
    }

    parseLog(log) {
        let parcedLog = log[1].split("_")

        return {
            procedure: parcedLog[0],
            cost: parcedLog[1],
            percent: parcedLog[2],
            income: parseInt(parcedLog[3], 10),
        }
    }

    writeProcedure(log, logInd) {
        this.fulfilledProcedures.append(this.createProcedureField(log[0], this.parseLog(log), logInd))
    }

    createProcedureField(date, parsedLog, logInd) {
        let removeBtn = document.createElement("button")
        removeBtn.addEventListener("click", () => this.removeFulfilledProcedure(logInd))
        removeBtn.innerText = "Удалить"
        let procedureLogField = document.createElement("div")
        procedureLogField.innerHTML = `<hr>
            <div id="date">${date.full}</div>
            <div id="procedure">Процедура: ${parsedLog.procedure}</div>
            <div id="cost">Стоимость: ${parsedLog.cost} BYN</div>
            <div id="percent">Процент: ${parsedLog.percent}%</div>
            <div id="income">Доход: ${parsedLog.income} BYN</div>`
        procedureLogField.appendChild(removeBtn)

        return procedureLogField
    }

    removeFulfilledProcedure(ind) {
        let log = this.data.procedures.splice(ind,1)[0]
        this.save()
        this.showFulfilled()
        let parsedLog = this.parseLog(log)
        this.addSalary('', log[0], -parsedLog.income)
        this.updateSalaryUI(log[0].month)
    }

    updateSalaryPeriodUI() {
        let period = this.today.day > 15 ? 1 : 0
        if (this.data.salary[this.today.month]) this.slaryPeriodCount.innerText = this.data.salary[this.today.month][period]
        else this.slaryPeriodCount.innerText = "0"
    }

    showFulfilled() {
        this.fulfilledProcedures.innerHTML = ''
        for (let i = 0; i < this.data.procedures.length; i++) {
            if (this.applyFilter(this.data.procedures[i][0])) {
                this.writeProcedure(this.data.procedures[i], i)
                this.procedureCount++
            }
        }
    }

    applyFilter(logDate) {
        let out = true
        switch (this.filter.value) {
            case "день":
                out = logDate.day === this.today.day
                if (!out) break
            case "период":
                out = this.today.day > 15 ? logDate.day > 15 : logDate.day < 15
                if (!out) break
            case "месяц":
                out = logDate.month === this.today.month
                if (!out) break
            case "год":
                out = logDate.year === this.today.year
                break
            default:
                break
        }
        return out
    }
    
    save() {
        let data = this.data
        data = JSON.stringify(data)

        localStorage.clear()
        localStorage.setItem("data", data)
    }

    startCostEditing() {
        this.addProcedureBtn.disabled = true
        this.changeCostBtn.disabled = true
        this.procedureForm.classList.add("disabled")

        this._tempCosts = {}

        for (let i in this.data._cost) {
            if (this.data._cost.hasOwnProperty(i)) {
                let div = document.createElement("div")
                let label = document.createElement("label")
                let field = document.createElement("input")
                field.type = "text"
                field.id = i
                field.value = this.data._cost[i]
                field.addEventListener("input", () => { this._tempCosts[i] = field.value })
                label.innerText = (this.data._proceduresAlphabet[i] || "Процент") + ": "
                label.for = i

                this._tempCosts[i] = this.data._cost[i]

                div.append(label, field)
                this.costFields.append(div)
            }
        }
        this.changeForm.classList.remove("disabled")
    }
    finishCostEditing() {
        for (let i in this.data._cost) {
            if (this.data._cost.hasOwnProperty(i)) {
                this.data._cost[i] = this._tempCosts[i]
            }
        }
        this.save()
        this.closeEditingForm()
    }
    cancelCostEditing() {
        this._tempCosts = {}
        this.closeEditingForm()
    }
    closeEditingForm() {
        this.costFields.innerHTML = ''
        this.changeForm.classList.add("disabled")
        this.addProcedureBtn.disabled = false
        this.changeCostBtn.disabled = false
    }
}