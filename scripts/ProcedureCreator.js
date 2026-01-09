export class ProcedureCreator {
    constructor(procedureListElement, fulfilledProceduresElement, addProcedureFormElement, isCourceCheckbox, salaryMonthEl, salaryPeriodEl, salaryDayEl, timeMonthEl, timePeriodEl, timeDayEl ) {
        this._procedureListElement = procedureListElement
        this._groups = {}

        this._fulfilledProceduresElement = fulfilledProceduresElement
        this._addProcedureFormElement = addProcedureFormElement
        this.isCourceCheckbox = isCourceCheckbox

        this._salaryUI = {
            month: salaryMonthEl,
            period: salaryPeriodEl,
            day: salaryDayEl
        }

        this._timeUI = {
            month: timeMonthEl,
            period: timePeriodEl,
            day: timeDayEl
        }
    }

    writeProcedureToList(groupName, name, id, writeToDataFnc) {
        groupName = groupName[0] == "=" ? groupName : "== " + groupName + " =="
        if (!this._groups.hasOwnProperty(groupName)) {
            let group = document.createElement("optgroup")
            group.label = groupName
            this._groups[groupName] = group
            this._procedureListElement.append(group)
        }

        let procedure = document.createElement("option")
        procedure.value = id
        procedure.innerText = name

        this._groups[groupName].append(procedure)

        writeToDataFnc(id, name)
    }

    createProcedureList(idList, nameLib, groupLib, writeToDataFnc) {
        for (let i = 0; i < idList.length; i++) {
            this.writeProcedureToList(groupLib[idList[i]], nameLib[idList[i]], idList[i], writeToDataFnc)
        }
    }

    addProcedureStart = () => {
        this._addProcedureFormElement.classList.remove("disabled")
    }
    addProcedureFinish(writeTodataFnc) {
        this.addProcedure(this.procedureList.value, writeTodataFnc)
        this._addProcedureFormElement.classList.add("disabled")

        this.updateProcedureCountUI()
        this.updateSalaryUI(this.today.month)

        this.writeProcedure(this.data.procedures[this.data.procedures.length-1], this.data.procedures.length-1)
    }
    addProcedure(procedure, writeTodataFnc) {
        let log = {}
        let date = {
            year: this.today.year,
            month: this.today.month,
            day: this.today.day,
            full: this.today.date
        }

        log.id = procedure
        log.cost = (this.isCourceCheckbox.checked ? (this.data._cost[procedure] * 0.9).toFixed(2) : this.data._cost[procedure]) + "_"
        log.percents = this.data.percents[procedure]*100 + "_"
        log.income = this.countCost(procedure)
        
        // this.data.procedures.push([date, log])
        writeTodataFnc(date, log)

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
    countCost(procedure, cost) {
        let g = Math.round(this.data._cost[procedure] * (this.isCourceCheckbox.checked ? 0.9 : 1) * this.data.percents[procedure])
        return g
    }

    writeProcedure(log, logInd) {
        this.fulfilledProcedures.append(this.createProcedureField(log[0], this.parseLog(log), logInd))
    }
}

// proc list
// salary
// time