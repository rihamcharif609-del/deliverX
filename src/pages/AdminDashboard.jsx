import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import DeliveryTable from '../components/DeliveryTable';
import UserTable from '../components/UserTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  FaSpinner,
  FaStar,
  FaBoxes,
  FaUsers,
  FaArrowRight
} from 'react-icons/fa';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const AdminDashboard = ({ setUserRole }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    deliveries,
    adminAnalytics,
    refundDelivery,
    fetchDeliveries,
    fetchAdminDashboard,
    adminRatingSummary,
    adminWithdrawals,
    fetchAdminWithdrawals,
    decideWithdrawal,
    deliveriesLoading,
    adminDashboardLoading,
    withdrawalsLoading,
  } = useDelivery();

  const dashboardLoading = deliveriesLoading || adminDashboardLoading || withdrawalsLoading;

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDeliveries('admin').catch(() => {});
    fetchAdminDashboard()
      .then((res) => {
        if (res && res.recent_users) {
          setRecentUsers(res.recent_users);
        }
      })
      .catch(() => {});
    fetchAdminWithdrawals().catch(() => {});
  }, [fetchDeliveries, fetchAdminDashboard, fetchAdminWithdrawals]);

  // Search & Filter state for the Payment Monitor Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dispute / Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundError, setRefundError] = useState('');

  // Dynamic stats formatted for cards
  const stats = [
    { title: 'Total Revenue', value: `${(adminAnalytics?.totalRevenue || 0).toFixed(2)} MAD`, change: '+12.5%', icon: 'MAD', trend: 'positive' },
    { title: 'Platform Profit (15%)', value: `${(adminAnalytics?.platformProfit || 0).toFixed(2)} MAD`, change: '+14.2%', icon: 'DX', trend: 'positive' },
    { title: 'Courier Earnings (85%)', value: `${(adminAnalytics?.courierEarnings || 0).toFixed(2)} MAD`, change: '+11.8%', icon: 'TR', trend: 'positive' },
    { title: 'Held in Escrow', value: `${(adminAnalytics?.pendingPayments || 0).toFixed(2)} MAD`, change: 'Locked', icon: 'MAD', trend: 'negative' },
    { title: 'Released Payouts', value: `${(adminAnalytics?.releasedPayments || 0).toFixed(2)} MAD`, change: 'Cleared', icon: 'OK', trend: 'positive' },
    { title: 'Refunds Issued', value: `${(adminAnalytics?.refunds || 0).toFixed(2)} MAD`, change: 'Disputed', icon: 'DX', trend: 'negative' },
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

  const topCouriers = adminRatingSummary.topRatedCouriers.slice(0, 3);
  const worstCouriers = adminRatingSummary.worstRatedCouriers.slice(0, 3);
  const latestReviews = adminRatingSummary.latestReviews.slice(0, 5);
  const _latestWithdrawals = adminWithdrawals.slice(0, 5);

  const getRecentComment = (courierName) => {
    const courierReview = latestReviews.find(
      review => review.courierName === courierName && review.comment
    );
    if (courierReview) {
      return courierReview.comment;
    }
    return null;
  };

  const _handleWithdrawalDecision = async (withdrawalId, status) => {
    try {
      await decideWithdrawal(withdrawalId, status);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not process withdrawal.');
    }
  };

  // Calculate dynamic funds allocation for Escrow Chart
  const releasedVal = (adminAnalytics?.releasedPayments || 0) * 0.85;
  const commissionVal = adminAnalytics?.platformProfit || 0;
  const pendingVal = (adminAnalytics?.pendingPayments || 0) * 0.85;
  const totalActive = releasedVal + commissionVal + pendingVal;

  let pctReleased = 0;
  let pctCommission = 0;
  let pctPending = 0;
  let conicGradientBg = 'conic-gradient(var(--border-color) 0% 100%)';

  if (totalActive > 0) {
    pctReleased = (releasedVal / totalActive) * 100;
    pctCommission = (commissionVal / totalActive) * 100;
    pctPending = (pendingVal / totalActive) * 100;

    conicGradientBg = `conic-gradient(
      #10b981 0% ${pctReleased}%, 
      #2563eb ${pctReleased}% ${pctReleased + pctCommission}%, 
      #ef4444 ${pctReleased + pctCommission}% 100%
    )`;
  }

  return (
    <MainLayout userRole="admin" activePage="/admin" setUserRole={setUserRole}>
      {/* ===== HERO WELCOME BANNER (MATCHING LANDING PAGE HERO) ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>ADMIN CONTROL CENTER</span>
          </div>
          <h1 className="hero-banner-title">
            {t('welcome')}, {user?.name || 'Admin'} 🛡️
          </h1>
          <p className="hero-banner-subtitle">
            Morocco escrow payment gateway oversight, platform financial analytics, real-time delivery supervision, and courier performance.
          </p>
        </div>
        <div className="hero-banner-actions">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: '12px',
            color: '#2563eb',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            <FaShieldAlt /> {t('escrowSystemAutomatic')}
          </div>
        </div>
      </div>

      {/* CORE FINANCIAL ANALYTICS CARDS (HORIZONTAL ROW) */}
      <SectionLoading loading={dashboardLoading} label="Loading admin dashboard..." minHeight="420px">
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            {t('moroccoGatewayFinancialOverview')}
          </h3>
        </div>
        
        <div className="stats-row-container" style={{ marginBottom: '28px' }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* CHARTS & ESCROW ALLOCATION */}
        <div className="admin-analytics-grid">
          <ChartPlaceholder 
            title={t('monthlyRevenueGrowth')} 
            type="bar" 
            values={adminAnalytics?.monthlyRevenue} 
          />
          
          <div className="form-section-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '26px' }}>
            <div className="form-card-header" style={{ marginBottom: '16px', paddingBottom: '14px' }}>
              <div className="form-card-icon-badge pickup">
                <FaCoins />
              </div>
              <div style={{ flex: 1 }}>
                <h3>{t('moroccoEscrowFundsAllocation')}</h3>
                <p>Active deposit distribution across courier payouts, platform fee, and pending hold</p>
              </div>
            </div>

            {/* Donut Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <div style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '50%',
                background: conicGradientBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)'
              }}>
                {/* Inner donut hole */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--card-background)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>Active Funds</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {totalActive.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            </div>

            {/* Legend items */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <div style={{ background: '#10b981', width: '10px', height: '10px', borderRadius: '3px' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Released to Courier: <strong style={{ color: 'var(--text-primary)' }}>{releasedVal.toFixed(2)} MAD</strong> ({pctReleased.toFixed(1)}%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <div style={{ background: '#2563eb', width: '10px', height: '10px', borderRadius: '3px' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Admin Commission (15%): <strong style={{ color: 'var(--text-primary)' }}>{commissionVal.toFixed(2)} MAD</strong> ({pctCommission.toFixed(1)}%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <div style={{ background: '#ef4444', width: '10px', height: '10px', borderRadius: '3px' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Disputed / Pending: <strong style={{ color: 'var(--text-primary)' }}>{pendingVal.toFixed(2)} MAD</strong> ({pctPending.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP RATED COURIERS SHOWCASE */}
        <div className="form-section-card" style={{ marginBottom: '28px' }}>
          <div className="form-card-header">
            <div className="form-card-icon-badge pickup">
              <FaStar />
            </div>
            <div style={{ flex: 1 }}>
              <h3>Top Rated Couriers</h3>
              <p>Highest performing delivery partners recognized by client ratings and on-time completions</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {topCouriers.map((courier, index) => {
              const recentComment = getRecentComment(courier.name);
              const initials = courier.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={courier.name} className="admin-courier-rank-card">
                  {/* Rank Badge */}
                  <div className={`admin-rank-badge rank-${index + 1}`}>
                    #{index + 1}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '32px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '800',
                      fontSize: '14px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {courier.name}
                      </h4>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {courier.vehicle} • {courier.completedCount || 0} deliveries
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                    <span style={{ color: '#facc15', fontSize: '15px' }}>★</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{courier.averageRating.toFixed(1)}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({courier.reviewsCount || 0} reviews)</span>
                  </div>

                  {recentComment && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      background: 'var(--card-background)',
                      borderRadius: '8px',
                      borderLeft: '3px solid #2563eb',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      "{recentComment}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CORE PAYMENT AND ESCROW MONITOR TABLE */}
        <div className="form-section-card" style={{ marginBottom: '28px' }}>
          <div className="admin-card-header">
            <div className="admin-card-header-left">
              <div className="form-card-icon-badge destination">
                <FaFileInvoiceDollar />
              </div>
              <div>
                <h3 className="admin-card-title">{t('moroccanGatewayPaymentMonitor')}</h3>
                <p className="admin-card-subtitle">{t('paymentMonitorDesc')}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div className="admin-table-search">
                <FaSearch size={13} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  placeholder={t('searchPayments')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <select 
                className="admin-table-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('allEscrowStatuses')}</option>
                <option value="pending">Awaiting Payment</option>
                <option value="held">Held in Escrow</option>
                <option value="released">Released to Courier</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="table-container dashboard-table-card">
            <table className="dashboard-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>{t('orderId')}</th>
                  <th style={{ width: '18%' }}>{t('senderCourier')}</th>
                  <th style={{ width: '16%' }}>{t('route')}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>{t('totalPaid')}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>{t('commission')}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>{t('courierShare')}</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>{t('escrowStatus')}</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>{t('disputeAction')}</th>
                </tr>
              </thead>
              <tbody>
                {paymentDeliveries.length > 0 ? (
                  paymentDeliveries.map((d) => {
                    const amountVal = typeof d.amount === 'number' ? d.amount : parseFloat(d.amount) || 0;
                    const commission = typeof d.commission === 'number' ? d.commission : (amountVal * 0.15);
                    const courierShare = amountVal - commission;
                    return (
                      <tr key={d.id} className="table-row-hover">
                        {/* Order ID */}
                        <td style={{ fontWeight: '700', color: '#2563eb' }}>{d.id}</td>
                        
                        {/* Sender & Courier */}
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {d.customer || 'John Sender'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Courier: {d.courier || 'Unassigned'}
                          </div>
                        </td>

                        {/* Route */}
                        <td style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                            {d.pickup ? d.pickup.split(',')[0] : (d.from ? d.from.split(',')[0] : 'N/A')}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                            → {d.destination ? d.destination.split(',')[0] : (d.to ? d.to.split(',')[0] : 'N/A')}
                          </div>
                        </td> 

                        {/* Total Paid */}
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {amountVal.toFixed(2)} MAD
                        </td>

                        {/* Commission */}
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#8b5cf6' }}>
                          {commission.toFixed(2)} MAD
                        </td>

                        {/* Courier Share */}
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                          {courierShare.toFixed(2)} MAD
                        </td>

                        {/* Escrow Status Badge */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`admin-escrow-badge ${d.paymentStatus || 'pending'}`}>
                            {d.paymentStatus === 'held' ? 'Held in Escrow' : 
                             d.paymentStatus === 'released' ? 'Released' : 
                             d.paymentStatus === 'refunded' ? 'Refunded' : 'Awaiting Payment'}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: 'center' }}>
                          {d.paymentStatus === 'held' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRefundModal(d)}
                              className="admin-refund-btn"
                            >
                              <FaUndoAlt size={10} /> Issue Refund
                            </button>
                          ) : d.paymentStatus === 'released' ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Settled</span>
                          ) : d.paymentStatus === 'refunded' ? (
                            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>Refunded</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Awaiting Card</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No payment records found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* OPERATIONS TABLES SECTION */}
        <div style={{ display: 'grid', gap: '28px', marginBottom: '28px' }}>
          <div className="form-section-card">
            <div className="admin-card-header">
              <div className="admin-card-header-left">
                <div className="form-card-icon-badge package">
                  <FaBoxes />
                </div>
                <div>
                  <h3 className="admin-card-title">{t('recentDeliveriesStatus')}</h3>
                  <p className="admin-card-subtitle">Live status of the latest platform delivery operations</p>
                </div>
              </div>
              <button 
                type="button" 
                className="dashboard-btn-outline btn-sm" 
                onClick={() => navigate('/admin/deliveries')}
                style={{ width: 'auto' }}
              >
                {t('viewAll')} <FaArrowRight size={10} />
              </button>
            </div>
            <DeliveryTable showActions={false} deliveries={deliveries.slice(0, 3)} />
          </div>

          <div className="form-section-card">
            <div className="admin-card-header">
              <div className="admin-card-header-left">
                <div className="form-card-icon-badge schedule">
                  <FaUsers />
                </div>
                <div>
                  <h3 className="admin-card-title">Recent Platform Users</h3>
                  <p className="admin-card-subtitle">Newly registered senders, couriers, and administrators</p>
                </div>
              </div>
              <button 
                type="button" 
                className="dashboard-btn-outline btn-sm" 
                onClick={() => navigate('/admin/users')}
                style={{ width: 'auto' }}
              >
                View All <FaArrowRight size={10} />
              </button>
            </div>
            <UserTable users={recentUsers.slice(0, 3)} showActions={false}/>
          </div>
        </div>

        {/* RATING & QUALITY MONITOR */}
        <div className="dashboard-grid grid-5" style={{ marginBottom: '30px', gap: '24px' }}>
          <div className="form-section-card">
            <div className="form-card-header">
              <div className="form-card-icon-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <FaShieldAlt />
              </div>
              <div style={{ flex: 1 }}>
                <h3>Worst Rated Couriers</h3>
                <p>Couriers requiring performance review or attention</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {worstCouriers.length > 0 ? worstCouriers.map((courier, index) => (
                <div key={courier.courierId || courier.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      #{index + 1} {courier.name}
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {courier.reviewsCount} reviews • {courier.vehicle || 'Courier'}
                    </p>
                  </div>
                  <strong style={{ color: '#ef4444', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                    {courier.averageRating.toFixed(1)} / 5
                  </strong>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No courier ratings found yet.
                </div>
              )}
            </div>
          </div>

          <div className="form-section-card">
            <div className="form-card-header">
              <div className="form-card-icon-badge schedule">
                <FaStar />
              </div>
              <div style={{ flex: 1 }}>
                <h3>Latest Reviews</h3>
                <p>Real-time customer feedback on completed shipments</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latestReviews.length > 0 ? latestReviews.map((review) => (
                <div key={review.id} style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{review.courierName}</strong>
                    <span style={{ color: '#facc15', fontSize: '12px', flexShrink: 0, letterSpacing: '1px' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {review.senderName} on <strong style={{ color: '#2563eb' }}>{review.deliveryCode}</strong> • {review.date || 'Recent'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{review.comment || 'No comment left.'}"
                  </p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No latest reviews found yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionLoading>

      {/* DISPUTE REFUND CONFIRMATION MODAL */}
      {showRefundModal && refundTargetOrder && (
        <div className="courier-modal-backdrop">
          <div className="courier-modal-card" style={{ maxWidth: '480px' }}>
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setShowRefundModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px'
              }}
            >
              <FaTimes size={18} />
            </button>

            {!refundSuccess ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    <FaUndoAlt />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)' }}>Confirm Dispute Refund</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Reversing an escrow payment for order {refundTargetOrder.id}
                    </p>
                  </div>
                </div>

                {refundError && (
                  <div className="form-submit-error-banner" style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    marginBottom: '16px'
                  }}>
                    {refundError}
                  </div>
                )}

                <div style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  margin: '18px 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                    <strong style={{ color: '#2563eb' }}>{refundTargetOrder.id}</strong>
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
                    <strong style={{ color: '#ef4444', fontSize: '17px', fontWeight: '800' }}>
                      {refundTargetOrder.amount.toFixed(2)} MAD
                    </strong>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  gap: '10px',
                  fontSize: '12px',
                  color: '#d97706',
                  lineHeight: '1.45',
                  marginBottom: '24px'
                }}>
                  <FaInfoCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>SYSTEM ACTION IMPACT:</strong> Refund reverses the escrow deposit. 
                    Deducts <strong>{(refundTargetOrder.amount - (refundTargetOrder.commission || refundTargetOrder.amount * 0.15)).toFixed(2)} MAD</strong> from the courier's pending balance and releases the customer's payment hold. This action is final.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    className="dashboard-btn-outline" 
                    onClick={() => setShowRefundModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleProcessRefund}
                    disabled={refundLoading}
                    className="admin-refund-btn"
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      justifyContent: 'center',
                      fontSize: '14px',
                      background: '#ef4444',
                      color: '#ffffff',
                      borderColor: '#ef4444'
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
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <FaCheckCircle size={56} color="#10b981" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Refund Successful
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  The amount of <strong style={{ color: 'var(--text-primary)' }}>{refundTargetOrder.amount.toFixed(2)} MAD</strong> has been successfully returned to the customer. Escrow funds have been reversed.
                </p>

                <button 
                  type="button"
                  className="dashboard-btn-primary" 
                  onClick={() => setShowRefundModal(false)}
                  style={{ width: '100%' }}
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

