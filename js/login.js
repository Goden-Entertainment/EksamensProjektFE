document.getElementById('loginButton').addEventListener('click', login);

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Udfyld venligst alle felter.');
        return;
    }

    if (username === 'admin' && password === '1234') {
        //TODO: replace with the right name once html is created.
        window.location.replace('adminpage.html');
    } else {
        alert('Forkert brugernavn eller adgangskode.');
    }
}