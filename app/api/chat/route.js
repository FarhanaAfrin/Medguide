import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses

// Replace with your OpenRouter API key and site details
const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'your_site_url';
const YOUR_SITE_NAME = 'your_site_name';

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Act as an AI assistant with expert knowledge about medical information and healthcare. Whenever you provide information, reference details from authoritative sources like the Mayo Clinic, the National Institutes of Health (NIH), or the World Health Organization (WHO). Answer user questions with accurate and helpful medical advice, including details about symptoms, treatments, medications, and other related topics, as if you are drawing knowledge from these trusted sources. If you believe the question does not pertain to medical knowledge or healthcare, apologize and explain that you can only answer questions related to medical and health topics.
`
// POST function to handle incoming requests
export async function POST(req) {
    const data = await req.json(); // Parse the JSON body of the incoming request

    // Log data for debugging
    console.log('Data received:', data);

    // Validate that data is iterable
    const messagesArray = Array.isArray(data.messages) ? data.messages : [];
    console.log('message:', messagesArray);

    // Create the request payload
    const payload = {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'system', content: systemPrompt }, ...messagesArray], // Include the system prompt and user messages
    };
    console.log('payload:', payload);

    try {
        // Send a POST request to the OpenRouter API
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

        // Parse the JSON body of the response
        const responseData = await response.json();

        // Assuming the relevant message content is in a predictable part of the responseData
        const messages = responseData.choices.map(choice => choice.message);

        const messageContent = messages[0].content;

        // Send the response without quotes
        return new NextResponse(messageContent, {
            headers: { 'Content-Type': 'text/plain' }
        });

    } catch (err) {
        console.error('Fetch error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}