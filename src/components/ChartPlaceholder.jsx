import React from 'react';

const ChartPlaceholder = ({ 
  title, 
  type = 'bar', 
  values: customValues, 
  subtitle: customSubtitle,
  legendLabel = 'Revenue (MAD)',
  color = '#2563eb'
}) => {
  if (type === 'bar') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultValues = [45000, 52000, 48000, 58000, 62000, 71000, 68000, 73000, 79000, 82000, 85000, 92000];
    const values = customValues || defaultValues;
    const subtitle = customSubtitle || "January - December 2026";

    const maxValue = Math.max(...values, 1);
    const heightScale = 150 / maxValue;

    return (
      <div className="chart-placeholder-card">
        <div className="chart-header">
          <div className="chart-title">
            <h3>{title || 'Monthly Deliveries'}</h3>
            <p>{subtitle}</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div 
                className="legend-color-dot"
                style={{ backgroundColor: color }}
              ></div>
              <span>{legendLabel}</span>
            </div>
          </div>
        </div>

        <div className="chart-bars-wrapper">
          {months.map((month, index) => {
            const barHeight = Math.max(values[index] * heightScale, 6);
            return (
              <div key={month} className="bar-container">
                <div 
                  className="chart-bar"
                  title={`${values[index].toFixed(2)} MAD`}
                  style={{ 
                    height: `${barHeight}px`,
                    background: `linear-gradient(180deg, ${color} 0%, #3b82f6 100%)`,
                  }}
                />
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
      <div className="chart-placeholder-card">
        <div className="chart-header">
          <div className="chart-title">
            <h3>{title || 'Delivery Status Distribution'}</h3>
            <p>Current month</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
          <div style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%',
            background: 'conic-gradient(#2563eb 0% 45%, #10b981 45% 70%, #f59e0b 70% 85%, #ef4444 85% 100%)',
            boxShadow: '0 8px 24px rgba(37,99,235,0.2)'
          }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div className="legend-item"><div className="legend-color-dot" style={{background: '#2563eb'}}></div><span>Pending (45%)</span></div>
          <div className="legend-item"><div className="legend-color-dot" style={{background: '#10b981'}}></div><span>In Transit (25%)</span></div>
          <div className="legend-item"><div className="legend-color-dot" style={{background: '#f59e0b'}}></div><span>Delivered (15%)</span></div>
          <div className="legend-item"><div className="legend-color-dot" style={{background: '#ef4444'}}></div><span>Cancelled (15%)</span></div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChartPlaceholder;