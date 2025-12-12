import OpenAI from "openai";

export default async function handler(req, res) {
    // --------- IMPORTANT: ADD CORS HEADERS ----------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end(); // CORS preflight response
    }

    // -------------------------------------------------
    // Your GPT logic
    // -------------------------------------------------
    try {
        const { ocrText } = req.body;

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const ai = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `
Extract only:
- Name
- Expiry (month/year)
- Category

OCR TEXT:
${ocrText}

Return JSON only.
`
                }
            ]
        });

        const output = ai.choices[0].message.content;

        res.status(200).json(JSON.parse(output));

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ error: "AI processing failed" });
    }
}
