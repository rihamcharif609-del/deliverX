import React from 'react';
import { FaEye } from 'react-icons/fa';

const UserTable = ({
  users = [],
  showActions = true,
  onViewUser
}) => {

  const getRoleBadge = (role) => {
    const roleKey = (role || 'sender').toLowerCase();
    const badges = {
      sender: {
        bg: 'rgba(37, 99, 235, 0.12)',
        color: '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.25)',
      },
      courier: {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.25)',
      },
      admin: {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#d97706',
        border: '1px solid rgba(245, 158, 11, 0.25)',
      }
    };

    const current = badges[roleKey] || badges.sender;

    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: current.bg,
        color: current.color,
        border: current.border,
      }}>
        {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusKey = (status || 'active').toLowerCase();
    const isActive = statusKey === 'active';
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
        color: isActive ? '#10b981' : '#64748b',
        border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(100, 116, 139, 0.25)',
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isActive ? '#10b981' : '#64748b'
        }} />
        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
      </span>
    );
  };

  return (
    <div className="table-container dashboard-table-card">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Deliveries</th>
            {showActions && <th style={{ textAlign: 'center' }}>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                No users found.
              </td>
            </tr>
          ) : users.map((user) => (
            <tr key={user.id} className="table-row-hover">
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                  }}>
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={user.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                </div>
              </td>

              <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.email}</td>

              <td>{getRoleBadge(user.role)}</td>

              <td>{getStatusBadge(user.status)}</td>

              <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.joined || 'Recent'}</td>

              <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.deliveries ?? 0}</td>

              {showActions && (
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="dashboard-btn-outline btn-sm"
                    style={{ padding: '4px 12px', fontSize: '12px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    title="View User Details"
                    onClick={() => onViewUser(user)}
                  >
                    <FaEye size={12} /> View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

