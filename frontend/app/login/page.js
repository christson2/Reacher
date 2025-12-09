import Link from 'next/link';

export default function Login() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>Sign In</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>Email</label>
            <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>Password</label>
            <input type="password" placeholder="Your password" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
          </div>
          
          <button type="submit" style={{ padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.25rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
          Don't have an account? <Link href="/signup" style={{ color: '#667eea', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
