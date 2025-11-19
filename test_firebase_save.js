// test_firebase_save.js
// Usage:
//   set NETLIFY_URL=https://examshala.netlify.app
//   node test_firebase_save.js
// Or change the NETLIFY_URL variable below.

const fetch = global.fetch || require('node-fetch');

const NETLIFY_URL = process.env.NETLIFY_URL || 'https://examshala.netlify.app';
const endpoint = `${NETLIFY_URL.replace(/\/$/, '')}/.netlify/functions/save-results`;

const sample = {
  examType: 'sampleExam',
  score: 92,
  answers: [1,2,3,4,5],
  duration: 180
};

async function run() {
  console.log('Posting to', endpoint);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample)
    });
    const data = await res.json();
    console.log('Response:', data);
    if (data && (data.stored === 'firebase' || data.stored === 'attempted-firebase')) {
      console.log('✅ Function attempted/persisted to Firebase. Check your Realtime Database at /results.');
    } else {
      console.log('⚠️ Function did not persist to Firebase. Check Netlify logs and ensure FIREBASE_DATABASE_URL is set.');
    }
  } catch (err) {
    console.error('Error calling function:', err.message || err);
  }
}

run();
