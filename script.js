// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBh6rHxD71E2xm2xov56-c-ADbXC7Vp7MY",
    authDomain: "chat-cd1e2.firebaseapp.com",
    databaseURL: "https://chat-cd1e2-default-rtdb.firebaseio.com",
    projectId: "chat-cd1e2",
    storageBucket: "chat-cd1e2.firebasestorage.app",
    messagingSenderId: "419882320486",
    appId: "1:419882320486:web:3574021dc87c99a8e563a7",
    measurementId: "G-0MNHHHWV05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (message) {
        push(messagesRef, { text: message, timestamp: Date.now() });
        input.value = "";
    }
}

onChildAdded(messagesRef, snapshot => {
    const msg = snapshot.val();
    const li = document.createElement("li");
    li.textContent = msg.text;
    document.getElementById("messages").appendChild(li);
});
