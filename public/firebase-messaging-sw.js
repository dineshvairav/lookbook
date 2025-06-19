
// Import and configure the Firebase SDK
// See: https://firebase.google.com/docs/web/messaging/js-sdk#handle-messages-when-your-web-app-is-in-the-background

// Scripts for Firebase products will be imported on demand from the CDN
// (see https://firebase.google.com/docs/web/setup#simplify-sdk-import)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_NEXT_PUBLIC_FIREBASE_API_KEY", // Replace with your actual config
  authDomain: "YOUR_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_NEXT_PUBLIC_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: payload.notification?.icon || '/logo.png', // Optional: path to an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
