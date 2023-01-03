const API = `${process.env.OPENAI_API_ENDPOINT}/${process.env.OPENAI_COMPLETIONS_API}`;
const TOKEN = process.env.OPENAI_TOKEN;
const MODEL = process.env.OPENAI_GPT3_MODEL;

export const summarizeHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`Summarize function only accepts GET method, you tried: ${event.httpMethod}`);
    }
    
    const title = event.queryStringParameters['title'] || 'LGTM';

    // All log statements are written to CloudWatch
    console.info(`Received title "${title}":`, event);

    let summary = "Hmm, I'm not sure what this book would be about!";
    try {
        const data = await fetch(API, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': TOKEN,
            }),
            body: JSON.stringify({
                model: MODEL,
                prompt: `Create a fake synopsis for a book with the title: ${title}`,
                max_tokens: 1024,
                temperature: 0.7,
            })
        });
        
        summary = data?.choices?.[0]?.text || summary;
    } catch (err) {
        console.log("Error", err);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(summary),
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
