import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

// Helper to initialize Groq client lazily
const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is missing. Please check your .env file.');
    }
    return new Groq({ apiKey });
};

// Chat endpoint with streaming support
router.post('/chat', async (req, res) => {
    try {
        const { messages, model } = req.body;
        const groq = getGroqClient();

        const completion = await groq.chat.completions.create({
            messages,
            model: model || 'llama-3.3-70b-versatile',
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error: any) {
        console.error("Groq Chat Error:", error);
        res.status(500).json({ error: error.message || 'Failed to process chat request' });
    }
});

// Recommendations endpoint
router.post('/recommendations', async (req, res) => {
    try {
        const { prompt } = req.body;
        const groq = getGroqClient();

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        res.json({ content });

    } catch (error: any) {
        console.error("Groq Recommendations Error:", error);
        res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
    }
});

export default router;
