export class ProcedureCreator {
    constructor(procedureListElement) {
        this._procedureListElement = procedureListElement
        this._groups = {}
    }

    addProcedure(groupName, name, id, writeToDataFnc) {
        console.log('groupName: ', groupName);
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

    addSomeProcedures(idList, nameLib, groupLib, writeToDataFnc) {
        console.log('nameLib: ', nameLib);
        for (let i = 0; i < idList.length; i++) {
            this.addProcedure(groupLib[idList[i]], nameLib[idList[i]], idList[i], writeToDataFnc)
        }
    }
}