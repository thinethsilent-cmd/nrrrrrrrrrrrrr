
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAISWkpykSZydk61IVnJlpWQKX4HfmjlMM",
    authDomain: "new-app-lo.firebaseapp.com",
    projectId: "new-app-lo",
    storageBucket: "new-app-lo.firebasestorage.app",
    messagingSenderId: "577060298377",
    appId: "1:577060298377:web:96ea7dd27d982b9157b058"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "app.html";
});

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const authBtn = document.getElementById('authBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    authBtn.innerText = "AUTHENTICATING...";
    authBtn.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "app.html";
    } catch (error) {
        errorMsg.innerText = "ACCESS DENIED: " + error.message.split('/')[1].replace(')', '').replace(/-/g, ' ').toUpperCase();
        errorMsg.classList.remove('hidden');
        authBtn.innerText = "ESTABLISH CONNECTION";
        authBtn.disabled = false;
    }
});