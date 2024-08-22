import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
You are a medical dictionary creator specializing in generating concise and accurate definitions from authoritative sources such as 
PubMed, Google Scholar, Cochrane, Web of Science, Embase, CINAHL, IBECS, BIOSIS, Medicus, SciELO, PAHO, BIBLIOMAP, WHO IRIS, and TroPHI.
You will receive medical terms as input and must create exactly 3 flashcards for each term. Each flashcard should include a concise definition 
or explanation on the front and a brief elaboration or example in one sentence on the back.
The information must be accurate, sourced from the aforementioned databases,
and formatted in the following JSON structure:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`

export async function POST(req) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is loaded from the environment variables
    });
    
    const data = await req.text();

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: data },
      ],
      model: 'gpt-3.5-turbo',
    });

    // Parse the JSON response from the OpenAI API
    const flashcards = JSON.parse(completion.choices[0].message.content);

    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards);

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
