/**
 * Netlify Function: Save Results
 * Endpoint: /.netlify/functions/save-results
 * Method: POST
 * Body: { examType, score, answers, duration }
 *
 * This function will attempt to use the Firebase Admin SDK when a
 * service account is provided via the FIREBASE_SERVICE_ACCOUNT environment variable.
 * If not available it falls back to the REST API (FIREBASE_DATABASE_URL) or logging.
 */

// Lazy-init firebase-admin to reuse between invocations (Netlify keeps warm containers)
let adminInitialized = false;
let admin = null;

async function tryInitAdmin() {
  if (adminInitialized) return;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  try {
    if (svc) {
      const serviceAccount = typeof svc === 'string' ? JSON.parse(svc) : svc;
      // require here so local env without deps won't fail until used
      admin = require('firebase-admin');
      if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      adminInitialized = true;
      console.log('✅ firebase-admin initialized');
    }
  } catch (err) {
    console.warn('⚠️ firebase-admin init failed:', err && err.message ? err.message : err);
    adminInitialized = false;
    admin = null;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    const { examType, score, answers, duration } = data;

    // Validate required fields
    if (!examType || score === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create result object
    const resultId = new Date().getTime();
    const result = {
      id: resultId,
      examType,
      score,
      answers,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent']
    };

    // Prefer firebase-admin when service account is present
    await tryInitAdmin();
    if (admin) {
      try {
        const db = admin.database();
        await db.ref(`results/${resultId}`).set(result);
        console.log('Result persisted to Firebase via firebase-admin:', resultId);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            resultId,
            stored: 'firebase-admin',
            message: 'Result saved to Firebase (admin) successfully'
          })
        };
      } catch (err) {
        console.error('Error writing to Firebase (admin):', err);
        // continue to fallback
      }
    }

    // Try REST API if database URL is configured
    const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_DB_URL;
    if (firebaseDatabaseUrl) {
      try {
        const baseUrl = firebaseDatabaseUrl.replace(/\/$/, '');
        const url = `${baseUrl}/results/${resultId}.json`;
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });
        console.log('Result persisted to Firebase (REST):', url);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            resultId,
            stored: 'firebase-rest',
            message: 'Result saved to Firebase (REST) successfully'
          })
        };
      } catch (err) {
        console.error('Error writing to Firebase (REST):', err);
      }
    }

    // Fallback: Log result (and do not persist if DB not configured)
    console.log('Result received (no Firebase configured or failed):', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        resultId,
        stored: firebaseDatabaseUrl || (admin ? 'firebase-admin' : null) ? 'attempted' : 'log-only',
        message: 'Result received'
      })
    };

  } catch (error) {
    console.error('Error saving result:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
