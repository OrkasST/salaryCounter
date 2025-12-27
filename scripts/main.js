import { Data } from "./Data.js"
import { LinkPopupHandler } from "./LinkPopupHandler.js"
import { ProcedureCreator } from "./ProcedureCreator.js"

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
        this.clearMemoryBtn = document.getElementById("clearMemory")

        this.defaultProcentChangeBtn = document.getElementById("default")
        this.fullProcentChangeBtn = document.getElementById("fullChange")

        this.procedureForm = document.getElementById("addingProcedureForm")
        this.procedureList = document.getElementById("procedure")
        this.isCourceCheckbox = document.getElementById("isCource")

        this.changeForm = document.getElementById("changeForm")
        this.costFields = document.getElementById("costFields")

        this.fulfilledProcedures = document.getElementById("fulfilled")
        this.calendar = document.getElementById("calendar")
        this.monthUI = document.getElementById("month")

        this.slaryPeriod = document.getElementById("slaryPeriod")
        this.timePeriod = document.getElementById("timePeriod")

        this.slaryPeriodCount = document.getElementById("slaryPeriodCount")
        this.timePeriodCountHour = document.getElementById("timePeriodCountHour")
        this.timePeriodCountMinute = document.getElementById("timePeriodCountMinute")

        this.filter = document.getElementById("filter")
        this.countFilter = document.getElementById("countFilter")

        this.popup = document.getElementById("popup")

        this.salaryCounterUI = document.getElementById("slaryCount")
        this.procedureCounterUI = document.getElementById("proceduresCount")

        this.createPortBtn = document.getElementById("createPortBtn")

        //data
        this.data = new Data()

        this.today = {
            year: null,
            month: null,
            day: null,
            date: null
        }

        this.procedureCount = 0

        //utils
        this.procedureCreator = new ProcedureCreator(this.procedureList)
        this.linkPopupHandler = new LinkPopupHandler(() => this.data.createPort())
    }

    init() {
        let date = new Date()
        this.today.year = date.getFullYear()
        this.today.month = date.getMonth() + 1
        this.today.day = date.getDate()
        this.today.date = date.toISOString().substring(0, 10) 

        this.calendar.value = this.today.date

        this.data.importData(localStorage.data)
        this.showFulfilled()
        
        
        this.procedureCreator.addSomeProcedures(
            this.data.procedureNames,
            this.data._proceduresAlphabet,
            this.data.groups,
            this.data.addProcedure.bind(this.data)
        )

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

        this.defaultProcentChangeBtn.addEventListener("click", this.closePopUp.bind(this))
        this.fullProcentChangeBtn.addEventListener("click", () => {
            this.isPercentageUpdating = true
            this.closePopUp.apply(this)
        })
        
        this.calendar.addEventListener("input", this.updateDate.bind(this))
        this.filter.addEventListener("input", this.onFilterUpdate.bind(this))

        this.createPortBtn.addEventListener("click", () => {
            this.linkPopupHandler.changeText(this.data.createPort.apply(this.data))
            this.linkPopupHandler.show()
        })
    }

    updateProcedureCountUI() {
        this.procedureCounterUI.innerText = this.procedureCount
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
        this.updateProcedureCountUI()
    }
    updatePeriod() {
        this.slaryPeriod.innerText = this.today.day > 15 ? "16-31" : "1-15"
        this.timePeriod.innerText = this.today.day > 15 ? "16-31" : "1-15"
    }
    onFilterUpdate() {
        this.showFulfilled()
        this.updateCountFilter()
        this.updateProcedureCountUI()
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

        this.data.save()

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

        log += procedure + "_"
        log += (this.isCourceCheckbox.checked ? (this.data._cost[procedure] * 0.9).toFixed(2) : this.data._cost[procedure]) + "_"
        log += this.data.percents[procedure]*100 + "_"
        log += this.countCost(procedure)
        
        this.data.procedures.push([date, log])

        this.procedureCount++
        this.updateProcedureCountUI()

        this.addSalary(procedure)
    }

    addSalary(procedure, date = null, ammount = null) {
        let period
        if (!date) period = this.today.day > 15 ? 1 : 0
        else period = date.day > 15 ? 1 : 0

        if (!this.data.salary.hasOwnProperty(this.today.month) || (date && !this.data.salary.hasOwnProperty(date.month))) {
            if (date) {
                this.data.salary[date.month] = [0, 0]
                this.data.workingMinutes[date.month] = [0, 0]
            } else {
                this.data.salary[this.today.month] = [0, 0]
                this.data.workingMinutes[this.today.month] = [0, 0]
            }
        }
        this.data.salary[date?.month || this.today.month][period] += ammount || this.countCost(procedure)
        this.data.workingMinutes[date?.month || this.today.month][period] += (ammount ? -1 : 1) * this.data.time[procedure]
    }
    
    countCost(procedure) {
        let g = Math.round(this.data._cost[procedure] * (this.isCourceCheckbox.checked ? 0.9 : 1) * this.data.percents[procedure])
        return g
    }

    parseLog(log) {
        let parcedLog = log[1].split("_")

        return {
            procedure: parcedLog[0],
            cost: parcedLog[1],
            percent: parcedLog[2],
            income: Math.round(parcedLog[3]),
        }
    }

    writeProcedure(log, logInd) {
        this.fulfilledProcedures.append(this.createProcedureField(log[0], this.parseLog(log), logInd))
    }

    createProcedureField(date, parsedLog, logInd) {
        let removeBtn = document.createElement("button")
        removeBtn.innerText = "Удалить"

        let proveBtn = document.createElement("button")
        proveBtn.classList.add("disabled")
        proveBtn.innerText = "Подтвердить"

        let cancelBtn = document.createElement("button")
        cancelBtn.classList.add("disabled")
        cancelBtn.innerText = "Отменить"

        removeBtn.addEventListener("click", () => {
            removeBtn.disabled = true
            proveBtn.classList.remove("disabled")
            cancelBtn.classList.remove("disabled")
        })
        proveBtn.addEventListener("click", () => this.removeFulfilledProcedure(logInd))
        cancelBtn.addEventListener("click", () => {
            removeBtn.disabled = false
            proveBtn.classList.add("disabled")
            cancelBtn.classList.add("disabled")
        })
        let procedureLogField = document.createElement("div")
        procedureLogField.innerHTML = `<hr>
            <div id="date">${date.full}</div>
            <div id="procedure">Процедура: ${this.data._proceduresAlphabet[parsedLog.procedure]}</div>
            <div id="cost">Стоимость: ${parsedLog.cost} BYN</div>
            <div id="percent">Процент: ${parsedLog.percent}%</div>
            <div id="income">Доход: ${parsedLog.income} BYN</div>`
        procedureLogField.appendChild(removeBtn)
        procedureLogField.appendChild(proveBtn)
        procedureLogField.appendChild(cancelBtn)

        return procedureLogField
    }

    removeFulfilledProcedure(ind) {
        let log = this.data.procedures.splice(ind,1)[0]
        this.showFulfilled()

        this.updateProcedureCountUI()
        let parsedLog = this.parseLog(log)

        this.addSalary(log[1].split("_")[0], log[0], -parsedLog.income)
        this.updateSalaryUI(log[0].month)

        this.data.save()
    }

    updateSalaryPeriodUI() {
        let period = this.today.day > 15 ? 1 : 0
        if (this.data.salary[this.today.month]) {
            this.slaryPeriodCount.innerText = this.data.salary[this.today.month][period]

            let time = this.countHours(this.today.month, period)
            this.timePeriodCountHour.innerText = time[0]
            this.timePeriodCountMinute.innerText = time[1]
        }
        else {
            this.slaryPeriodCount.innerText = "0"
        }
    }

    countHours(month, period) {
        let minutes = this.data.workingMinutes[month][period]
        let hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        return [hours, minutes]
    }

    showFulfilled() {
        this.fulfilledProcedures.innerHTML = ''
        this.procedureCount = 0
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
        this._tempPercents = {}

        for (let i in this.data._cost) {
            if (this.data._cost.hasOwnProperty(i)) {
                if (!this.data._proceduresAlphabet[i]) continue

                let div = document.createElement("div")
                let procedureField = this.createFormField("input", i, "text", this.data._cost[i])
                let procedureLabel = this.createFormField("label", "", "", "", this.data._proceduresAlphabet[i], i)

                let procedurePercentLable = this.createFormField("label", "", "", "", "Процент:", "ppf")
                let procedurePercentField = this.createFormField("input", i, "number", this.data.percents[i])

                procedureField.addEventListener("input", () => { 
                    this._tempCosts[i] = procedureField.value
                })
                procedurePercentField.addEventListener("input", () => {
                    this._tempPercents[i] = parseFloat(procedurePercentField.value)
                    this.popup.classList.remove("disabled")
                    this.finishEditingBtn.disabled = true
                })
                this._tempCosts[i] = this.data._cost[i]
                this._tempPercents[i] = this.data.percents[i]

                div.append(procedureLabel, procedureField, procedurePercentLable, procedurePercentField)
                this.costFields.append(div)
            }
        }
        this.changeForm.classList.remove("disabled")

        this.clearMemoryBtn.addEventListener("click", this.startReleasingMemory.bind(this))
    }

    createFormField(elName, id, type, value, innerText, a_for) {
        let element = document.createElement(elName)
        if (id) element.id = id
        if (type) element.type = type
        if (value) element.value = value
        if (innerText) element.innerText = innerText
        if (a_for) element.for = a_for

        return element
    }

    finishCostEditing() {
        this.data.changeCostsAndPercents(this._tempCosts, this._tempPercents)

        if (this.isPercentageUpdating) this.updatePercentage()
        this.data.save()
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
        this.clearMemoryBtn.removeEventListener("click", this.startReleasingMemory.bind(this))
    }

    startReleasingMemory() {
        let button = document.createElement("button")
        button.innerText = "Очистить"
        let isPressed = false
        let timer = null

        button.addEventListener('mousedown', ()=>{
            isPressed = true
            this.clearMemoryBtn.disabled = true
            clearTimeout(timer)
            setTimeout(() => {
                if (isPressed) this.clearStorage()
            }, 3000)
        })
        button.addEventListener('touchstart', ()=>{
            isPressed = true
            this.clearMemoryBtn.disabled = true
            clearTimeout(timer)
            setTimeout(() => {
                if (isPressed) this.clearStorage()
            }, 3000)
        })


        button.addEventListener('mouseup', ()=>{
            isPressed = false
            this.clearMemoryBtn.disabled = false
            timer = this.removeChild(button, this.changeForm)
        })
        button.addEventListener('touchend', ()=>{
            isPressed = false
            this.clearMemoryBtn.disabled = false
            timer = this.removeChild(button, this.changeForm)
        })
        this.changeForm.appendChild(button)
        
        if (!isPressed) timer = this.removeChild(button, this.changeForm)
    }

    removeChild(child, parent, time = 2000) {
        return setTimeout(() => parent.removeChild(child), time)
    }

    clearStorage() {
        localStorage.clear()
        alert("Storage was cleaned")
    }

    closePopUp() {
        this.popup.classList.add("disabled")
        this.finishEditingBtn.disabled = false
    }

    updatePercentage() {
        this.data.salary = {}
        for (let i = 0; i < this.data.procedures.length; i++) {
            let procedure = this.data.procedures[i][1].split("_")
            for (let i = 1; i < procedure.length; i++) procedure[i] = parseInt(procedure[i], 10)

            procedure[2] = this.data.percents[procedure[0]]*100
            procedure[3] = (this.data.percents[procedure[0]]*procedure[1]).toFixed(2)

            this.addSalary(procedure[0], this.data.procedures[i][0])
            procedure = procedure.join("_")
            this.data.procedures[i][1] = procedure
        }
        this.data.save()

        this.showFulfilled()
        this.updatePeriod()
        this.updateSalaryUI(this.today.month)
        this.updateMonthUI()
        this.updateProcedureCountUI()
    }



    // New Functions
    


    createElement(elementName, text, parent) {
        let element = document.createElement(elementName)
        element.innerText = text
        parent.appendChild(element)
        return element
    }

    createButton(text, parent, onClickF = null, onMouseDownF = null, onMouseUpF = null) {
        let button = this.createElement("button", text, parent)
        if (onClickF) button.addEventListener("click", (e) => onClickF(e))
        if (onMouseDownF) button.addEventListener("click", (e) => onMouseDownF(e))
        if (onMouseUpF) button.addEventListener("click", (e) => onMouseUpF(e))
        return button
    }

    createInteractieInput(type, parent, onInputF = null, placeholder = null) {
        let input = this.createElement("input", "", parent)
        input.type = type
        if (onInputF) input.addEventListener("input", (e) => onInputF(e))
        if (placeholder) input.placeholder = placeholder
    }
}