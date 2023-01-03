export const deriveHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`Derive function only accepts GET method, you tried: ${event.httpMethod}`);
    }
    
    const acronym = event.queryStringParameters['acronym'] || 'LGTM';

    // All log statements are written to CloudWatch
    console.info(`Received acronym "${acronym}":`, event);

    const response = {
        statusCode: 200,
        body: JSON.stringify({ acronym: acronym }),
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
