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

    // Log result (in production, save to database)
    console.log('Result saved:', result);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        resultId,
        message: 'Result saved successfully'
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
