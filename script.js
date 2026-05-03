import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyBrbo7tu2OdkqvNmJP33w0prL_6OqaW5Uc",
  authDomain: "weather-app-48a87.firebaseapp.com",
  projectId: "weather-app-48a87",
  storageBucket: "weather-app-48a87.firebasestorage.app",
  messagingSenderId: "805154255065",
  appId: "1:805154255065:web:1be6a1ff9a964c9a704ec8",
  measurementId: "G-81XHRF8S9Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const traduceriVreme = {
    "clear sky": "cer senin",
    "few clouds": "câțiva nori",
    "scattered clouds": "nori răzleți",
    "broken clouds": "cer noros",
    "shower rain": "ploaie scurtă",
    "rain": "ploaie",
    "thunderstorm": "furtună",
    "snow": "ninsoare",
    "mist": "ceață"
};

/* ================= NAVIGATION ================= */

function goToRegister() {
    window.location.href = "register.html";
}

function goToLogin() {
    window.location.href = "index.html";
}

/* ================= AUTH ================= */

async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();

    if (password !== confirm) {
        alert("Parolele nu coincid!");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Cont creat!");
        window.location.href = "index.html";
    } catch (e) {
        alert(e.message);
    }
}
onAuthStateChanged(auth, (user) => {
    const isAppPage = window.location.pathname.includes("app.html");

    if (user) {
    renderFavorites();
}

    if (!user && isAppPage) {
        // dacă NU e logat și încearcă să intre în aplicație
        window.location.href = "index.html";
    }

    if (user && !isAppPage) {
        // dacă e logat și e pe login/register → trimite-l în app
        window.location.href = "app.html";
    }
});

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "app.html";
    } catch (e) {
        alert(e.message);
    }
}

function logout() {
    signOut(auth);
    window.location.href = "index.html";
}

async function getWeather() {
    const city = document.getElementById("city").value;

    if (!city) {
        alert("Scrie un oraș!");
        return;
    }

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=3fe7c095bd8367c8a38436a235befaa8&units=metric`
        );

        const data = await res.json();

            document.body.classList.remove("dark-login","sunny","rain","snow","cloudy");

if (data.weather[0].main === "Clear") document.body.classList.add("sunny");
if (data.weather[0].main === "Clouds") document.body.classList.add("cloudy");
if (data.weather[0].main === "Rain") document.body.classList.add("rain");
if (data.weather[0].main === "Snow") document.body.classList.add("snow");

       if (Number(data.cod) !== 200) {
    document.getElementById("result").innerText =
        data.message || "Oraș invalid";
    return;
}

       const descriereEN = data.weather[0].description;

const descriereRO = traduceriVreme[descriereEN] || descriereEN;

document.getElementById("result").innerText =
    `${data.name}: ${data.main.temp}°C, ${descriereRO}`;

    } catch (err) {
        console.log(err);
    }
}

function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation nu este suportat");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3fe7c095bd8367c8a38436a235befaa8&units=metric`
            );

            const data = await res.json();

            document.getElementById("result").innerText =
                `${data.name}: ${data.main.temp}°C`;

        } catch (err) {
            console.log(err);
        }
    });
}

async function toggleFavorite() {
    console.log("CLICK FAVORITE");
    try {
        const city = document.getElementById("city").value;

        if (!city) {
            alert("Scrie un oraș mai întâi!");
            return;
        }

        const user = auth.currentUser;

        if (!user) {
            alert("Nu ești logat încă! Așteaptă o secundă.");
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        let favorites = [];

        if (docSnap.exists()) {
            favorites = docSnap.data().favorites || [];
        }

        if (favorites.includes(city)) {
            favorites = favorites.filter(c => c !== city);
            alert("Șters din favorite");
        } else {
            favorites.push(city);
            alert("Adăugat la favorite");
        }

        await setDoc(userRef, { favorites });

        renderFavorites();

    } catch (err) {
        console.error(err);
        alert("Eroare: " + err.message);
    }
}
async function renderFavorites() {
    const list = document.getElementById("favoritesList");
    if (!list) return;

    const user = auth.currentUser;

    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    let favorites = [];

    if (docSnap.exists()) {
        favorites = docSnap.data().favorites || [];
    }

    list.innerHTML = "";

    favorites.forEach(city => {
        const li = document.createElement("li");
        li.innerText = city;

        li.onclick = () => {
            document.getElementById("city").value = city;
            getWeather();
        };

        list.appendChild(li);
    });
}

window.renderFavorites = renderFavorites;


window.toggleFavorite = toggleFavorite;

window.getLocation = getLocation;

function toggleTheme() {
    document.body.classList.toggle("dark");
}
window.toggleTheme = toggleTheme;


document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();
});
window.getWeather = getWeather;

/* ================= EXPORT FUNCTIONS ================= */

window.register = register;
window.login = login;
window.logout = logout;
window.goToRegister = goToRegister;
window.goToLogin = goToLogin;