const signUpButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const sendRecoveryLinkButton = document.getElementById('send-recovery-link-button');
const resetPasswordButton = document.getElementById('reset-password-button');

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

sendRecoveryLinkButton?.addEventListener('click', (e) => {
  sendRecoveryLinkButton.disabled = true;
  e.preventDefault();
  sendResetLink();
});

resetPasswordButton?.addEventListener('click', (e) => {
  resetPasswordButton.disabled = true;
  e.preventDefault();
  resetPassword();
});

async function register () {
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
  };

  try {
    const response = await fetch('http://localhost:3000/api/session/register', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 200) {
      // const data = await response.json();
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

async function login () {
  const email = document.getElementById('inputEmail').value;
  const password = document.getElementById('inputPassword').value;

  const body = {
    email,
    password
  };
  try {
    const response = await fetch('http://localhost:3000/api/session/login', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
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

async function logout () {
  try {
    const response = await fetch('http://localhost:3000/api/session/logout', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
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

async function sendResetLink () {
  const email = document.getElementById('inputRecoveryEmail').value;
  const sendRecoveryLinkAlert = document.getElementById('send-recovery-link-alert');
  const body = { email };
  try {
    const response = await fetch('http://localhost:3000/api/session/forgot-password', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 200) {
      sendRecoveryLinkAlert.hidden = false;
      sendRecoveryLinkAlert.innerText = 'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.';
      sendRecoveryLinkAlert.classList = 'alert alert-success mt-3';
    } else if (response.status === 400 || response.status === 404) {
      const data = await response.json();
      sendRecoveryLinkAlert.hidden = false;
      sendRecoveryLinkAlert.innerText = `${data.message}`;
      sendRecoveryLinkAlert.classList = 'alert alert-danger mt-3';
      sendRecoveryLinkButton.disabled = false;
    } else {
      sendRecoveryLinkAlert.hidden = false;
      sendRecoveryLinkAlert.innerText = 'Ups! Something went wrong.';
      sendRecoveryLinkAlert.classList = 'alert alert-danger mt-3';
      sendRecoveryLinkButton.disabled = false;
      throw new Error('Unexpected response');
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function resetPassword () {
  const password = document.getElementById('inputResetPassword').value;
  const password2 = document.getElementById('inputResetPassword2').value;
  const token = location.pathname.split('/')[2];
  const resetPasswordAlert = document.getElementById('reset-password-alert');
  const body = { password, password2, token };
  try {
    const response = await fetch('http://localhost:3000/api/session/reset-password', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 200) {
      resetPasswordAlert.hidden = false;
      resetPasswordAlert.innerText = 'Your password has been reseted. You can now login with your new password.';
      resetPasswordAlert.classList = 'alert alert-success mt-3';
    } else if (response.status === 400 || response.status === 404) {
      const data = await response.json();
      resetPasswordAlert.hidden = false;
      resetPasswordAlert.innerText = `${data.message}`;
      resetPasswordAlert.classList = 'alert alert-danger mt-3';
      resetPasswordButton.disabled = false;
    } else if (response.status === 401) {
      resetPasswordAlert.hidden = false;
      resetPasswordAlert.innerHTML = 'Link expired or already used. Please request a new one <a href="/forgot-password">here</a>';
      resetPasswordAlert.classList = 'alert alert-danger mt-3';
    } else {
      throw new Error('Unexpected response');
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
