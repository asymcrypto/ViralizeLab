import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🚀 ViralizeLab
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          AI Content Tools Coming Soon!
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem' }}>🐦</div>
            <h3>Twitter Carousel</h3>
            <p>Coming Soon</p>
            <button 
              onClick={() => router.push('/carousel')}
              style={{ 
                width: '100%', 
                background: '#ff6b6b', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Create Now
            </button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem' }}>💼</div>
            <h3>LinkedIn Visuals</h3>
            <p>Coming Soon</p>
            <button style={{ 
                width: '100%', 
                background: '#ccc', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: 'none',
                fontSize: '1rem'
              }} disabled>
              Coming Soon
            </button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem' }}>📊</div>
            <h3>Meeting Summary</h3>
            <p>Coming Soon</p>
            <button style={{ 
                width: '100%', 
                background: '#ccc', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: 'none',
                fontSize: '1rem'
              }} disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
            }
