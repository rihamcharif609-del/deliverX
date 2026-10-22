import React from 'react';
import { FaEye, FaBan, FaCheckCircle } from 'react-icons/fa';

const formatSuspensionExpiry = (expiry) => {
  if (!expiry) return null;
  try {
    const d = new Date(expiry);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

const UserTable = ({
  users = [],
  showActions = true,
  onViewUser,
  onSuspendUser,
  onUnsuspendUser,
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

  const getStatusBadge = (userOrStatus) => {
    const statusVal = typeof userOrStatus === 'object' ? userOrStatus.status : userOrStatus;
    const statusKey = (statusVal || 'active').toLowerCase();
    const isSuspended = statusKey === 'suspended';
    const isActive = statusKey === 'active';
    const suspendedUntil = typeof userOrStatus === 'object' ? userOrStatus.suspended_until : null;
    const expiryFormatted = formatSuspensionExpiry(suspendedUntil);

    if (isSuspended) {
      return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ef4444'
            }} />
            Suspended
          </span>
          {expiryFormatted ? (
            <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600', paddingLeft: '4px' }}>
              Until {expiryFormatted}
            </span>
          ) : suspendedUntil === null && isSuspended ? (
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>
              Indefinite
            </span>
          ) : null}
        </div>
      );
    }

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
          ) : users.map((user) => {
            const isSuspended = user.status === 'suspended';
            const isManageable = user.role !== 'admin';

            return (
              <tr key={user.id} className="table-row-hover">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isSuspended 
                        ? 'linear-gradient(135deg, #ef4444, #f87171)'
                        : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '13px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: isSuspended
                        ? '0 2px 8px rgba(239, 68, 68, 0.25)'
                        : '0 2px 8px rgba(37, 99, 235, 0.2)'
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
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                      {isSuspended && user.suspension_reason && (
                        <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.suspension_reason}>
                          Reason: {user.suspension_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.email}</td>

                <td>{getRoleBadge(user.role)}</td>

                <td>{getStatusBadge(user)}</td>

                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.joined || 'Recent'}</td>

                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.deliveries ?? 0}</td>

                {showActions && (
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="dashboard-btn-outline btn-sm"
                        style={{ padding: '4px 10px', fontSize: '12px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="View User Details"
                        onClick={() => onViewUser && onViewUser(user)}
                      >
                        <FaEye size={12} /> View
                      </button>

                      {isManageable && isSuspended && onUnsuspendUser && (
                        <button
                          type="button"
                          className="dashboard-btn-outline btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            width: 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#10b981',
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)'
                          }}
                          title="Reactivate Account"
                          onClick={() => onUnsuspendUser(user)}
                        >
                          <FaCheckCircle size={11} /> Unsuspend
                        </button>
                      )}

                      {isManageable && !isSuspended && onSuspendUser && (
                        <button
                          type="button"
                          className="dashboard-btn-outline btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            width: 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.35)',
                            backgroundColor: 'rgba(239, 68, 68, 0.06)'
                          }}
                          title="Suspend Account"
                          onClick={() => onSuspendUser(user)}
                        >
                          <FaBan size={11} /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
