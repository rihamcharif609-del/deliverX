import React from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
  const { id } = useParams();

  // fake data for now
  const user = {
    id,
    name: 'Riham Charif',
    email: 'riham@gmail.com',
    phone: '+212 600000000',
    role: 'courier',
    status: 'active',
    joinDate: '2026-05-01',
    avatar: 'https://i.pravatar.cc/150?img=5',

    stats: {
      totalDeliveries: 45,
      completed: 38,
      pending: 5,
      cancelled: 2,
      earnings: 3200,
      rating: 4.8
    },

    verification: {cin: true,
      driverLicense: true,
      profileCompleted: true,
      approved: false
    },

    recentDeliveries: [
      {
        id: 'DEL001',
        status: 'delivered',
        date: '2026-05-04',
        amount: 120
      },
      {
        id: 'DEL002',
        status: 'pending',
        date: '2026-05-05',
        amount: 80
      }
    ]
  };

  return (
    <MainLayout userRole="admin" activePage="/admin/users" 
  >
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>User Details</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete information about this user
        </p>
      </div>

      {/* USER INFO */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img
            src={user.avatar}
            alt="avatar"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />

          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>
              <strong>Role:</strong> {user.role}
              </p>
            <div style={{ marginTop: '10px' }}>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-3" style={{ gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <h3>Total Deliveries</h3>
          <h1>{user.stats.totalDeliveries}</h1>
        </div>

        <div className="card">
            <h3>Completed</h3>
          <h1>{user.stats.completed}</h1>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <h1>{user.stats.pending}</h1>
        </div>

        <div className="card">
          <h3>Cancelled</h3>
          <h1>{user.stats.cancelled}</h1>
        </div>

        <div className="card">
            <h3>Earnings</h3>
          <h1>${user.stats.earnings}</h1>
        </div>

        <div className="card">
          <h3>Rating</h3>
          <h1>{user.stats.rating} ⭐</h1>
        </div>
      </div>

      {/* VERIFICATION */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Verification</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p>CIN Verified: {user.verification.cin ? '✅' : '❌'}</p>
          <p>Driver License: {user.verification.driverLicense ? '✅' : '❌'}</p>
          <p>Profile Completed: {user.verification.profileCompleted ? '✅' : '❌'}</p>
          <p>Approved: {user.verification.approved ? '✅' : '❌'}</p>
        </div>
      </div>

      {/* RECENT DELIVERIES */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Deliveries</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Date</th>
              <th>Amount</th>
              </tr>
          </thead>

          <tbody>
            {user.recentDeliveries.map((delivery) => (
              <tr key={delivery.id}>
                <td>{delivery.id}</td>
                <td>
                  <StatusBadge status={delivery.status} />
                </td>
                <td>{delivery.date}</td>
                <td>${delivery.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      {/* ACTIONS */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button className="btn btn-primary">
          Approve Account
        </button>

        <button className="btn btn-outline">
          Edit User
        </button>

        <button className="btn btn-danger">
          Suspend User
        </button>
      </div>
    </MainLayout>
    );
};

export default UserDetails;
