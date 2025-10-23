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
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert content creator. Create a 3-slide Twitter carousel from the given content. 
          Return ONLY valid JSON format: 
          {"slides": [{"title": "Catchy Title 1", "point": "Key point 1 with emoji 🔥", "emoji": "🚀"}, 
                      {"title": "Catchy Title 2", "point": "Key point 2 with emoji 💡", "emoji": "💡"},
                      {"title": "Catchy Title 3", "point": "Key point 3 with emoji 📈", "emoji": "📈"}]}`
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
