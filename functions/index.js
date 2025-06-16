const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

const openaiKey = functions.config().openai.key;

exports.getGPTRecommendation = onRequest(
  {
    timeoutSeconds: 60,
    memory: "256Mi",
    cpu: 1,
  },
  (req, res) => {
    cors(req, res, async () => {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).send("프롬프트가 비어있습니다.");

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        res.status(200).send(response.data.choices[0].message.content);
      } catch (err) {
        console.error("GPT 호출 실패", err);
        res.status(500).send("GPT 호출 실패");
      }
    });
  }
);
