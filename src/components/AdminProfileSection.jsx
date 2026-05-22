{/* ================= ADMIN PROFILE SECTION ================= */}

const AdminProfileSection = () => {
  return (
    <div className="card">

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '30px',
        }}
      >

        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
          }}
        >
          A
        </div>

        <div>
          <h2>Admin John</h2>

          <p style={{ color: 'gray', marginTop: '5px' }}>
            System Administrator
          </p>

          <p style={{ color: '#16a34a', marginTop: '8px' }}>
            ● Active
          </p>
        </div>

      </div>

      <div className="grid grid-2" style={{ gap: '20px' }}>

        <div>
          <p style={{ color: 'gray' }}>Email</p>
          <strong>admin@deliverx.com</strong>
        </div>

        <div>
          <p style={{ color: 'gray' }}>Phone</p>
          <strong>+1 555-123-456</strong>
        </div>

        <div>
          <p style={{ color: 'gray' }}>Role</p>
          <strong>Administrator</strong>
        </div>

        <div>
          <p style={{ color: 'gray' }}>Joined</p>
          <strong>Jan 2026</strong>
        </div>

      </div>

    </div>
  );
};

export default AdminProfileSection;