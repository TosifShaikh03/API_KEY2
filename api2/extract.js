const OpenAI = require("openai");

module.exports = async function (req, res) {
    // ----------------- CORS -----------------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // ----------- READ RAW BODY (Vercel fix) ----------
        let raw = "";
        await new Promise(resolve => {
            req.on("data", chunk => raw += chunk);
            req.on("end", resolve);
        });

        const body = JSON.parse(raw || "{}");
        const ocrText = body.ocrText;

        console.log("OCR RECEIVED:", ocrText);

        // -------------- GPT-4o mini -----------------
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `
Extract:
- Name
- Expiry (month/year)
- Category

OCR:
${ocrText}

Return JSON only.
`
                }
            ]
        });

        const output = completion.choices[0].message.content;

        res.status(200).json(JSON.parse(output));

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ error: "AI processing failed" });
    }
};
