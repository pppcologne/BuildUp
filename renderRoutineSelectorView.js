import { grabData, writeData } from './main.js';

// Renders the routine selector view.

export async function renderRoutineSelectorView(){
    // Grab the userID from local storage
    var currentUserId = parseInt(localStorage.getItem('currentUser'))
    console.log(currentUserId)

    // Clear the view
    view.innerHTML = ""
    console.log("rendering routine view")
    const routineView = document.createElement("div")
    routineView.className = "routineView"

    // Grab the data from the database
    const data = await grabData()

    //Create a div for each routine
    for(let i = 0; i < data.routines.length; i++){
        const routine = document.createElement("div")
        routine.className = "routine"
        let title = document.createElement("h2")
        title.innerHTML = data.routines[i].name
        routine.appendChild(title)

        //Create a table to display the routine
        let table = document.createElement("table")
        table.className = "routineTable"    
        let days = document.createElement("tr")
        table.appendChild(days)
        let workouts = document.createElement("tr")
        table.appendChild(workouts)

        let numOfDaysInRoutine = data.routines[i].workouts.length
        //Create a table cell for each day in the routine
        for(let k = 0; k < numOfDaysInRoutine; k++){
            let day = document.createElement("td")
            day.className = "routineTableCellTop"
            day.innerHTML = `Day ${k + 1}`
            days.appendChild(day)
            let workout = document.createElement("td")
            workout.className = "routineTableCell"
            workout.innerHTML = data.routines[i].workouts[k].workoutName
            workouts.appendChild(workout)
        }

        //Create a container for the table
        let tableContainer = document.createElement("div")
        tableContainer.className = "tableContainer"
        tableContainer.appendChild(table)

        //Append the tablecontainer to the routine
        routine.appendChild(tableContainer)

        let buttonContainer = document.createElement("div")
        buttonContainer.className = "buttonContainer"
        routine.appendChild(buttonContainer)

        //Create a button to display more information about the routine
        let infoButton = document.createElement("button")
        infoButton.innerHTML = "More Info"
        infoButton.className = "routineButton"
        infoButton.addEventListener("click",() => {updateView()}, false)
        buttonContainer.appendChild(infoButton)


        //Create a button to select the routine
        let selectButton = document.createElement("button")
        selectButton.innerHTML = "Select"
        selectButton.className = "routineButton"

        //Change the current routine for the user if the button is pressed
        selectButton.addEventListener("click",() => {
            const userData = data.users.find(user => user.userId === currentUserId)
            userData.currentRoutine = data.routines[i].routineId
            userData.currentDay = 0
            alert(`Routine ${data.routines[i].name} selected!`)
            writeData(data)
        }, false) 
        buttonContainer.appendChild(selectButton)




        routineView.appendChild(routine)

    }
    view.appendChild(routineView)
}