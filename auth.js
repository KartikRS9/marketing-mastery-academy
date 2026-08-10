// auth.js
// Google Apps Script Web App URL
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxa5sZ6v6wjafE0tJZG2s8Z12A3WwheL6_igkiV3jIkbF-qHtSBpAb35UhywUPG-qbu/exec';

document.addEventListener('DOMContentLoaded', () => {
  const authGate = document.getElementById('auth-gate');
  const mainApp = document.getElementById('main-app');
  const loginBtn = document.getElementById('auth-login-btn');
  const requestBtn = document.getElementById('auth-request-btn');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authMsg = document.getElementById('auth-message');

  // Helper to hash password using SHA-256 (Web Crypto API)
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // MOCK MODE: If URL is not configured yet
  if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_WEB_APP_URL_HERE') {
    console.warn("Google Apps Script URL not configured. Running in MOCK auth mode.");
    
    if (localStorage.getItem('mock_auth_granted') === 'true') {
      authGate.style.display = 'none';
      mainApp.style.display = 'block';
    }

    loginBtn.addEventListener('click', () => {
      if (!authEmail.value || !authPassword.value) {
        authMsg.textContent = "Please enter both email and password.";
        authMsg.style.color = 'var(--danger)';
        return;
      }
      authMsg.textContent = "Mock Login Successful! Loading...";
      authMsg.style.color = 'var(--success)';
      grantAccess();
    });

    requestBtn.addEventListener('click', () => {
      if (!authEmail.value || !authPassword.value) {
        authMsg.textContent = "Enter email and a password to request access.";
        authMsg.style.color = 'var(--danger)';
        return;
      }
      authMsg.textContent = "Mock Access Requested. (Check console)";
      authMsg.style.color = 'var(--success)';
    });
    
    return;
  }

  // REAL GOOGLE SHEETS MODE

  loginBtn.addEventListener('click', async () => {
    await handleAuthAction('login', loginBtn);
  });

  requestBtn.addEventListener('click', async () => {
    await handleAuthAction('request', requestBtn);
  });

  async function handleAuthAction(action, btnElement) {
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !password) {
      authMsg.textContent = "Please enter both email and password.";
      authMsg.style.color = 'var(--danger)';
      return;
    }

    btnElement.disabled = true;
    authMsg.style.color = 'inherit';
    authMsg.textContent = "Connecting securely...";

    try {
      const passwordHash = await hashPassword(password);
      
      const queryParams = new URLSearchParams({
        action: action,
        email: email,
        passwordHash: passwordHash
      }).toString();

      const response = await fetch(`${GAS_WEB_APP_URL}?${queryParams}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (result.success) {
        authMsg.textContent = result.message;
        authMsg.style.color = 'var(--success)';
        
        if (action === 'login') {
          grantAccess();
        }
      } else {
        authMsg.textContent = result.message;
        authMsg.style.color = 'var(--danger)';
      }
    } catch (err) {
      authMsg.textContent = "Network error. Please try again.";
      authMsg.style.color = 'var(--danger)';
      console.error(err);
    } finally {
      btnElement.disabled = false;
    }
  }

  function grantAccess() {
    setTimeout(() => {
      localStorage.setItem('mock_auth_granted', 'true');
      authGate.style.display = 'none';
      mainApp.style.display = 'block';
      if(window.Motion) {
         Motion.animate(".dashboard-container", { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });
      }
    }, 1000);
  }
});
