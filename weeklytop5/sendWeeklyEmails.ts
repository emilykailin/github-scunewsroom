import sgMail from '@sendgrid/mail';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// ✅ Load .env
import 'dotenv/config';

console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);

// ✅ Set up Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getFirestore();

// ✅ Set up SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// ✅ Define Email Content
const generateEmailHtml = () => `
  <h1>This Week's Top 5 Events</h1>
  <p>Curated for you by SCU Newsroom.</p>
`;

// ✅ Main Function
async function sendEmails() {
  const usersRef = collection(db, 'users');
  const usersSnap = await getDocs(usersRef);

  const emails = usersSnap.docs.map((doc) => doc.data().email).filter(Boolean);

  for (const email of emails) {
    try {
      await sgMail.send({
        to: email,
        from: 'scunewsroom@gmail.com', // Must be a verified sender
        subject: 'Your Weekly Top 5',
        text: 'Check out the events curated for you this week!',
        html: generateEmailHtml(),
      });
      console.log(`✅ Sent email to ${email}`);
    } catch (err: any) {
      console.error(`❌ Failed to send email to ${email}`, err.response?.body || err.message);
    }
  }
}

sendEmails();

