import React from 'react';

const ChartPlaceholder = ({ title, type = 'bar', values: customValues, subtitle: customSubtitle }) => {
  if (type === 'bar') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultValues = [45000, 52000, 48000, 58000, 62000, 71000, 68000, 73000, 79000, 82000, 85000, 92000];
    const values = customValues || defaultValues;
    const subtitle = customSubtitle || "January - December 2026";

    // Dynamically scale values so that the max bar height is 160px
    const maxValue = Math.max(...values, 1);
    const heightScale = 160 / maxValue;

    return (
      <div className="chart-placeholder">
        <div className="chart-header">
          <div className="chart-title">
            <h3>{title || 'Monthly Deliveries'}</h3>
            <p>{subtitle}</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color blue"></div>
              <span>Revenue (MAD)</span>
            </div>
          </div>
        </div>
        <div className="chart-bars">
          {months.map((month, index) => {
            const barHeight = values[index] * heightScale;
            return (
              <div key={month} className="bar-container">
                <div 
                  className="bar" 
                  title={`${values[index].toFixed(2)} MAD`}
                  style={{ 
                    height: `${barHeight}px`,
                    transition: 'height 0.3s ease',
                    cursor: 'pointer'
                  }}
                ></div>
                <span className="bar-label">{month}</span>
              </div>
            );
          })}
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