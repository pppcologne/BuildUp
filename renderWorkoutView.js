import { grabData, writeData } from './main.js';
const LinkedList = require('./linkedList.js');

// Function to find the last set for a given exerciseId
function findLastSet(exerciseId, data) {
    var lastSet;
    // Filter the sets for the given exerciseId
    const setsForExercise = data.sets.filter(set => set.exerciseId === exerciseId);
    if (setsForExercise.length === 0) {
        return null; 
    }
    // Find the set with the highest setId
    lastSet = setsForExercise.reduce((prev, current) => {
        return (prev.setId > current.setId) ? prev : current;
    });

    return lastSet;
}

// Function to the find last workout
async function findLastWorkout(userId, data) {
    var lastWorkout;
    const workoutsForUser = data.workoutHistory.filter(workout => workout.userId === 2);
    if (workoutsForUser.length == 0) {
        return null;
    }
    lastWorkout = workoutsForUser.reduce((prev, current) => {
        return (prev.workoutID > current.workoutID) ? prev : current;
    });

    return lastWorkout;
}


// Function to render the workout view

export async function renderWorkoutView(){
    var currentUserId = parseInt(localStorage.getItem('currentUser'))
    var intervalId;

    var workoutDurationSeconds = 0
    var workoutDurationMinutes = 0
    var workoutDurationHours = 0
    var workoutDurationOutput = "00:00:00"

    intervalId = setInterval(function () {
        workoutDurationSeconds += 1
        if (workoutDurationSeconds % 60 == 0 && workoutDurationSeconds != 0) {
            workoutDurationMinutes += 1
            workoutDurationSeconds = 0
        }
        if (workoutDurationMinutes % 60 == 0 && workoutDurationMinutes != 0) {
            workoutDurationHours += 1
            workoutDurationMinutes = 0
        }
        workoutDurationOutput = workoutDurationHours.toString().padStart(2, '0') + ":" + workoutDurationMinutes.toString().padStart(2, '0') + ":" + workoutDurationSeconds.toString().padStart(2, '0')
        document.querySelector(".timer").innerHTML = workoutDurationOutput
    }, 1000);
  


    // Grab the data from the database
    const data = await grabData()
    const userData = data.users.find(user => user.userId === currentUserId)
    const currentRoutineId = userData.currentRoutine
    const routineData = data.routines.find(routine => routine.routineId === currentRoutineId)
    const currentDay = userData.currentDay 
    const currentWorkout = routineData.workouts[currentDay]
    


    view.innerHTML = ""
    const workoutView = document.createElement("div")
    workoutView.className = "workoutView"

    const headContainer = document.createElement("div")
    headContainer.className = "workoutHeadContainer"

    const workoutName = document.createElement("h2")
    workoutName.innerHTML = '"' + currentWorkout.workoutName + '"' + ' | ' + "Day " + (currentDay + 1) + " of " + routineData.workouts.length
    workoutName.style.fontWeight = "bold"
    workoutName.style.marginBottom = "0px"

    headContainer.appendChild(workoutName)

    

    // Grab the muscles worked in the workout and add them to a string
    var musclesWorked = ""
    for (let i = 0; i < currentWorkout.exercises.length; i++){
        let exerciseId = currentWorkout.exercises[i]
        let exercise = data.exercises.find(exercise => exercise.exerciseId === exerciseId)
        exercise.muscles.forEach(element => {
            musclesWorked += element + ", "
        });
    }
    musclesWorked = musclesWorked.slice(0, -2)
    
    const muscleGroup = document.createElement("div")
    muscleGroup.innerHTML = musclesWorked
    headContainer.appendChild(muscleGroup)
    workoutView.appendChild(headContainer)

    const timeContainer = document.createElement("div")
    timeContainer.className = "timeContainer"

    const timer = document.createElement("div")
    timer.className = "timer"
    timer.innerHTML = "00:00:00"

    headContainer.appendChild(timer)
    workoutView.appendChild(timeContainer)


    let workoutOrder = new LinkedList();
    for (let i = 0; i < currentWorkout.exercises.length; i++){
        workoutOrder.append(currentWorkout.exercises[i])
    }
    let newWorkout = {
        "workoutID": data.workoutHistory.length + 1,
        "userId": currentUserId,
        "date": new Date().toLocaleDateString(),
        "duration": 0,
        "sets": [],
        "averageStrengthIncrease": ""
    }

    localStorage.setItem('currentWorkout', JSON.stringify(newWorkout))
    workoutView.appendChild(generateExercises(workoutOrder, data, currentUserId))

   
    const finishContainer = document.createElement("div")
    finishContainer.className = "finishContainer"
    const finishButton = document.createElement("button")
    finishButton.addEventListener("click",()=>{
        var answer = window.confirm("Are you sure you want to finish this workout");
        if (answer) {
            if (currentDay == routineData.workouts.length - 1){
                userData.currentDay = 0
            }else{        
                data.users[currentUserId - 1].currentDay += 1
            }
            userData.workoutStats.totalSessions += 1
            newWorkout.duration = workoutDurationOutput

            //Add the current workout time to the total time user stat
            var timeArray = workoutDurationOutput.split(":")
            var hours = Number(timeArray[0])
            var minutes = Number(timeArray[1])
            var seconds = Number(timeArray[2])

            var totaltimeArray = userData.workoutStats.totalWorkoutTime.split(":")
            var totalHours = Number(totaltimeArray[0])
            var totalMinutes = Number(totaltimeArray[1])
            var totalSeconds = Number(totaltimeArray[2])

            // Convert the times to seconds
            var timeInSeconds = hours * 3600 + minutes * 60 + seconds;
            var totalTimeInSeconds = totalHours * 3600 + totalMinutes * 60 + totalSeconds;

            // Add the times
            var newTotalTimeInSeconds = timeInSeconds + totalTimeInSeconds;

            // Convert the total time back to the "xx:xx:xx" format
            var newTotalHours = Math.floor(newTotalTimeInSeconds / 3600);
            newTotalTimeInSeconds %= 3600;
            var newTotalMinutes = Math.floor(newTotalTimeInSeconds / 60);
            newTotalTimeInSeconds %= 60;
            var newTotalSeconds = newTotalTimeInSeconds;

            // Update the total workout time
            userData.workoutStats.totalWorkoutTime = [newTotalHours, newTotalMinutes, newTotalSeconds]
                .map(v => v.toString().padStart(2, "0"))
                .join(":");

            userData.averageOneRepMax = {}

            data.workoutHistory.push(newWorkout)

            clearInterval(intervalId);
            writeData(data)
            alert("Logged Workout")

            renderWorkoutView()
        }


        
    }, false)
    finishButton.innerHTML =  "Finish Workout"
    finishButton.className = "finishButton"
    finishContainer.appendChild(finishButton)
    workoutView.appendChild(finishContainer)

    view.appendChild(workoutView)
}


