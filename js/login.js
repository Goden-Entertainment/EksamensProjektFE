document.getElementById('loginButton').addEventListener('click', login);

function login() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Tjek at felterne er udfyldt
    if (!email || !password) {
        alert('Udfyld venligst alle felter.');
        return;
    }

    // Send login request til backend
    fetch("http://20.251.162.251/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Forkert email eller adgangskode.');
            }
        })
        .then(data => {
            if (data) {
                // Gem token i localStorage til brug på andre sider
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                // Send bruger til admin siden
                window.location.replace('admin.html');
            }
        })
        .catch(error => {
            console.error("Login fejl:", error);
            alert('Der skete en fejl. Prøv igen.');
        });
}