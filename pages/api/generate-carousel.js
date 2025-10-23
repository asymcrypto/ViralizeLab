import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert content creator. Create a 3-5 slide Twitter carousel from the given content. Return ONLY JSON format: {slides: [{title: 'Catchy Title', point: 'Key point with emoji 🔥', emoji: '🚀'}]}"
        },
        {
          role: "user",
          content: `Create a Twitter carousel from this: ${content}`
        }
      ],
    });

    const carouselData = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(carouselData);
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to generate carousel' });
  }
}