function generateExercises(linkedList, data, currentUserId){
    let newWorkout = JSON.parse(localStorage.getItem('currentWorkout'))
    const userData = data.users.find(user => user.userId === currentUserId)


    let exerciseContainer = document.createElement("div")
    exerciseContainer.className = "exerciseContainer"

    let currentNode = linkedList.head
    while (currentNode != null){
        let exerciseId = currentNode.data
        let exercise = data.exercises.find(exercise => exercise.exerciseId === exerciseId)
        let exerciseDiv = document.createElement("div")
        exerciseDiv.className = "exerciseDiv"

        let changePositionDownButton = document.createElement("img")
        changePositionDownButton.src = "up-arrow.png"
        changePositionDownButton.className = "changePositionDownButton"
        changePositionDownButton.style.transform = 'rotate(180deg)';

        let changePositionUpButton = document.createElement("img")
        changePositionUpButton.src = "up-arrow.png"
        changePositionUpButton.className = "changePositionUpButton"

        let thisNode = currentNode;
        changePositionDownButton.addEventListener("click", () => {
            if (thisNode != null && thisNode.next != null){
                thisNode.moveNodeDown()


                localStorage.setItem('currentWorkout', JSON.stringify(newWorkout))
                exerciseContainer.replaceWith(generateExercises(linkedList, data, currentUserId))
            }
            
        },)
        exerciseDiv.appendChild(changePositionDownButton)

        changePositionUpButton.addEventListener("click", () => {
            if (thisNode != null && thisNode.prev != null){
                thisNode.moveNodeUp()

                localStorage.setItem('currentWorkout', JSON.stringify(newWorkout))
                exerciseContainer.replaceWith(generateExercises(linkedList, data, currentUserId))
            }
            
        },)
        exerciseDiv.appendChild(changePositionUpButton)



        let exerciseMuscles = document.createElement("div")
        exerciseMuscles.className = "exerciseMuscles"
        exercise.muscles.forEach(element => {
            const muscleContainer = document.createElement("div")
            muscleContainer.className = "muscleContainer"
            muscleContainer.innerHTML += element
            exerciseMuscles.appendChild(muscleContainer)
        });
        exerciseMuscles.innerHTML = exerciseMuscles.innerHTML.slice(0, -2)
        exerciseDiv.appendChild(exerciseMuscles)

        let exerciseName = document.createElement("h3")
        exerciseName.style.marginBottom = "0"
        exerciseName.style.marginTop = "2"

        exerciseName.innerHTML =  exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)
        exerciseName.style.fontWeight = "bold"
        exerciseDiv.appendChild(exerciseName)

        const exerciseType = document.createElement("p")
        exerciseType.style.marginTop = "0"
        exerciseType.innerHTML = exercise.type.toUpperCase()
        exerciseDiv.appendChild(exerciseType)

        const setTableContainer = document.createElement("div")
        setTableContainer.className = "setTableContainer"
        exerciseDiv.appendChild(setTableContainer)

        const setTable = document.createElement("table")
        setTable.className = "setTable"
        const setHeader = document.createElement("tr")
        setHeader.innerHTML = "<th class='setTh'>Set</th><th>Weight</th><th>Reps</th><th>Log Set</th>"
        setTable.appendChild(setHeader)

        const lastSet = findLastSet(exerciseId, data)

        for (let i = 0;i < 3; i++){
            const setRow = document.createElement("tr")
            
            setRow.innerHTML = ("<td> " + (i + 1) + " </td>")

            const weightInput = document.createElement("select")
            for (let weight = 0; weight<100;weight+=2.5){
                let option = document.createElement("option")
                option.text = weight

                //find the last weight used for the current exercise
                if (lastSet == null){
                    if (weight == 50){
                        option.selected = "selected"
                    }
                }
                else if(weight == lastSet.weight)
                {
                    option.selected = "selected"
                }

                weightInput.add(option)
            }
            weightInput.className = "setInput"

            const weightCell = document.createElement("td")
            weightCell.appendChild(weightInput)
            setRow.appendChild(weightCell)

            const repsInput = document.createElement("select")
            for (let rep = 1; rep<26;rep++){
                let option = document.createElement("option")
                option.text = rep
                if (lastSet == null){
                    if (rep == 8){
                        option.selected = "selected"
                    }
                }
                else if(rep == lastSet.reps)
                {
                    option.selected = "selected"
                }
                repsInput.add(option)
            }
            repsInput.className = "setInput"
            repsInput.placeholder = (lastSet == null) ? "8" : (lastSet.reps + 1)
            const repsCell = document.createElement("td")
            repsCell.appendChild(repsInput)
            setRow.appendChild(repsCell)

            const logButton = document.createElement("button")
            logButton.className = "logButton"
            logButton.innerHTML = "Log"

            logButton.addEventListener("click", async () => {
                weightInput.disabled = true
                repsInput.disabled = true
                logButton.disabled = true
                const weight = weightInput.value
                const reps = repsInput.value
                const newSetOneRepMax = weight * (1 + (0.033 * reps))
                const newSetId = data.sets.length + 1

                //Calculate the one rep max change percentage
                let oneRepMaxChangePercentage = 0;
                if (lastSet != null){
                    oneRepMaxChangePercentage = ((newSetOneRepMax - lastSet.oneRepMax) / lastSet.oneRepMax) * 100
                }

                const newSet = {
                    "setId": newSetId,
                    "userId": currentUserId,
                    "exerciseId": exerciseId,
                    "date": new Date().toLocaleDateString(),
                    "weight": + weight,
                    "reps": + reps,
                    "oneRepMax": newSetOneRepMax,
                    "oneRepMaxChangePercentage": Math.floor(oneRepMaxChangePercentage),
                }
                data.sets.push(newSet)    
                newWorkout.sets.push(newSetId)
                
                //Check if this set was a Personal Record

                //Grab the weights used for the previous PR set

                let exerciseBestSet = userData.workoutStats.bestSetIdsForExercises[exerciseId]
                if (exerciseBestSet == undefined){
                    userData.workoutStats.bestSetIdsForExercises[exerciseId] = newSetId
                }else{
                    const bestSet = data.sets.find(set => set.setId === exerciseBestSet)

                    // If a set is better than another is detirmined by calculating the one rep max, using the Baechle Equation, which is as follows:
                    // 1RM = Weight × ( 1 + ( 0.033 × Number of repetitions ) )
                    const bestSetOneRepMax = bestSet.weight * (1 + (0.033 * bestSet.reps))
                    if (newSetOneRepMax > bestSetOneRepMax){
                        userData.workoutStats.bestSetIdsForExercises[exerciseId] = newSetId
                        alert("New Personal Record!")
                    }

                }
                userData.workoutStats.totalWeight = Number(userData.workoutStats.totalWeight) + Number(weight)
    
            }) 
                const logCell = document.createElement("td")
                logCell.appendChild(logButton)
                setRow.appendChild(logCell)
                setTable.appendChild(setRow)
        }
        setTableContainer.appendChild(setTable)
        exerciseDiv.appendChild(setTableContainer)
        exerciseContainer.appendChild(exerciseDiv)

        currentNode = currentNode.next


    }
    return exerciseContainer
    
}