import React from 'react';

const ChartPlaceholder = ({ title, type = 'bar' }) => {
  if (type === 'bar') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = [45000, 52000, 48000, 58000, 62000, 71000, 68000, 73000, 79000, 82000, 85000, 92000];

    return (
      <div className="chart-placeholder">
        <div className="chart-header">
          <div className="chart-title">
            <h3>{title || 'Monthly Deliveries'}</h3>
            <p>January - December 2024</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color blue"></div>
              <span>Deliveries</span>
            </div>
          </div>
        </div>
        <div className="chart-bars">
          {months.map((month, index) => (
            <div key={month} className="bar-container">
              <div 
                className="bar" 
                style={{ height: `${(values[index] / 100000) * 180}px` }}
              ></div>
              <span className="bar-label">{month}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="chart-placeholder">
        <div className="chart-header">
          <div className="chart-title">
            <h3>{title || 'Delivery Status Distribution'}</h3>
            <p>Current month</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
          <div style={{ 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%',
            background: 'conic-gradient(#2563eb 0% 45%, #10b981 45% 70%, #f59e0b 70% 85%, #ef4444 85% 100%)'
          }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <div className="legend-item"><div className="legend-color blue"></div><span>Pending (45%)</span></div>
          <div className="legend-item"><div className="legend-color" style={{background: '#10b981'}}></div><span>In Transit (25%)</span></div>
          <div className="legend-item"><div className="legend-color" style={{background: '#f59e0b'}}></div><span>Delivered (15%)</span></div>
          <div className="legend-item"><div className="legend-color" style={{background: '#ef4444'}}></div><span>Cancelled (15%)</span></div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChartPlaceholder;