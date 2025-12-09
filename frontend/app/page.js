import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Reacher MVP</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>Marketplace & Service Platform</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#667eea', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Get Started
          </Link>
          <Link href="/login" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid white' }}>
            Sign In
          </Link>
          <Link href="/products" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid white' }}>
            Browse Products
          </Link>
        </div>

        <div style={{ marginTop: '3rem', fontSize: '0.9rem', opacity: 0.8 }}>
          <p>✨ Complete marketplace platform with authentication, products, messaging, and reviews</p>
          <p>🚀 Production-ready microservices architecture</p>
          <p>🔐 Secure, scalable, and enterprise-grade</p>
        </div>
      </div>
    </div>
  );
}
