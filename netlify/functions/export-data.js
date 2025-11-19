/**
 * Netlify Function: Export Data
 * Endpoint: /.netlify/functions/export-data
 * Method: GET
 * Query Parameters: ?token=admin_token&format=json|csv
 * Returns: Exported data in requested format
 */

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
    // Check authentication token
    const token = event.queryStringParameters?.token;
    const format = event.queryStringParameters?.format || 'json';

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized - token required' })
      };
    }

    // In production, verify token against database
    // For now, accept any non-empty token

    // Sample data to export
    const exportData = {
      exportDate: new Date().toISOString(),
      results: [],
      analytics: {
        totalAttempts: 0,
        averageScore: 0
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="exampro-export.csv"'
        },
        body: csv
      };
    } else {
      // Return as JSON
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="exampro-export.json"'
        },
        body: JSON.stringify(exportData, null, 2)
      };
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
  const headers = ['Date', 'Exam Type', 'Score', 'Duration'];
  const rows = [headers];

  if (data.results && Array.isArray(data.results)) {
    data.results.forEach(result => {
      rows.push([
        new Date(result.timestamp).toLocaleString(),
        result.examType || 'Unknown',
        result.score || '0',
        result.duration || '0'
      ]);
    });
  }

  return rows.map(row => row.join(',')).join('\n');
}
