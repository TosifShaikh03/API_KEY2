import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
    try {
        const { ocrText } = req.body;

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `
Extract only these fields from the OCR text:
Name:
Expiry (month/year):
Category:

OCR TEXT:
${ocrText}

Return JSON only.
`
                }
            ]
        });

        res.json(JSON.parse(response.choices[0].message.content));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "GPT failed" });
    }
});

export default app;
