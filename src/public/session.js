const signUpButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

const loginErrorDiv = document.getElementById('login-error');
const loginFailedDiv = document.getElementById('login-failed');
const registerErrorDiv = document.getElementById('register-error');
const registerFailedDiv = document.getElementById('register-failed');

loginButton?.addEventListener('click', (e) => {
	e.preventDefault();
	login();
});

signUpButton?.addEventListener('click', (e) => {
	e.preventDefault();
	register();
});

logoutButton?.addEventListener('click', (e) => {
	e.preventDefault();
	logout();
});

async function register() {
	const email = document.getElementById('inputEmail').value;
	const password = document.getElementById('inputPassword').value;
	const password2 = document.getElementById('inputPassword2').value;
	const firstName = document.getElementById('inputFirstName').value;
	const lastName = document.getElementById('inputLastName').value;
	const age = document.getElementById('inputAge').value;
	const role = document.getElementById('inputRole')?.value || 'user';

	const body = {
		email,
		password,
		password2,
		firstName,
		lastName,
		age,
		role
	}

	try {
		const response = await fetch('http://localhost:8080/api/session/register', {
			method: 'post',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		});
		if (response.status === 200) {
			//const data = await response.json();
			document.location.href = '/login';
		} else if (response.status === 400) {
			const data = await response.json();
			if (registerFailedDiv && registerFailedDiv.hidden === false) registerFailedDiv.hidden = true;
			registerErrorDiv.hidden = false;
			registerErrorDiv.innerText = data.message;
			console.error(data.error);
		} else {
			throw new Error('Unexpected response');
		}
	} catch (err) {
	console.error(`Error: ${err}`);
	}
}

async function login() {
	const email = document.getElementById('inputEmail').value;
	const password = document.getElementById('inputPassword').value;

	const body = {
		email,
		password
	}
	try {
		const response = await fetch('http://localhost:8080/api/session/login', {
			method: 'post',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
		});
		if (response.status === 200) {
			document.location.href = '/products';
		} else if (response.status === 400 || response.status === 401 || response.status === 403) {
			const data = await response.json();
			if (loginFailedDiv && loginFailedDiv.hidden === false) loginFailedDiv.hidden = true;
			loginErrorDiv.hidden = false;
			loginErrorDiv.innerText = data.message;
			console.error(data.message);
		} else {
			throw new Error('Unexpected response');
		}
	} catch (err) {
	console.error(`Error: ${err}`);
	}
}

async function logout() {
	try {
		const response = await fetch('http://localhost:8080/api/session/logout', {
			method: 'get',
			headers: { 'Content-Type': 'application/json' },
		});
		if (response.status === 200) {
			document.location.href = '/login';
		} else if (response.status === 400) {
			const data = await response.json();
			console.error(data.message);
		} else {
			throw new Error('Unexpected response');
		}
	} catch (err) {
	console.error(`Error: ${err}`);
	}
}
