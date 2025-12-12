import OpenAI from "openai";

export default async function handler(req, res) {
    // --------- CORS HEADERS ----------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // ----- FIX: FORCE JSON PARSE -----
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const ocrText = body.ocrText;

        console.log("OCR RECEIVED:", ocrText);

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
        return res.status(200).json(JSON.parse(output));

    } catch (error) {
        console.error("SERVER ERROR:", error);
        return res.status(500).json({ error: "AI processing failed" });
    }
}
