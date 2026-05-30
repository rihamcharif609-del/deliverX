import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{t('features')}</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{t('howItWorks')}</a>
          <a href="#contact" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{t('contact')}</a>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('login')}
          >
            {t('login')}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('register')}
          >
            {t('signUp')}
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
              {t('fastReliableTitle')}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
              {t('fastReliableSubtitle')}
            </p>
            <button 
              className="btn btn-primary"
              style={{ padding: '15px 40px', fontSize: '16px' }}
              onClick={() => navigate('register')}
            >
              {t('readyToGetStarted')}
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
              <p style={{ color: 'var(--text-secondary)' }}>{t('deliveres')}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '48px', color: 'var(--primary-color)' }}>$5.99</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('costperDelivery')}</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '60px 40px', backgroundColor: 'var(--card-background)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px' }}>
            {t('everythingYouNeed')}
          </h2>
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ marginBottom: '15px' }}>{t('fastDelivery')}</h3>
              <p>{t('deliveriesaremade')}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>💰</div>
              <h3 style={{ marginBottom: '15px' }}>{t('costperDelivery')}</h3>
              <p>{t('comparepricesandchoose')}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>🚚</div>
              <h3 style={{ marginBottom: '15px' }}>{t('quickDelivery')}</h3>
              <p>{t('getyourpackagesdelivered')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How DeliverX Works */}
      <section id="how-it-works" style={{ padding: '60px 40px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '20px' }}>
            {t('howDeliverXWorks')}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>
            {t('simplefastandefficient')}
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
              <h3>{t('createRequest')}</h3>
              <p>{t('createadeliveryrequestwithall')}</p>
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
              <h3>{t('CheckAvailability')}</h3>
              <p>{t('Checktheavailabilityof')}</p>
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
              <h3>{t('PlaceOrder')}</h3>
              <p>{t('Placeyourorderonline')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '80px 40px', backgroundColor: 'var(--primary-color)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>{t('readyToGetStarted')}</h2>
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
            {t('signUpNow')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ backgroundColor: '#1e293b', color: 'white', padding: '60px 40px 30px' }}>
        <div className="container">
          <div className="grid grid-4" style={{ marginBottom: '40px' }}>
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>DeliverX</h3>
              <p style={{ color: '#94a3b8' }}>{t('fastReliableTitle')}</p>
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
              <h4 style={{ color: 'white', marginBottom: '15px' }}>{t('followUs')}</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: '#94a3b8' }}>📱</span>
                <span style={{ color: '#94a3b8' }}>💬</span>
                <span style={{ color: '#94a3b8' }}>📧</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '30px', borderTop: '1px solid #334155', color: '#94a3b8' }}>
            <p>{t('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;