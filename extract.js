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
OCR Text:
${ocrText}

Extract only:
- Name
- Expiry (month/year)
- Category
Return JSON only.
`
                }
            ]
        });

        res.json(JSON.parse(response.choices[0].message.content));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI Failed" });
    }
});

export default app;
