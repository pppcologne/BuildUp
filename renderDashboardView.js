import { grabData, writeData } from './main.js';
import 'chartjs-adapter-moment';
export {renderDashboardView}

function createStat(name, value){
    const stat = document.createElement("div")
    stat.className = "stat"
    stat.innerHTML = `${name}: ${value}`
    return stat
}

function averageTime(times) {
    // Convert each time string to seconds
    var totalSeconds = times.reduce((total, time) => {
        var [hours, minutes, seconds] = time.split(":").map(Number);
        return total + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    // Calculate the average seconds
    var averageSeconds = totalSeconds / times.length;

    // Convert the average seconds back to the "xx:xx:xx" format
    var averageHours = Math.floor(averageSeconds / 3600);
    averageSeconds %= 3600;
    var averageMinutes = Math.floor(averageSeconds / 60);
    averageSeconds = Math.floor(averageSeconds % 60);

    return [averageHours, averageMinutes, averageSeconds]
        .map(v => v.toString().padStart(2, "0"))
        .join(":");
}

// Function to render the progress view

async function renderDashboardView(){
    const data = await grabData()
    var currentUserId = parseInt(localStorage.getItem('currentUser'))
    const userData = data.users.find(user => user.userId === currentUserId)

    view.innerHTML = ""
    const dashboardView = document.createElement("div")
    dashboardView.className = "dashboardView"

    const statContainer = document.createElement("div")
    statContainer.className = "statContainer"

    const workoutTimes = data.workoutHistory.filter(workout => workout.userId == currentUserId).map(workout => workout.duration)
    const avgWorkoutTime = averageTime(workoutTimes)

    statContainer.appendChild(createStat("Total Workouts", userData.workoutStats.totalSessions))
    statContainer.appendChild(createStat("Total Time", userData.workoutStats.totalWorkoutTime))
    statContainer.appendChild(createStat("Total Weight Lifted", userData.workoutStats.totalWeight + " kg"))
    statContainer.appendChild(createStat("Average Time Per Workout", avgWorkoutTime))
    dashboardView.appendChild(statContainer)

    //Find all of the different exercises the user has done
    console.log(data.sets)
    const userSets = data.sets.filter(workout => workout.userId == currentUserId)
    const userExercises = [...new Set(userSets.map(set => set.exerciseId))]
    console.log(userExercises)



    const timeFrames = ["1 Week", "1 Month", "6 Months", "1 Year", "All Time"]
    var timeframe = "1 Month"
    const timeFrameSelector = document.createElement("select")
    timeFrameSelector.className = "setInput timeFrameSelector"
    for (let i = 0; i < timeFrames.length; i++){
        const option = document.createElement("option")
        option.value = timeFrames[i]
        option.innerHTML = timeFrames[i]
        if (timeFrames[i] === "1 Month"){
            option.selected = true
        }
        timeFrameSelector.appendChild(option)
    }
    
    dashboardView.appendChild(timeFrameSelector)

    const canvas = document.createElement('canvas');
    dashboardView.appendChild(canvas);

    // Prepare the data for the chart
    const workoutData = data.workoutHistory.filter(workout => workout.userId == currentUserId);
    
    //Timeframes: 1 Week, 1 Month, 6 Months, 1 Year, All Time
    var rawChartdata = []
    var unit;
    var labels;
    var chartData;
    function setUpChartData(){
        switch (timeframe){
            case "1 Week":
                unit = "day"
                rawChartdata =  workoutData.filter(workout => moment().diff(moment(workout.date, 'DD/MM/YYYY'), 'days') <= 7)
                break;

            case "1 Month":
                unit = "day"
                rawChartdata =  workoutData.filter(workout => moment().diff(moment(workout.date, 'DD/MM/YYYY'), 'days') <= 30)
                break;

            case "6 Months":
                unit = "month"
                rawChartdata =  workoutData.filter(workout => moment().diff(moment(workout.date, 'DD/MM/YYYY'), 'days') <= 180)
                //
                break;

            case "1 Year":
                unit = "month"
                rawChartdata =  workoutData.filter(workout => moment().diff(moment(workout.date, 'DD/MM/YYYY'), 'days') <= 365)
                break;

            case "All Time":
                unit = "year"
                rawChartdata = workoutData
                break;
            }
        chartData = rawChartdata.map(workout => workout.sets.length)
        labels = rawChartdata.map(workout => workout.date)
        labels = labels.map(date => moment(date, 'DD/MM/YYYY'))
    }
    setUpChartData()

    
    // Create the chart
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sets per Workout',
                data: chartData,
                backgroundColor: '#ba5d627b',
                borderColor: '#EE2D37',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: unit
                    },
                    displayFormats: {
                        month: "DD/MM/YYYY"
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    timeFrameSelector.onchange = function(){
        timeframe = timeFrameSelector.value
        setUpChartData()
        chart.data.labels = labels
        chart.data.datasets[0].data = chartData
        chart.update();
    }

    view.appendChild(dashboardView)
}
