import { renderRoutineSelectorView } from './renderRoutineSelectorView.js';
import { renderWorkoutView } from './renderWorkoutView.js';
import { renderDashboardView } from './renderDashboardView.js';
import { renderLoginPage } from './renderLoginPage.js';

// Function to grab the data from the database
export async function grabData(){
    try {
        const response = await fetch('/database')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data =  await response.json()
        console.log("grabbing data")
        console.log(data)
        return data
    } catch (error) {
        console.error('There was a problem grabbing the data:', error);
    }
}

// Function to write data to the database
export async function writeData(newData){
    try {
        const response = await fetch('/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text()
        console.log("writing data")
        return data
    } catch (error) {
        console.error('There was a problem writing the data:', error);
    }
}


let currentView;

if (localStorage.getItem('currentUser') == null){
    currentView = "Login"
}
else{
    currentView = "Dashboard"

}
// Define the initial value for the current view

// Define an array of navigation buttons
var navButtons = ["Dashboard", "Workout", "Routine Selector"]

// Function to render the header
function renderHeader(){ 
    const titleContainer = document.createElement("div")
    titleContainer.className = "titleContainer"

    const title = document.createElement("h1")
    title.innerHTML = "BuildUp"
    title.className = "title"

    titleContainer.appendChild(title)
    document.body.appendChild(titleContainer)
}

renderHeader()

// Function to render the navigation bar
function renderNavbar(){
    const navbar = document.createElement("div")
    navbar.id = "navbar"

    // Loop through the navigation buttons array
    for (let i = 0; i < navButtons.length; i++){
        const button = document.createElement("button")
        button.innerHTML = navButtons[i]
        button.className = "navButton"
        // Add event listener to each button to update the current view
        button.addEventListener("click",() => {currentView = navButtons[i]; updateView()}, false)
        navbar.appendChild(button)
    }

    document.body.appendChild(navbar)
}
if (currentView != "Login"){
    renderNavbar()
}

// Function to update the view based on the current view value
function updateView(){
    switch (currentView){
        case "Login":
            renderLoginPage()
            break
        case "Dashboard":
            renderDashboardView()
            break
        case "Workout":
            renderWorkoutView()
            break
        case "Settings":
            renderSettingsView()
            break
        case "Routine Selector":
            renderRoutineSelectorView()
            break
    }
}

// Create a view element and append it to the body
const view = document.createElement("div")
view.id = "view"
document.body.appendChild(view)



// Function to render the settings view
function renderSettingsView(){
    view.innerHTML = ""
    console.log("rendering settings view")
    const settingsView = document.createElement("div")
    settingsView.innerHTML = "<h1> Settings </h1>"
    view.appendChild(settingsView)
}

//button to refresh page
const refreshButton = document.createElement("button")
refreshButton.innerHTML = "Refresh"
refreshButton.className = "refreshButton"
refreshButton.addEventListener("click",() => {window.location.href=window.location.href}, false)
document.body.appendChild(refreshButton)

//button to remove Current User page
const removeCurrentUser = document.createElement("button")
removeCurrentUser.innerHTML = "Log Out"
removeCurrentUser.className = "userButton"
removeCurrentUser.addEventListener("click",() => {localStorage.removeItem("currentUser");window.location.href=window.location.href}, false)
document.body.appendChild(removeCurrentUser)

//button to add Current User page
const setUser = document.createElement("button")
setUser.innerHTML = "Set User"
setUser.className = "setUser"
setUser.addEventListener("click",() => {localStorage.setItem("currentUser", 1);window.location.href=window.location.href}, false)
document.body.appendChild(setUser)



// Call the necessary functions to render the initial view
updateView()