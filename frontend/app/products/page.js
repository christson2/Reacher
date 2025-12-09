import Link from 'next/link';

export default function Products() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Products</h1>
          <p style={{ color: '#666' }}>Browse our marketplace</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#667eea', textDecoration: 'none', marginRight: '1rem' }}>← Back Home</Link>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Products will be loaded from the API</p>
          <p style={{ color: '#999', marginTop: '1rem' }}>Ensure the API server is running on port 5003</p>
        </div>
      </div>
    </div>
  );
}
