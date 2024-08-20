import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'your_site_url';
const YOUR_SITE_NAME = 'your_site_name';

const systemPrompt = `
Act as an AI assistant with expert knowledge in cardiology. Provide detailed information on cardiovascular diseases, treatments, medications, and lifestyle recommendations. Reference authoritative sources like the American Heart Association, Mayo Clinic, and NIH in your responses. Respond in the language requested by the user.
`;

async function translateText(text, sourceLang, targetLang) {
    // Ensure the API endpoint is correct and the server is configured to handle requests
    const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
        })
    });
    const rawData = await response;
    console.log("rr", rawData)
    const data = await response.json();

    if (!response.ok) {
        console.error('Translation API Error:', data.error);  // More detailed logging
        throw new Error(`Translation API returned an error: ${data.error}`);
    }
    console.log("output", data.translatedText)
    return data.translatedText;
}

export async function POST(req) {
    const data = await req.json();

    console.log('Data received:', data);

    const messagesArray = Array.isArray(data.messages) ? data.messages : [];
    const language = data.language || 'en';
    console.log('message:', messagesArray, 'language:', language);

    const payload = {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'system', content: systemPrompt }, ...messagesArray],
    };
    console.log('payload:', payload);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        const messages = responseData.choices.map(choice => choice.message);
        let messageContent = messages[0].content;

        // if (language !== 'en') {
        //     messageContent = await translateText(messageContent, language);
        // }

        return new NextResponse(messageContent, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Fetch error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
