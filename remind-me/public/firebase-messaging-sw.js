importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js");

// Firebase Config (same as frontend)
firebase.initializeApp({
    apiKey: "AIzaSyBMJuAmIAqDUXhZcGBHq8CszhJL92VaZ64",
    authDomain: "information-project1.firebaseapp.com",
    projectId: "information-project1",
    storageBucket: "information-project1.appspot.com",
    messagingSenderId: "1098270976013",
    appId: "1:1098270976013:web:2e1ca7602b316b6ed30d44"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log("Background message:", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon.png"
    });
});
