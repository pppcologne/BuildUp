import { grabData, writeData } from './main.js';
export {renderLoginPage}
import CryptoJS from 'crypto-js';

async function renderLoginPage(){

    const loginWindow = document.createElement("div")
    loginWindow.className = "loginWindow"
    loginWindow.innerHTML = `
        <h2>Login</h2>
        <input type="text" id="usernameInput" placeholder="Username" autocorrect="off" autocapitalize="off">
        <input type="password" id="passwordInput" placeholder="Password" autocorrect="off" autocapitalize="off">
        <div> <input type="checkbox" onclick="(() => {var x = document.getElementById('passwordInput');x.type = x.type === 'password' ? 'text' : 'password'})()" >Show Password </div>
        <div style="display:flex; justify-content:space-between;width:100%">
        <button id="loginButton">Login</button>
        <button id="registerButton">Register</button>
        </div>

    `
    view.appendChild(loginWindow)
    document.getElementById("loginButton").addEventListener("click", async () => {
        const username = document.getElementById("usernameInput").value
        const password = document.getElementById("passwordInput").value
        const data = await grabData()
        const hashedPassword =  CryptoJS.SHA256(password).toString()
        const user = data.users.find(user => user.username === username && user.hashedPassword === hashedPassword)
        if (user){
            localStorage.setItem('currentUser', user.userId)
            //refresh the page
            window.location.href = window.location.href
        }
        else{
            alert("Invalid username or password")
        }
    })

    document.getElementById("registerButton").addEventListener("click", async () => {
        const username = document.getElementById("usernameInput").value
        const password = document.getElementById("passwordInput").value
        const data = await grabData()
        const hashedPassword = CryptoJS.SHA256(password).toString()
        const user = data.users.find(user => user.username === username)
        
        if (user){
            alert("Username already exists")
        }
        else{
            const regex = /^[a-z0-9]+$/i

            if (password.length < 7){
                alert("please use a password longer than 7 characters")
            }
            else if (username.length < 3){
                alert("please use a username longer than 3 characters")
            }
            else if(!regex.test(username)){
                alert("please use a username with only letters and numbers")
            }else if(password.includes(" ")){
                alert("please do not use whitespace in your password")
            }
            else{
                data.users.push({userId: data.users.length + 1, username: username, hashedPassword: hashedPassword,currentRoutine: 1,currentDay:0, workoutStats: {totalSessions: 0, totalWorkoutTime: "00:00:00", totalWeight: 0}})
                await writeData(data)
                alert("User created")
            }

        }
    })
}


