require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const OneSignal = require('onesignal-node');
const cron = require('node-cron');

// Firebase Admin Setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://information-project1-default-rtdb.firebaseio.com"
});

// OneSignal Client
const oneSignalClient = new OneSignal.Client(
    process.env.ONESIGNAL_APP_ID,
    process.env.ONESIGNAL_API_KEY
);

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Endpoint to schedule notifications
app.post('/schedule-notification', async (req, res) => {
    const { userId, title, message, sendTime } = req.body;

    try {
        const notification = {
            headings: { en: title },
            contents: { en: message },
            include_external_user_ids: [userId],
            send_after: new Date(sendTime).toISOString()
        };

        const response = await oneSignalClient.createNotification(notification);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error("OneSignal Error:", error.body);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cron job to check for 30-min reminders (runs every minute)
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const db = admin.database();
    const snapshot = await db.ref("appointments").once("value");
    const appointments = snapshot.val();

    for (const apptId in appointments) {
        const appt = appointments[apptId];
        const apptTime = new Date(appt.time);
        const thirtyMinsBefore = new Date(apptTime.getTime() - 30 * 60000);

        if (now >= thirtyMinsBefore && now < apptTime) {
            await oneSignalClient.createNotification({
                headings: { en: "⏰ Reminder" },
                contents: { en: "Your appointment starts in 30 minutes!" },
                include_external_user_ids: [appt.userId],
                send_after: now.toISOString()
            });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
