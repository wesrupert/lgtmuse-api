import axios from "axios";

const API = process.env.OPENAI_API_ENDPOINT;
const TOKEN = process.env.OPENAI_TOKEN;
const COMPLETIONS = process.env.OPENAI_COMPLETIONS_API;
const MODEL = process.env.OPENAI_GPT3_MODEL;

const openai = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
});

export const summarizeHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `Summarize function only accepts GET method, you tried: ${event.httpMethod}`
    );
  }

  const title = event.queryStringParameters["title"] || "LGTM";

  // All log statements are written to CloudWatch
  console.info(`Summarize: Received title "${title}":`, event);

  let summary = "Hmm, I'm not sure what this book would be about!";
  try {
    const response = await openai.post(COMPLETIONS, {
      prompt: `Create a fake synopsis for a book with the title: ${title}`,
      model: MODEL,
      max_tokens: 1024,
      temperature: 0.7,
    });
    console.info(
      `response from: OpenAI statusCode: ${response.status} body: ${response.data}`
    );

    summary = response.data?.choices?.[0]?.text.replace(/^\n*/, "") || summary;
  } catch (err) {
    console.log("Error", err);
  }

  const ret = {
    statusCode: 200,
    body: JSON.stringify({ summary }),
  };

  console.info(
    `response from: ${event.path} statusCode: ${ret.statusCode} body: ${ret.body}`
  );
  return ret;
};
