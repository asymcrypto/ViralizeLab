import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CarouselGenerator() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [carousel, setCarousel] = useState(null);
  const router = useRouter();

  const generateCarousel = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();
      setCarousel(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate carousel. Check your API key.');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => router.push('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🐦 Twitter Carousel Generator
        </h1>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your YouTube URL, article link, or any content here..."
            style={{
              width: '100%',
              height: '120px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '1rem',
              color: '#333',
              marginBottom: '1rem'
            }}
          />
          
          <button
            onClick={generateCarousel}
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Generating Carousel...' : '✨ Generate Carousel'}
          </button>
        </div>

        {carousel && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '12px'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Your Carousel:</h2>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
              {carousel.slides.map((slide, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    color: '#333',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    minWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {slide.emoji}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
                    {slide.title}
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                    {slide.point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
