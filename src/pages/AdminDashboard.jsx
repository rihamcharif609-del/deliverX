import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import DeliveryTable from '../components/DeliveryTable';
import UserTable from '../components/UserTable';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaInfoCircle, 
  FaUndoAlt, 
  FaCheckCircle, 
  FaCoins, 
  FaExchangeAlt, 
  FaHandHoldingUsd, 
  FaTimes, 
  FaSearch, 
  FaFileInvoiceDollar,
  FaSpinner
} from 'react-icons/fa';

const AdminDashboard = ({ setUserRole }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { deliveries, adminAnalytics, refundDelivery } = useDelivery();

  // Search & Filter state for the Payment Monitor Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dispute / Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundError, setRefundError] = useState('');

  // 1. Dynamic Statistics
  const totalOrders = (deliveries || []).length;
  
  // Dynamic stats formatted for cards
  const stats = [
    { title: 'Total Revenue', value: `${(adminAnalytics?.totalRevenue || 0).toFixed(2)} MAD`, change: '+12.5%', icon: '💰', trend: 'positive' },
    { title: 'Platform Profit (15%)', value: `${(adminAnalytics?.platformProfit || 0).toFixed(2)} MAD`, change: '+14.2%', icon: '💼', trend: 'positive' },
    { title: 'Courier Earnings (85%)', value: `${(adminAnalytics?.courierEarnings || 0).toFixed(2)} MAD`, change: '+11.8%', icon: '🚚', trend: 'positive' },
    { title: 'Held in Escrow', value: `${(adminAnalytics?.pendingPayments || 0).toFixed(2)} MAD`, change: 'Locked', icon: '🔒', trend: 'negative' },
    { title: 'Released Payouts', value: `${(adminAnalytics?.releasedPayments || 0).toFixed(2)} MAD`, change: 'Cleared', icon: '🔓', trend: 'positive' },
    { title: 'Refunds Issued', value: `${(adminAnalytics?.refunds || 0).toFixed(2)} MAD`, change: 'Disputed', icon: '↩️', trend: 'negative' },
  ];

  // 2. Filter Deliveries for Payment Monitor Table
  const paymentDeliveries = (deliveries || []).filter(d => {
    if (!d || !d.id) return false;
    const matchesSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.customer && d.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (d.courier && d.courier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'held') matchesStatus = d.paymentStatus === 'held';
    else if (statusFilter === 'released') matchesStatus = d.paymentStatus === 'released';
    else if (statusFilter === 'pending') matchesStatus = d.paymentStatus === 'pending';
    else if (statusFilter === 'refunded') matchesStatus = d.paymentStatus === 'refunded';

    return matchesSearch && matchesStatus;
  });

  const handleOpenRefundModal = (order) => {
    setRefundTargetOrder(order);
    setRefundError('');
    setRefundSuccess(false);
    setShowRefundModal(true);
  };

  const handleProcessRefund = () => {
    if (!refundTargetOrder) return;
    
    setRefundLoading(true);
    setRefundError('');

    setTimeout(() => {
      setRefundLoading(false);
      const res = refundDelivery(refundTargetOrder.id);
      if (res && res.success) {
        setRefundSuccess(true);
        setTimeout(() => {
          setShowRefundModal(false);
          setRefundTargetOrder(null);
          setRefundSuccess(false);
        }, 1500);
      } else {
        setRefundError(res?.message || 'Failed to process refund.');
      }
    }, 1500);
  };

  // Mock static users list
  const recentUsers = [
    { id: 5, name: 'David Wilson', email: 'david.w@example.com', role: 'courier', status: 'active', joined: '2026-02-15', deliveries: 67 },
    { id: 6, name: 'Lisa Anderson', email: 'lisa.a@example.com', role: 'sender', status: 'inactive', joined: '2026-03-01', deliveries: 3 },
    { id: 7, name: 'James Taylor', email: 'james.t@example.com', role: 'courier', status: 'active', joined: '2026-01-05', deliveries: 92 },
    { id: 8, name: 'Maria Garcia', email: 'maria.g@example.com', role: 'sender', status: 'inactive', joined: '2026-04-12', deliveries: 8 },
  ];

  return (
    <MainLayout userRole="admin" activePage="/admin" setUserRole={setUserRole}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>{t('dashboard')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to the DeliverX Admin Financial & Operations Control Panel.</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          borderRadius: '10px',
          color: 'var(--accent)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <FaShieldAlt /> Escrow System: AUTOMATIC RELEASE (via OTP)
        </div>
      </div>

      {/* CORE FINANCIAL ANALYTICS CARDS */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Morocco Gateway Financial Overview</h3>
      </div>
      <div className="grid grid-3" style={{ marginBottom: '20px', gap: '20px' }}>
        {stats.slice(0, 3).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid grid-3" style={{ marginBottom: '30px', gap: '20px' }}>
        {stats.slice(3, 6).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-2" style={{ marginBottom: '30px', gap: '25px' }}>
        <ChartPlaceholder title="Monthly Revenue Growth (MAD)" type="bar" />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Morocco Escrow Funds Allocation</h3>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <div style={{ 
              width: '180px', 
              height: '180px', 
              borderRadius: '50%',
              background: `conic-gradient(#10b981 0% 50%, #facc15 50% 85%, #ef4444 85% 100%)`
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div className="legend-item"><div className="legend-color" style={{background: '#10b981', width: '10px', height: '10px', borderRadius: '2px'}}></div><span style={{fontSize: '11px'}}>Released to Courier (85%)</span></div>
            <div className="legend-item"><div className="legend-color" style={{background: '#facc15', width: '10px', height: '10px', borderRadius: '2px'}}></div><span style={{fontSize: '11px'}}>Admin Commission (15%)</span></div>
            <div className="legend-item"><div className="legend-color" style={{background: '#ef4444', width: '10px', height: '10px', borderRadius: '2px'}}></div><span style={{fontSize: '11px'}}>Disputed / Pending</span></div>
          </div>
        </div>
      </div>

      {/* CORE PAYMENT AND ESCROW MONITOR TABLE */}
      <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>Moroccan Gateway Payment Monitor</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Track customer credit card payments, platform commissions, escrow status, and execute refunds.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '200px'
            }}>
              <FaSearch size={12} color="gray" />
              <input 
                type="text" 
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  marginLeft: '6px',
                  outline: 'none',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  width: '100%'
                }}
              />
            </div>

            {/* Filter Dropdown */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-background)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Escrow Statuses</option>
              <option value="pending">Awaiting Payment</option>
              <option value="held">Held in Escrow</option>
              <option value="released">Released to Courier</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Sender / Courier</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Route</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Paid</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Commission (15%)</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Courier Share (85%)</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Escrow Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Dispute / Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentDeliveries.length > 0 ? (
                paymentDeliveries.map((d) => {
                  const amountVal = typeof d.amount === 'number' ? d.amount : parseFloat(d.amount) || 0;
                  const commission = typeof d.commission === 'number' ? d.commission : (amountVal * 0.15);
                  const courierShare = amountVal - commission;
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Order ID */}
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{d.id}</td>
                      
                      {/* Sender & Courier */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{d.customer || 'John Sender'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Courier: {d.courier || 'Unassigned'}</div>
                      </td>

                      {/* Route */}
                      <td style={{ padding: '14px 12px', fontSize: '11px' }}>
                        <div>{d.pickup ? d.pickup.split(',')[0] : (d.from ? d.from.split(',')[0] : 'N/A')}</div>
                        <div style={{ color: 'gray' }}>→ {d.destination ? d.destination.split(',')[0] : (d.to ? d.to.split(',')[0] : 'N/A')}</div>
                      </td>

                      {/* Total Paid */}
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {amountVal.toFixed(2)} MAD
                      </td>

                      {/* Commission */}
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', color: '#aa3bff' }}>
                        {commission.toFixed(2)} MAD
                      </td>

                      {/* Courier Share */}
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                        {courierShare.toFixed(2)} MAD
                      </td>

                      {/* Escrow Status Badge */}
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: 
                            d.paymentStatus === 'released' ? 'rgba(16, 185, 129, 0.12)' :
                            d.paymentStatus === 'held' ? 'rgba(234, 179, 8, 0.12)' :
                            d.paymentStatus === 'refunded' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: 
                            d.paymentStatus === 'released' ? '#10b981' :
                            d.paymentStatus === 'held' ? '#eab308' :
                            d.paymentStatus === 'refunded' ? '#3b82f6' : '#ef4444'
                        }}>
                          {d.paymentStatus === 'held' ? 'Held in Escrow' : 
                           d.paymentStatus === 'released' ? 'Released' : 
                           d.paymentStatus === 'refunded' ? 'Refunded' : 'Awaiting Payment'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {d.paymentStatus === 'held' ? (
                          <button
                            onClick={() => handleOpenRefundModal(d)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              backgroundColor: 'rgba(239, 68, 68, 0.05)',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <FaUndoAlt size={10} /> Issue Refund
                          </button>
                        ) : d.paymentStatus === 'released' ? (
                          <span style={{ fontSize: '11px', color: 'gray' }}>Settled</span>
                        ) : d.paymentStatus === 'refunded' ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Refunded</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'gray' }}>Awaiting Card</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No payment records found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPERATIONS TABLES SECTION */}
      <div className="grid grid-2" style={{ gap: '25px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>Active Deliveries Status</h3>
            <button className="btn btn-outline" onClick={() => navigate('/admin/deliveries')}>View All</button>
          </div>
          <DeliveryTable showActions={false} deliveries={deliveries.slice(0, 4)} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>Recent Platform Users</h3>
            <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>View All</button>
          </div>
          <UserTable users={recentUsers} showActions={false}/>
        </div>
      </div>

      {/* DISPUTE REFUND CONFIRMATION MODAL */}
      {showRefundModal && refundTargetOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            width: '450px',
            maxWidth: '90%',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowRefundModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <FaTimes size={18} />
            </button>

            {!refundSuccess ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <FaUndoAlt size={20} color="#ef4444" />
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Confirm Dispute Refund</h2>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  You are reversing an escrow payment. Please review the transaction details carefully.
                </p>

                {refundError && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '15px',
                    border: '1px solid rgba(239, 68, 68, 0.15)'
                  }}>
                    {refundError}
                  </div>
                )}

                <div style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '15px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '25px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                    <strong>{refundTargetOrder.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Customer (Sender):</span>
                    <strong>{refundTargetOrder.customer || 'John Sender'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Courier assigned:</span>
                    <strong>{refundTargetOrder.courier || 'Mike Smith'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Refund Amount:</span>
                    <strong style={{ color: '#ef4444', fontSize: '16px' }}>{refundTargetOrder.amount.toFixed(2)} MAD</strong>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  gap: '10px',
                  fontSize: '11px',
                  color: '#b45309',
                  lineHeight: '1.4',
                  marginBottom: '25px'
                }}>
                  <FaInfoCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>SYSTEM ACTION IMPACT:</strong> Refund reverses the escrow deposit. 
                    Deducts <strong>{(refundTargetOrder.amount - (refundTargetOrder.commission || refundTargetOrder.amount * 0.15)).toFixed(2)} MAD</strong> from the courier's pending balance and releases the customer's payment hold. This action is final.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowRefundModal(false)}
                    style={{ flex: 1, padding: '10px 0', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleProcessRefund}
                    disabled={refundLoading}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: '8px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {refundLoading ? (
                      <>
                        <FaSpinner className="spin" size={14} /> Refunding...
                      </>
                    ) : (
                      'Confirm Refund'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <FaCheckCircle size={55} color="#4ade80" style={{ marginBottom: '15px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Refund Successful</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  The amount of <strong>{refundTargetOrder.amount.toFixed(2)} MAD</strong> has been successfully returned to the customer. Escrow funds have been reversed.
                </p>

                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowRefundModal(false)}
                  style={{ width: '100%', padding: '10px 0', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminDashboard;