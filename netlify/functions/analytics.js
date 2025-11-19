/**
 * Netlify Function: Analytics
 * Endpoint: /.netlify/functions/analytics
 * Method: GET
 * Returns: { totalAttempts, averageScore, examStats }
 */

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // In a real application, fetch from database
    // For now, return placeholder analytics
    
    const analytics = {
      totalAttempts: 0,
      averageScore: 0,
      examStats: {
        dsa: {
          count: 0,
          avgScore: 0,
          totalScore: 0
        },
        web: {
          count: 0,
          avgScore: 0,
          totalScore: 0
        },
        ml: {
          count: 0,
          avgScore: 0,
          totalScore: 0
        },
        database: {
          count: 0,
          avgScore: 0,
          totalScore: 0
        }
      },
      lastUpdated: new Date().toISOString(),
      uptime: `${Math.random() * 100}%`
    };

    console.log('✅ Analytics retrieved');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(analytics)
    };

  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
