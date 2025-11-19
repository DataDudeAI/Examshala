/**
 * Netlify Function: Save Results
 * Endpoint: /.netlify/functions/save-results
 * Method: POST
 * Body: { examType, score, answers, duration }
 */

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

    // Try to persist to Firebase Realtime Database if configured
    const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_DB_URL;
    if (firebaseDatabaseUrl) {
      try {
        // Ensure no trailing slash
        const baseUrl = firebaseDatabaseUrl.replace(/\/$/, '');
        const url = `${baseUrl}/results/${resultId}.json`;

        // Use fetch (Node 18+ / Netlify runtime provides global fetch)
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });

        console.log('Result persisted to Firebase:', url);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            resultId,
            stored: 'firebase',
            message: 'Result saved to Firebase successfully'
          })
        };
      } catch (err) {
        console.error('Error writing to Firebase:', err);
        // Fall through to return success but note store failure
      }
    }

    // Fallback: Log result (and do not persist if DB not configured)
    console.log('Result saved (no Firebase configured):', result);

    // Return success response (client-side will fallback if needed)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        resultId,
        stored: firebaseDatabaseUrl ? 'attempted-firebase' : 'log-only',
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
