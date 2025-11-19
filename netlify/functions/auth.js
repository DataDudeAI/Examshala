/**
 * Netlify Function: Admin Authentication
 * Endpoint: /.netlify/functions/auth
 * Method: POST
 * Body: { password }
 * Returns: { success: boolean, token: string }
 */

const crypto = require('crypto');

// Store for session tokens (in production, use database)
const sessionTokens = new Map();

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const { password } = data;

    // Get admin password from environment variable or use default
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Validate password
    if (password === adminPassword) {
      // Create JWT token (simplified - in production, use proper JWT library)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Store token (in production, use database with TTL)
      sessionTokens.set(token, {
        createdAt: new Date(),
        expiresAt,
        ip: event.headers['x-forwarded-for'] || event.headers['client-ip']
      });

      console.log('✅ Admin authenticated successfully');

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          token,
          expiresAt: expiresAt.toISOString(),
          message: 'Authentication successful'
        })
      };
    } else {
      console.warn('❌ Invalid admin password attempt');
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid password'
        })
      };
    }

  } catch (error) {
    console.error('Error during authentication:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

/**
 * Verify token (helper function)
 */
function verifyToken(token) {
  if (!sessionTokens.has(token)) {
    return false;
  }

  const session = sessionTokens.get(token);
  if (new Date() > session.expiresAt) {
    sessionTokens.delete(token);
    return false;
  }

  return true;
}
