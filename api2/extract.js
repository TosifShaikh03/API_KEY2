import OpenAI from "openai";

export default async function handler(req, res) {
    // --------- CORS ---------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // ----- Vercel FIX: force JSON parse -----
        let body = req.body;

        if (!body) {
            const raw = await new Promise(resolve => {
                let data = "";
                req.on("data", chunk => { data += chunk });
                req.on("end", () => resolve(data));
            });
            body = JSON.parse(raw);
        }

        const ocrText = body.ocrText;
        console.log("OCR Received:", ocrText);

        // ----- AI -----
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).json({ error: "AI failed" });
    }
}
