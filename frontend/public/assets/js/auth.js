// assets/js/auth.js
// Handles login and registration on landing page (index.html)

import { api, setToken, setUser, getUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginSubmit');
  const signupOpenBtn = document.getElementById('openSignup');
  const signupForm = document.getElementById('signupForm');
  const signupSubmit = document.getElementById('signupSubmit');
  const loginError = document.getElementById('loginError');

  // If user already logged in, redirect to home
  const maybeUser = getUser();
  if (maybeUser) {
    // optionally validate token with api.me()
    window.location.href = '/home.html';
    return;
  }

  loginForm && loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    loginBtn.disabled = true;
    try {
      const email = emailInput.value.trim();
      const password = passInput.value;
      if (!email || !password) throw new Error('Please enter email and password.');
      const res = await api.login(email, password);
      // on success redirect to home
      window.location.href = '/home.html';
    } catch (err) {
      loginError.textContent = err.message || 'Login failed';
    } finally {
      loginBtn.disabled = false;
    }
  });

  // signup (simple)
  signupForm && signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupSubmit.disabled = true;
    try {
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      if (!name || !email || !password) throw new Error('Please fill name, email and password.');
      await api.register({ name, email, password });
      window.location.href = '/home.html';
    } catch (err) {
      alert(err.message || 'Signup failed');
    } finally {
      signupSubmit.disabled = false;
    }
  });

});