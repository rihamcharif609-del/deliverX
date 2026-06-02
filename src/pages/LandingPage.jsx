import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
  background: 'rgba(15, 23, 42, 0.18)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '14px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'fixed',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '92%',
  maxWidth: '1200px',
  zIndex: 1000,
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '22px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.16)'
}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2563eb"/>
            <path d="M6 14 L14 6 L22 14 L18 14 L18 22 L10 22 L10 14 Z" fill="white"/>
          </svg>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>DeliverX</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#features" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color='white'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.75)'}
          >{t('features')}</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '15px', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color='white'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.75)'}
          >{t('howItWorks')}</a>
          <a href="#contact" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '15px', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color='white'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.75)'}
          >{t('contact')}</a>
          <button
            onClick={() => navigate('login')}
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: 'white',
              padding: '9px 22px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.borderColor='white'; e.target.style.background='rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.target.style.borderColor='rgba(255,255,255,0.35)'; e.target.style.background='transparent'; }}
          >{t('login')}</button>
          <button
            onClick={() => navigate('register')}
            style={{
              background: '#2563eb',
              border: 'none',
              color: 'white',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background='#1d4ed8'; e.target.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background='#2563eb'; e.target.style.transform='translateY(0)'; }}
          >{t('signUp')}</button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
  style={{
    minHeight: '100vh',
    backgroundImage:"linear-gradient(to top, rgba(6,9,26,1) 0%, rgba(6,9,26,0.78) 40%, rgba(6,9,26,0.45) 100%), url('/download2.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0',
    position: 'relative',
    overflow: 'hidden'
  }}
