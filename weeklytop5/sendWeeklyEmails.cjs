const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const sgMail = require('@sendgrid/mail');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = getFirestore();

// Load SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { Timestamp } = require('firebase-admin/firestore');

// Helper to get this week’s date range
function getStartAndEndOfWeek() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  end.setDate(start.getDate() + 6); // Saturday
  end.setHours(23, 59, 59, 999);
  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
  };
}

// Fetch posts within this week
const fetchRelevantPosts = async () => {
  const { start } = getStartAndEndOfWeek();
  const postsSnapshot = await db
    .collection('posts')
    .where('eventDate', '>=', start) // get all events from this week forward
    .get();

  return postsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 📧 Generate dynamic email HTML from post data
const generateEmailHTML = (posts = []) => {
  const postsHtml = posts.map(post => {
    const formattedDate = post.createdAt?.toDate
      ? post.createdAt.toDate().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : new Date(post.createdAt).toLocaleDateString();

    return `
      <div style="padding: 20px; border-bottom: 1px solid #ddd;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="120" valign="top" style="padding-right: 20px;">
              ${post.imageUrl
                ? `<img src="${post.imageUrl}" alt="${post.title}" width="120" style="border-radius: 8px; display: block;" />`
                : ''}
            </td>
            <td valign="top" style="font-family: Arial, sans-serif;">
              <h2 style="margin: 0 0 8px 0; color: #000;">${post.title}</h2>
              <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
              ${post.location ? `<p style="margin: 0;"><strong>Location:</strong> ${post.location}</p>` : ''}
              <p style="margin: 8px 0;">${post.content?.slice(0, 200) || ''}...</p>
              <a href="#" style="display: inline-block; margin-top: 10px; background-color: #a82434; color: white; text-decoration: none; padding: 10px 16px; border-radius: 4px;">Learn More</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background-color: #a82434; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">This Week's Top 5 Events</h1>
            <p style="margin-top: 10px;">Curated just for you by SCU Newsroom</p>
          </div>
          ${postsHtml}
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>You’re receiving this email because you subscribed to weekly updates from SCU Newsroom.</p>
            <p>
              <a href="#" style="color: #a82434;">Unsubscribe</a> |
              <a href="#" style="color: #a82434;">Manage Preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// 📬 Send email to all users
const sendWeeklyEmails = async () => {
  try {
    const [usersSnapshot, allPosts] = await Promise.all([
    db.collection('users').where('weeklyTop5', '==', true).get(),
    fetchRelevantPosts(),
  ]);

    const sendEmailPromises = [];

    usersSnapshot.forEach((userDoc) => {
      const user = userDoc.data();
      const userEmail = user.email;
      const userCategories = user.categories || [];

      if (!userEmail) return;

	console.log(`📦 Total posts this week: ${allPosts.length}`);
	console.log(`🔍 User: ${userEmail}, Categories:`, userCategories);

      // 1. Get 2 starred posts
      const userStarredIds = user.starredPosts || [];

      const starredPosts = allPosts
      .filter(post =>
         userStarredIds.includes(post.id)
      )
      .sort((a, b) => b.eventDate.toDate() - a.eventDate.toDate())
      .slice(0, 2);

      // 2. Get 3 category-matching posts, excluding starred
      const matchingPosts = allPosts
        .filter(
        (post) =>
        Array.isArray(post.categories) &&
        post.categories.some((cat) => userCategories.includes(cat)) &&
        !starredPosts.some((star) => star.id === post.id)
      )
        .sort((a, b) => b.eventDate.toDate() - a.eventDate.toDate())
        .slice(0, 3);

      let finalPosts = [...starredPosts, ...matchingPosts];

      // 3. Fallback: if fewer than 5, fill with upcoming events
      if (finalPosts.length < 5) {
         const now = new Date();

         const remainingPosts = allPosts
         .filter(
         post =>
         post.eventDate.toDate() > now &&
         !finalPosts.some((p) => p.id === post.id)
         )
      .sort((a, b) => a.eventDate.toDate() - b.eventDate.toDate())
      .slice(0, 5 - finalPosts.length);

      finalPosts = [...finalPosts, ...remainingPosts];
     }

      console.log(`⭐ Starred: ${starredPosts.length}, 🎯 Matching: ${matchingPosts.length}`);
      console.log(`📥 Final post count (after fallback): ${finalPosts.length}`);


      const htmlContent = generateEmailHTML(finalPosts);

      const msg = {
        to: userEmail,
        from: 'scunewsroom@gmail.com',
        subject: 'Your Weekly Top 5',
        html: htmlContent,
      };

      sendEmailPromises.push(sgMail.send(msg));
    });

    await Promise.all(sendEmailPromises);
    console.log(`✅ Sent ${sendEmailPromises.length} personalized emails.`);
  } catch (error) {
    console.error('❌ Failed to send emails:', error);
  }
};

sendWeeklyEmails();

