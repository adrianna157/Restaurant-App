/**
 * Author: Adrianna Guevarra
 * Course: ICT 4510
 * Date: 7/14/2024
 * Description: This script handles the login functionality by sending a POST request to the server with the username
 * and password, saves the user object to sessionStorage upon successful login, and displays a welcome message with the
 * user's first and lastname.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const welcomeMessage = document.getElementById('welcomeMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://ict4510.herokuapp.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password})
            });

            if (response.status === 200) {
                const res = await response.json();
                sessionStorage.setItem('user', JSON.stringify(res));
                loginForm.style.display = 'none';
                welcomeMessage.style.display = 'block';
                welcomeMessage.textContent = `Welcome, ${res.user.first_name} ${res.user.last_name}!`;
            } else {
                alert('Login failed. Your login credentials are incorrect. Please try again');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please contact your administrator.');
        }
    });
});
