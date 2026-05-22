import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Navbar */}
      <nav style={{
        backgroundColor: 'var(--card-background)',
        padding: '20px 40px',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '28px' }}>DeliverX</h1>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Features</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>How it Works</a>
          <a href="#contact" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Contact</a>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('login')}
          >
            Login
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('register')}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    minHeight: "80vh", // bach t-khd ness l-page l'foqaniya
    padding: "0 5%",
    gap: "40px" 
}}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px', lineHeight: '1.2' }}>
              Fast, Reliable Package<br />Delivery Platform
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Contact us for a quote on our fast, reliable package delivery platform.
            </p>
            <button 
              className="btn btn-primary"
              style={{ padding: '15px 40px', fontSize: '16px' }}
              onClick={() => navigate('register')}
            >
              Get Started
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img 
    src="/delivery.png"
    alt="Delivery"
    style={{ 
        width: "100%",        
        maxWidth: "600px",    
        height: "auto", 
        borderRadius: "20px",
        objectFit: "cover"    
      }}
  />
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section style={{ padding: '60px 40px' }}>
        <div className="container">
          <div className="grid grid-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '48px', color: 'var(--primary-color)' }}>10K+</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Deliveres</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '48px', color: 'var(--primary-color)' }}>$5.99</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Cost per Delivery</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '60px 40px', backgroundColor: 'var(--card-background)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px' }}>
            Everything You Need for Delivery Management
          </h2>
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ marginBottom: '15px' }}>Fast Delivery</h3>
              <p>Deliveries are made within 2 hours of request. Track your deliveries in real-time.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>💰</div>
              <h3 style={{ marginBottom: '15px' }}>Cost per Delivery</h3>
              <p>Compare prices and choose the best option for your needs.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>🚚</div>
              <h3 style={{ marginBottom: '15px' }}>Quick Delivery</h3>
              <p>Get your packages delivered to your doorstep in as little as 1 hour.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How DeliverX Works */}
      <section id="how-it-works" style={{ padding: '60px 40px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '20px' }}>
            How DeliverX Works
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>
            Simple, fast, and efficient delivery service
          </p>
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 20px'
              }}>1</div>
              <h3>Create Request</h3>
              <p>Create a delivery request with all the details you need.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 20px'
              }}>2</div>
              <h3>Check Availability</h3>
              <p>Check the availability of the delivery slots.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 20px'
              }}>3</div>
              <h3>Place Order</h3>
              <p>Place your order online or call us for assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '80px 40px', backgroundColor: 'var(--primary-color)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Ready to Get Started?</h2>
          <button 
            className="btn"
            style={{
              backgroundColor: 'white',
              color: 'var(--primary-color)',
              padding: '15px 40px',
              fontSize: '16px'
            }}
            onClick={() => navigate('register')}
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1e293b', color: 'white', padding: '60px 40px 30px' }}>
        <div className="container">
          <div className="grid grid-4" style={{ marginBottom: '40px' }}>
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>DeliverX</h3>
              <p style={{ color: '#94a3b8' }}>Fast, reliable package delivery platform</p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Company</h4>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>About</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Support</h4>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQ</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>Follow Us</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: '#94a3b8' }}>📱</span>
                <span style={{ color: '#94a3b8' }}>💬</span>
                <span style={{ color: '#94a3b8' }}>📧</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '30px', borderTop: '1px solid #334155', color: '#94a3b8' }}>
            <p>Copyright © 2023 DeliverX | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;