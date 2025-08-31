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

        this.changeForm = document.getElementById("changeForm")
        this.costFields = document.getElementById("costFields")

        this.fulfilledProcedures = document.getElementById("fulfilled")
        this.calendar = document.getElementById("calendar")
        this.monthUI = document.getElementById("month")
        this.slaryPeriod = document.getElementById("slaryPeriod")
        this.slaryPeriodCount = document.getElementById("slaryPeriodCount")
        this.filter = document.getElementById("filter")
        this.countFilter = document.getElementById("countFilter")

        this.popup = document.getElementById("popup")

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
            },
            _proceduresAlphabetReverse: {
                "СПА 30" : "spa30",
                "СПА 60" : "spa60",
                "СПА 90" : "spa90",

                "Стоун 60" : "stone60",
                "Стоун 90" : "stone90",

                "Релакс 60" : "relax60",
                "Релакс 90" : "relax90",

                "Полный (Стоун 60 + СПА 60)" : "full"
            },
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
            console.log('data: ', data);

            if (!data._proceduresAlphabet.hasOwnProperty(data.procedures[0][1].split("_")[0])) {
                console.log('data.procedures[0][1].split("_")[0]: ', data.procedures[0][1].split("_")[0]);
                for (let i = 0; i < data.procedures.length; i++) {
                    let log = data.procedures[0][1].split("_")
                    console.log('log: ', log);
                    log[0] = this.data._proceduresAlphabetReverse[log[0]]
                    console.log('log[0]: ', log[0]);
                }
            }

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

        this.defaultProcentChangeBtn.addEventListener("click", this.closePopUp)
        this.fullProcentChangeBtn.addEventListener("click", () => {
            this.isPercentageUpdating = true
            this.closePopUp()
        })
        
        this.calendar.addEventListener("input", this.updateDate.bind(this))
        this.filter.addEventListener("input", this.onFilterUpdate.bind(this))
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

        log += procedure + "_"
        log += this.data._cost[procedure] + "_"
        log += this.data._cost["percent"]*100 + "_"
        log += this.countCost(procedure)
        
        this.data.procedures.push([date, log])

        this.procedureCount++
        this.updateProcedureCountUI()

        this.addSalary(procedure)
    }

    addSalary(procedure, date = null, ammount = null) {
        console.log('procedure: ', procedure);
        console.log('date: ', date);
        let period
        if (!date) period = this.today.day > 15 ? 1 : 0
        else period = date.day > 15 ? 1 : 0

        if (!this.data.salary.hasOwnProperty(this.today.month) || (date && !this.data.salary.hasOwnProperty(date.month))) {
            date ? this.data.salary[date.month] = [0, 0]
                : this.data.salary[this.today.month] = [0, 0]
            console.log('this.data.salary: ', this.data.salary);
        }
        this.data.salary[date?.month || this.today.month][period] += ammount || this.countCost(procedure)
        console.log('this.data.salary: ', this.data.salary);
    }
    
    countCost(procedure) {
        console.log('procedure: ', procedure);
        let g = parseInt((this.data._cost[procedure]*this.data._cost["percent"]).toFixed(2), 10)
        console.log('this.data._cost[procedure]: ', this.data._cost[procedure]);
        console.log('this.data._cost["percent"]: ', this.data._cost["percent"]);
        console.log('g: ', g);
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
        this.addSalary('', log[0], -parsedLog.income)
        this.updateSalaryUI(log[0].month)

        this.save()
    }

    updateSalaryPeriodUI() {
        let period = this.today.day > 15 ? 1 : 0
        if (this.data.salary[this.today.month]) this.slaryPeriodCount.innerText = this.data.salary[this.today.month][period]
        else this.slaryPeriodCount.innerText = "0"
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
        console.log("Data saved");
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
                field.addEventListener("input", () => { 
                    this._tempCosts[i] = field.value 
                })
                label.innerText = (this.data._proceduresAlphabet[i] || "Процент") + ": "
                label.for = i
                if (label.innerText === "Процент: ") field.addEventListener("input", () => {
                    this.popup.classList.remove("disabled")
                    this.finishEditingBtn.disabled = true
                })
                this._tempCosts[i] = this.data._cost[i]

                div.append(label, field)
                this.costFields.append(div)
            }
        }
        this.changeForm.classList.remove("disabled")

        this.clearMemoryBtn.addEventListener("click", this.startReleasingMemory.bind(this))
    }
    finishCostEditing() {
        for (let i in this.data._cost) {
            if (this.data._cost.hasOwnProperty(i)) {
                this.data._cost[i] = this._tempCosts[i]
            }
        }
        if (this.isPercentageUpdating) this.updatePercentage()
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
        this.clearMemoryBtn.removeEventListener("click", this.startReleasingMemory.bind(this))
    }

    startReleasingMemory() {
        let button = document.createElement("button")
        button.innerText = "Очистить"
        let isPressed = false
        let timer = null
        button.addEventListener('mousedown', ()=>{
            isPressed = true
            console.log("MouseDown")
            this.clearMemoryBtn.disabled = true
            clearTimeout(timer)
            setTimeout(() => {
                console.log("Time");
                if (isPressed) this.clearStorage()
            }, 3000)
        })
        button.addEventListener('touchstart', ()=>{
            isPressed = true
            console.log("MouseDown")
            this.clearMemoryBtn.disabled = true
            clearTimeout(timer)
            setTimeout(() => {
                console.log("Time");
                if (isPressed) this.clearStorage()
            }, 3000)
        })


        button.addEventListener('mouseup', ()=>{
            isPressed = false
            console.log("MouseUp")
            this.clearMemoryBtn.disabled = false
            timer = this.removeChild(button, this.changeForm)
        })
        button.addEventListener('touchend', ()=>{
            isPressed = false
            console.log("MouseUp")
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
            procedure[2] = this.data._cost['percent']*100
            procedure[3] = this.data._cost['percent']*procedure[1]
            this.addSalary(procedure[0], this.data.procedures[i][0])
            procedure = procedure.join("_")
            this.data.procedures[i][1] = procedure
        }
        this.save()

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