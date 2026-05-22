import React from 'react';

const UserTable = ({
  users = [],
  showActions = true,
  onViewUser
}) => {

  const getRoleBadge = (role) => {
    const styles = {
      sender: { backgroundColor: '#e0f2fe', color: '#0369a1' },
      courier: { backgroundColor: '#dcfce7', color: '#166534' },
      admin: { backgroundColor: '#fef9c3', color: '#854d0e' }
    };

    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        ...styles[role]
      }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="table-container">
      <table className="data-table">

        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Deliveries</th>

            {showActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>

              <td>
                <div className="user-cell">
                  <div className="user-avatar-small">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <span className="user-name">{user.name}</span>
                </div>
              </td>

              <td>{user.email}</td>

              <td>{getRoleBadge(user.role)}</td>

              <td>
                <span className={`status-badge ${user.status}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>

              <td>{user.joined}</td>

              <td>{user.deliveries}</td>

              {showActions && (
                <td>
                  <div className="action-buttons">

                    <button
                      className="action-btn view"
                      title="View"
                      onClick={() => onViewUser(user)}
                    >
                      👁️
                    </button>

                    <button className="action-btn edit">
                      ✏️
                    </button>

                    <button className="action-btn disable">
                      🔒
                    </button>

                  </div>
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