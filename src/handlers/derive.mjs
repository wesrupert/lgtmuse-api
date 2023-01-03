import axios from "axios";

const API = process.env.DATAMUSE_API_ENDPOINT;
const WORDS = process.env.DATAMUSE_WORDS_API;

const datamuse = axios.create({
  baseURL: API,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

async function getNextWord(char, prev = undefined) {
  console.log(`request to: Datamuse char: ${char}, prev: ${prev}`);
  try {
    let response = await datamuse.get(WORDS, {
      params: {
        sp: `${char}*`,
        lc: prev,
      },
    });
    console.log(`response from: Datamuse statusCode: ${response.status}`);

    // Intentional 0 falsy, check if empty or error
    if (!response.data.length) {
      console.log(
        "Insufficient data from response, falling back to reduced context"
      );
      const prevWord = prev?.split(" ").pop();
      console.log(`request to: Datamuse char: ${char}, prevWord: ${prevWord}`);
      response = await datamuse.get(WORDS, {
        params: {
          sp: `${char}*`,
          lc: prevWord,
        },
      });
      console.log(`response from: Datamuse statusCode: ${response.status}`);
    }

    // Intentional 0 falsy, check if empty or error
    if (!response.data.length) {
      console.log(
        "Insufficient data from response, falling back to no context"
      );
      console.log(`request to: Datamuse char: ${char}, prevWord: NONE`);
      response = await datamuse.get(WORDS, { params: { sp: `${char}*` } });
      console.log(`response from: Datamuse statusCode: ${response.status}`);
    }

    const words = response.data.sort((w) => w.score);
    console.log(
      `Got words "${words
        .slice(0, 5)
        .map((w) => `${w.word} (score ${w.score})`)
        .join('", "')}", ... (${words.length} words)`
    );

    let sum = 0;
    words.forEach((w) => {
      w.score = sum = w.score + sum;
    });

    const score = Math.floor(Math.random() * sum);
    const word = words.filter((w) => w.score > score)[0];

    console.log(`Chose word "${word.word}" (score: ${word.score})`);
    return word.word;
  } catch (err) {
    console.log("Error", err);
    return "";
  }
}

export const deriveHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `Derive function only accepts GET method, you tried: ${event.httpMethod}`
    );
  }

  const acronym = event.queryStringParameters["acronym"] || "LGTM";

  // All log statements are written to CloudWatch
  console.log(`Derive: Received acronym "${acronym}":`, event);

  const words = [];
  for (const char of acronym.split("")) {
    const word = await getNextWord(char, words.join(" "));
    words.push(word);
  }

  const ret = {
    statusCode: 200,
    body: JSON.stringify({ derived: words.join(" "), words }),
  };

  console.log(
    `response from: ${event.path} statusCode: ${ret.statusCode} body: ${ret.body}`
  );
  return ret;
};