>
        {/* Background truck image */}
        
        {/* Gradient overlay */}
        

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '60px 5% 80px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            
            marginBottom: '24px'
          }}>
            
          </div>
          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 80px)',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            maxWidth: '700px',
            marginBottom: '24px'
          }}>
            {t('fastReliableTitle')}
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '500px',
            lineHeight: 1.7,
            marginBottom: '40px'
          }}>
            {t('fastReliableSubtitle')}
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('register')}
              style={{
                background: '#2563eb', color: 'white',
                border: 'none', padding: '16px 36px',
                borderRadius: '10px', fontSize: '16px',
                fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)'
              }}
              onMouseEnter={e => { e.target.style.background='#1d4ed8'; e.target.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background='#2563eb'; e.target.style.transform='translateY(0)'; }}
            >{t('readyToGetStarted')}</button>
            <button
              onClick={() => { document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }) }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: 'white', padding: '16px 36px',
                borderRadius: '10px', fontSize: '16px',
                fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.08)'}
            >{t('howItWorks')} →</button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', gap: '0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(8px)'
        }}>
          {[
            { val: '10K+', label: t('deliveres') },
            { val: '$5.99', label: t('costperDelivery') },
            { val: '2h', label: t('fastDelivery') },
            { val: '99%', label: t('quickDelivery') }
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, padding: '28px 5%',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{stat.val}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHAT WE DELIVER ===== */}
      <section style={{ padding: '100px 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px' }}>
                {t('everythingYouNeed')}
              </h2>
              <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.7, maxWidth: '420px' }}>
                {t('fastReliableSubtitle')}
              </p>
            </div>
            {/* Photo Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '200px 200px', gap: '12px' }}>
              <div style={{
                gridColumn: '1', gridRow: '1',
                borderRadius: '12px', overflow: 'hidden',
                background: '#e2e8f0'
              }}>
                <img src="/Costco.png"
                  alt="delivery" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{
                gridColumn: '2', gridRow: '1 / 3',
                borderRadius: '12px', overflow: 'hidden',
                position: 'relative', background: '#1e3a5f'
              }}>
                <img src="/Blog.png"
                  alt="courier" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}/>
                <div style={{
                  position: 'absolute', bottom: '20px', left: '16px', right: '16px',
                  background: 'rgba(37,99,235,0.9)', borderRadius: '10px',
                  padding: '14px 16px', color: 'white'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{t('fastDelivery')}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{t('deliveriesaremade')}</div>
                </div>
              </div>
              <div style={{
                gridColumn: '1', gridRow: '2',
                borderRadius: '12px', overflow: 'hidden',
                background: '#e2e8f0'
              }}>
                <img src="/moto.png"
                  alt="package" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ padding: '100px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
                HOW IT WORKS
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '16px' }}>
                {t('howDeliverXWorks')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>
                {t('simplefastandefficient')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { num: '01', title: t('createRequest'), desc: t('createadeliveryrequestwithall') },
                { num: '02', title: t('CheckAvailability'), desc: t('Checktheavailabilityof') },
                { num: '03', title: t('PlaceOrder'), desc: t('Placeyourorderonline') },
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '20px', alignItems: 'flex-start',
                  padding: '24px', borderRadius: '14px',
                  background: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    minWidth: '48px', height: '48px',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    borderRadius: '12px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '16px', fontWeight: 800
                  }}>{step.num}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{step.title}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: '100px 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>
              Fast. Simple. Reliable.
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px' }}>{t('simplefastandefficient')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '⚡', title: t('fastDelivery'), desc: t('deliveriesaremade'), color: '#fef3c7', iconBg: '#f59e0b' },
              { icon: '💰', title: t('costperDelivery'), desc: t('comparepricesandchoose'), color: '#dcfce7', iconBg: '#22c55e' },
              { icon: '🚚', title: t('quickDelivery'), desc: t('getyourpackagesdelivered'), color: '#dbeafe', iconBg: '#2563eb' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '32px',
                borderRadius: '16px',
                background: 'white',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'; }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  background: f.color,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px', marginBottom: '20px'
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DARK SERVICES SECTION ===== */}
      <section style={{ padding: '100px 5%', background: 'linear-gradient(160deg, #06091a, #0d1b3e)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: '12px' }}>
            We Go the Extra Mile
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', marginBottom: '60px' }}>{t('simplefastandefficient')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { icon: '🌍', title: 'Nationwide Reach', desc: t('deliveriesaremade') },
              { icon: '📦', title: 'Flexible Delivery', desc: t('comparepricesandchoose') },
              { icon: '↩️', title: 'Easy Return', desc: t('getyourpackagesdelivered') },
              { icon: '🏢', title: 'Built for Business', desc: t('deliveriesaremade') },
              { icon: '⭐', title: 'Highly Rated', desc: t('comparepricesandchoose') },
              { icon: '🔒', title: 'Secure Delivery', desc: t('getyourpackagesdelivered') },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '28px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(37,99,235,0.15)'; e.currentTarget.style.borderColor='rgba(37,99,235,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
              >
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '120px 5%', background: '#2563eb', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}/>
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: '16px' }}>
            {t('readyToGetStarted')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '18px', marginBottom: '40px' }}>
            {t('fastReliableSubtitle')}
          </p>
          <button
            onClick={() => navigate('register')}
            style={{
              background: 'white', color: '#2563eb',
              border: 'none', padding: '18px 52px',
              borderRadius: '12px', fontSize: '17px',
              fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => { e.target.style.transform='translateY(-3px)'; e.target.style.boxShadow='0 16px 48px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'; }}
          >{t('signUpNow')}</button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="contact" style={{ backgroundColor: '#0f172a', color: 'white', padding: '80px 5% 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '60px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="8" fill="#2563eb"/>
                  <path d="M6 14 L14 6 L22 14 L18 14 L18 22 L10 22 L10 14 Z" fill="white"/>
                </svg>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>DeliverX</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, maxWidth: '240px' }}>
                {t('fastReliableTitle')}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {['📱', '💬', '📧'].map((icon, i) => (
                  <div key={i} style={{
                    width: '38px', height: '38px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '16px'
                  }}>{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['About', 'Blog', 'Careers'].map(item => (
                  <li key={item} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color='white'}
                      onMouseLeave={e => e.target.style.color='#64748b'}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['FAQ', 'Contact', 'Privacy Policy'].map(item => (
                  <li key={item} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color='white'}
                      onMouseLeave={e => e.target.style.color='#64748b'}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('followUs')}</h4>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                {t('fastReliableSubtitle')}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: '13px' }}>
            {t('copyright')}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;