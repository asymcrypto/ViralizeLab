export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  // Simulate AI processing time (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Smart mock that creates relevant carousels based on input
    const userInput = content.toLowerCase();
    
    let carouselData;

    // Different carousel templates based on content type
    if (userInput.includes('startup') || userInput.includes('business')) {
      carouselData = {
        slides: [
          { title: "🚀 Idea Validation", point: "Test your idea with real customers before building anything", emoji: "🎯" },
          { title: "💼 MVP Strategy", point: "Build the smallest possible version that delivers core value", emoji: "⚡" },
          { title: "📈 Growth Hacks", point: "Leverage organic channels before spending on ads", emoji: "📊" },
          { title: "🤝 Team Building", point: "Hire for culture fit and learning ability over just skills", emoji: "👥" },
          { title: "💰 Funding Tips", point: "Bootstrap as long as possible to maintain control", emoji: "💸" }
        ]
      };
    } 
    else if (userInput.includes('ai') || userInput.includes('artificial intelligence')) {
      carouselData = {
        slides: [
          { title: "🤖 AI Revolution", point: "Artificial intelligence is transforming every industry right now", emoji: "⚡" },
          { title: "🚀 Practical Uses", point: "Start with AI tools for writing, design, and data analysis", emoji: "💡" },
          { title: "🎯 Implementation", point: "Integrate AI gradually into your existing workflows", emoji: "🔧" },
          { title: "📈 Future Impact", point: "AI will create new jobs while transforming existing ones", emoji: "🌍" }
        ]
      };
    }
    else if (userInput.includes('programming') || userInput.includes('coding')) {
      carouselData = {
        slides: [
          { title: "💻 Learn Fundamentals", point: "Master basics before jumping to frameworks and libraries", emoji: "📚" },
          { title: "🚀 Build Projects", point: "Create real projects to reinforce your learning", emoji: "🔨" },
          { title: "🤝 Join Community", point: "Contribute to open source and connect with other developers", emoji: "👥" },
          { title: "📈 Keep Learning", point: "Technology evolves fast - continuous learning is essential", emoji: "🎯" }
        ]
      };
    }
    else {
      // Generic success/motivation carousel
      carouselData = {
        slides: [
          { title: "🎯 Define Your Goal", point: "Clear objectives make the journey much easier", emoji: "✨" },
          { title: "🚀 Take Action", point: "Progress comes from consistent daily effort", emoji: "⚡" },
          { title: "📈 Measure Results", point: "Track what works and double down on it", emoji: "💡" },
          { title: "🔄 Iterate & Improve", point: "Success comes from continuous small improvements", emoji: "🔄" },
          { title: "🎉 Celebrate Wins", point: "Acknowledge your progress along the way", emoji: "🌟" }
        ]
      };
    }

    res.status(200).json(carouselData);
    
  } catch (error) {
    console.error('Mock AI Error:', error);
    res.status(500).json({ error: 'Failed to generate carousel' });
  }
          }
