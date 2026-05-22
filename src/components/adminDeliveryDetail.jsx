import React from 'react';

const AdminDeliveryDetail = ({ delivery, onClose }) => {
  if (!delivery) return null;

  return (
    <div style={overlayStyle} >
      <div style={modalStyle}>
        <h2>Delivery Details</h2>

<hr />
<p><strong>Customer:</strong> {delivery.customer}</p>
<p><strong>Phone:</strong> {delivery.phone}</p>
<p><strong>Address:</strong> {delivery.address}</p>
<div style={{ border: '1px solid #eee', borderRadius: '8px' }}>
  <p><strong>Courier:</strong> {delivery.Courier}</p>
  <p>⭐ 4.8 rating</p>
</div>


<h3>Items</h3>
<hr />
<ul>
  {delivery.items?.map((item, i) => (
    <li key={i}>{item.name} x{item.qty}</li>
  ))}
</ul>

<h3>Price</h3>
<hr />

<p><strong>Total:</strong> ${delivery.total}</p>
<p><strong>Payment:</strong> {delivery.paymentMethod}</p>
<p><strong>Status:</strong> {delivery.status}</p>
<p><strong>Notes:</strong> {delivery.notes}</p>

<h3>Tracking</h3>
<hr />
{delivery.timeline?.map((t, i) => (
  <div key={i} style={{ marginBottom: '10px' }}>
    <strong>{t.step}</strong> - {t.date}
  </div>
))}

<a 
  href={`https://www.google.com/maps?q=${delivery.address}`} 
  target="_blank"
>
  View on Map
</a>


<div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
  <button className="btn btn-primary" onClick={onClose}>Cancel</button>
  <a href={`tel:${delivery.phone}`} className="btn btn-outline">
  Call Client
</a>
</div>
      </div>
    </div>

  

  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '600px',
  padding: '30px'
};

export default AdminDeliveryDetail;
