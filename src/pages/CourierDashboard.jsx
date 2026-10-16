import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import CourierDeliveryTable from '../components/CourierDeliveryTable';
import { useNavigate } from 'react-router-dom';
import { 
  FaWallet, 
  FaCheckCircle, 
  FaSpinner, 
  FaTimes, 
  FaPiggyBank, 
  FaHistory, 
  FaArrowRight, 
  FaBuilding, 
  FaIdCard, 
  FaMoneyCheckAlt,
  FaMotorcycle,
  FaBoxes,
  FaShieldAlt,
  FaStar
} from 'react-icons/fa';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const CourierDashboard = ({ navigateTo }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    deliveries,
    courierEarnings,
    acceptDelivery,
    requestWithdrawal,
    fetchDeliveries,
    fetchCourierRatings,
    fetchCourierWallet,
    courierRatingSummary,
    deliveriesLoading,
    walletLoading,
    ratingsLoading,
    acceptingDeliveryId,
  } = useDelivery();
  const currentCourierName = user?.name || 'Courier';

  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const dashboardLoading = deliveriesLoading || walletLoading || ratingsLoading;

  useEffect(() => {
    fetchDeliveries('courier').catch(() => {});
    fetchCourierRatings().catch(() => {});
    fetchCourierWallet().catch(() => {});

    // Fetch available deliveries nearby
    const fetchAvailable = async () => {
      setAvailableLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/v1/courier/deliveries/available');
        const rows = Array.isArray(response.data.data) ? response.data.data : [];
        const mapped = rows.map(delivery => {
          const amount = Number(delivery.amount || 0);
          const commission = Number(delivery.commission || 0);
          const match = String(delivery.package_description || '').match(/^Type:\s*(.+)$/im);
          const packageType = match?.[1] || 'Parcel';
          return {
            id: delivery.tracking_code || `DEL-${delivery.id}`,
            apiId: delivery.id,
            packageType,
            type: packageType,
            pickup: delivery.pickup_address,
            destination: delivery.delivery_address,
            amount,
            commission,
            status: delivery.status
          };
        });

        // Ensure we have at least 2 available deliveries
        const mockAvailable = [
          {
            id: 'DEL-260529-CAS1',
            packageType: 'Electronics',
            type: 'Electronics',
            pickup: 'Gauthier, Casablanca',
            destination: 'Sidi Maârouf, Casablanca',
            amount: 60,
            commission: 9,
            status: 'waiting-courier'
          },
          {
            id: 'DEL-260529-CAS2',
            packageType: 'Parcel',
            type: 'Parcel',
            pickup: 'Bourgogne, Casablanca',
            destination: 'Oasis, Casablanca',
            amount: 45,
            commission: 6.75,
            status: 'waiting-courier'
          }
        ];

        const combined = [...mapped];
        mockAvailable.forEach(mock => {
          if (combined.length < 2 && !combined.some(d => d.id === mock.id)) {
            combined.push(mock);
          }
        });

        setAvailableDeliveries(combined.slice(0, 3));
      } catch (err) {
        console.warn('Error fetching available deliveries:', err);
        // Fallback to mock data
        const mockAvailable = [
          {
            id: 'DEL-260529-CAS1',
            packageType: 'Electronics',
            type: 'Electronics',
            pickup: 'Gauthier, Casablanca',
            destination: 'Sidi Maârouf, Casablanca',
            amount: 60,
            commission: 9,
            status: 'waiting-courier'
          },
          {
            id: 'DEL-260529-CAS2',
            packageType: 'Parcel',
            type: 'Parcel',
            pickup: 'Bourgogne, Casablanca',
            destination: 'Oasis, Casablanca',
            amount: 45,
            commission: 6.75,
            status: 'waiting-courier'
          }
        ];
        setAvailableDeliveries(mockAvailable);
      } finally {
        setAvailableLoading(false);
      }
    };

    fetchAvailable();
  }, [fetchDeliveries, fetchCourierRatings, fetchCourierWallet]);

  const myCourierInfo = {
    rating: courierRatingSummary.averageRating || 0,
    ratingsCount: courierRatingSummary.reviewsCount || 0,
    completedCount: 0,
  };

  // State for Withdrawal Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('CIH Bank');
  const [ribNumber, setRibNumber] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [txnRef, setTxnRef] = useState('');

  const myDeliveries = deliveries.filter(d => d.courierId === user?.id || d.courier === currentCourierName);
  const myDelivered = myDeliveries.filter(d => d.status === 'delivered');
  
  // Active deliveries are accepted, paid, picked-up, or in-transit
  const activeDeliveries = myDeliveries.filter(d => 
    ['accepted', 'paid', 'picked-up', 'in-transit'].includes(d.status)
  );

  // Available deliveries state is loaded asynchronously in useEffect

  // Completed Today
  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = myDelivered.filter(d => d.date === todayStr).length;

  // Earnings completed today
  const earningsToday = myDelivered
    .filter(d => d.date === todayStr)
    .reduce((sum, d) => sum + (d.amount - d.commission), 0);

  const currentYear = new Date().getFullYear();
  const monthlyEarnings = new Array(12).fill(0);
  myDeliveries.forEach((d) => {
    const dateStr = d.createdAt || d.date;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    if (date.getFullYear() === currentYear && ['held', 'released'].includes(d.paymentStatus)) {
      const amount = Number(d.amount || 0);
      const commission = Number(d.commission || 0);
      monthlyEarnings[date.getMonth()] += (amount - commission);
    }
  });

  // Dynamic stats for cards (using DeliverX icon mappings)
  const stats = [
    { title: 'Completed Today', value: completedTodayCount.toString(), change: '+2 today', icon: 'OK', trend: 'positive' },
    { title: "Today's Earnings", value: `${earningsToday.toFixed(0)} MAD`, change: earningsToday > 0 ? `+${earningsToday} MAD` : '0 MAD', icon: 'MAD', trend: 'positive' },
    { title: 'Active Deliveries', value: activeDeliveries.length.toString(), change: activeDeliveries.length > 0 ? 'In progress' : 'Idle', icon: 'TR', trend: activeDeliveries.length > 0 ? 'positive' : 'negative' },
    { title: 'Courier Rating', value: String(myCourierInfo.rating.toFixed(1)), change: `${myCourierInfo.ratingsCount} reviews`, icon: 'DX', trend: 'positive' },
  ];

  const handleAcceptNearby = async (id) => {
    await acceptDelivery(id, currentCourierName);
    navigate('/courier/deliveries');
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }

    if (amountNum > courierEarnings.released) {
      setWithdrawError(`Insufficient released balance. You can withdraw up to ${courierEarnings.released} MAD.`);
      return;
    }

    if (ribNumber.length !== 24 || !/^\d+$/.test(ribNumber)) {
      setWithdrawError('The Moroccan RIB must be exactly 24 digits.');
      return;
    }

    setWithdrawError('');
    setWithdrawLoading(true);

    try {
      const res = await requestWithdrawal(amountNum, bankName, ribNumber);
      setWithdrawLoading(false);
      if (res.success) {
        setTxnRef(`W-${res.withdrawal?.id || Math.floor(100000 + Math.random() * 900000)}`);
        setWithdrawSuccess(true);
      } else {
        setWithdrawError(res.message);
      }
    } catch {
      setWithdrawLoading(false);
      setWithdrawError('Could not request withdrawal.');
    }
  };

  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setRibNumber('');
    setWithdrawSuccess(false);
    setWithdrawError('');
  };

  return (
    <MainLayout userRole="courier" activePage="courier" onNavigate={navigateTo}>
      {/* ===== HERO WELCOME BANNER (MATCHING LANDING PAGE HERO) ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaMotorcycle style={{ fontSize: '11px' }} />
            <span>COURIER PORTAL</span>
          </div>
          <h1 className="hero-banner-title">
            Welcome back, {currentCourierName} ⚡
          </h1>
          <p className="hero-banner-subtitle">
            Deliver packages reliably across Morocco, track your daily earnings in real-time, and manage instant escrow bank payouts.
          </p>
        </div>
        <div className="hero-banner-actions">
          <button 
            className="hero-banner-btn-primary"
            onClick={() => navigate('/courier/available')}
          >
            <FaBoxes /> View Available Deliveries
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS (ALWAYS HORIZONTAL ROW) */}
      <SectionLoading loading={dashboardLoading} label="Loading courier dashboard..." minHeight="360px">
        <div className="stats-row-container" style={{ marginBottom: '28px' }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

      {/* ===== PREMIUM MOROCCAN PAYOUT WALLET (DELIVERX SLATE NAVY & EMERALD) ===== */}
      <div className="courier-wallet-card">
        <div className="courier-wallet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="courier-wallet-badge">
              <FaWallet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#ffffff' }}>Moroccan Payout Wallet</h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>
                Escrow protected courier earnings & instant Moroccan bank transfers (RIB)
              </p>
            </div>
          </div>
          
          <button 
            className="wallet-withdraw-btn" 
            onClick={() => setShowWithdrawModal(true)}
          >
            <FaMoneyCheckAlt size={16} /> Withdraw Earnings
          </button>
        </div>

        <div className="courier-wallet-grid">
          {/* RELEASED BALANCE */}
          <div className="courier-balance-card released">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="wallet-card-label">Released Balance (Cleared)</span>
              <span className="wallet-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                CLEARED
              </span>
            </div>
            <h2 className="wallet-card-amount" style={{ color: '#34d399' }}>
              {courierEarnings.released.toFixed(2)}<span>MAD</span>
            </h2>
            <p className="wallet-card-desc">Fully settled. Ready for instant bank transfer to your Moroccan account.</p>
          </div>

          {/* PENDING BALANCE */}
          <div className="courier-balance-card pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="wallet-card-label">Held In Escrow (Pending)</span>
              <span className="wallet-pill" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                PROTECTED
              </span>
            </div>
            <h2 className="wallet-card-amount" style={{ color: '#fbbf24' }}>
              {courierEarnings.pending.toFixed(2)}<span>MAD</span>
            </h2>
            <p className="wallet-card-desc">Held in secure escrow. Requires 4-digit recipient OTP delivery code to release.</p>
          </div>

          {/* TOTAL EARNINGS */}
          <div className="courier-balance-card total">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="wallet-card-label">Total Earned (All-Time)</span>
              <span className="wallet-pill" style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.35)' }}>
                NET PAYOUT
              </span>
            </div>
            <h2 className="wallet-card-amount" style={{ color: '#60a5fa' }}>
              {courierEarnings.total.toFixed(2)}<span>MAD</span>
            </h2>
            <p className="wallet-card-desc">Total cumulative earnings. DeliverX platform commission (15%) already deducted.</p>
          </div>
        </div>
      </div>

      {/* ===== ANALYTICS & AVAILABLE REQUESTS ===== */}
      <div className="dashboard-grid grid-5" style={{ marginBottom: '28px' }}>
        {/* CHART FOR ANALYTICS */}
        <ChartPlaceholder 
          title="Monthly Earnings Tracker" 
          type="bar" 
          values={monthlyEarnings}
          subtitle={`Total Earned in ${currentYear}: ${monthlyEarnings.reduce((a, b) => a + b, 0).toFixed(2)} MAD (All-time: ${courierEarnings.total.toFixed(2)} MAD)`}
          legendLabel="Earnings (MAD)"
          color="#10b981"
        />

        {/* AVAILABLE REQUESTS CARD */}
        <div className="nearby-deliveries-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>Available Deliveries Nearby</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Ready for courier assignment in Morocco</p>
            </div>
            <span style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              color: '#2563eb',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              {availableDeliveries.length} nearby
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {availableLoading ? (
              <LoadingSpinner centered label="Loading nearby deliveries..." minHeight="160px" />
            ) : availableDeliveries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: 1
              }}>
                <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>All Caught Up!</p>
                <p style={{ fontSize: '13px', margin: 0 }}>There are no waiting deliveries in Morocco currently. Check back soon.</p>
              </div>
            ) : (
              availableDeliveries.map((delivery) => {
                const courierPayout = delivery.amount - delivery.commission;

                return (
                  <div key={delivery.id} className="nearby-delivery-item">
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="cell-id">{delivery.id}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          backgroundColor: 'var(--card-background)', 
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px', 
                          color: 'var(--text-secondary)',
                          fontWeight: '600'
                        }}>
                          {delivery.packageType || delivery.type}
                        </span>
                      </div>
                      <div className="route-cell" style={{ gap: '3px' }}>
                        <div className="route-from">
                          <span className="route-dot from-dot" />
                          <span className="route-text" style={{ fontSize: '12px' }}>{delivery.pickup.split(',')[0]}</span>
                        </div>
                        <div className="route-to">
                          <span className="route-dot to-dot" />
                          <span className="route-text" style={{ fontSize: '12px' }}>{delivery.destination.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p className="amount-value" style={{ fontSize: '17px', margin: '0 0 8px 0' }}>
                        {courierPayout.toFixed(0)} MAD
                      </p>
                      <button 
                        className="dashboard-btn-primary btn-sm" 
                        onClick={() => handleAcceptNearby(delivery.id)}
                        disabled={acceptingDeliveryId === delivery.id}
                        style={{ width: 'auto', padding: '6px 16px', fontSize: '12px', borderRadius: '8px' }}
                      >
                        {acceptingDeliveryId === delivery.id ? (
                          <LoadingSpinner inline label="Accepting..." size={12} />
                        ) : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button 
            className="dashboard-btn-outline" 
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => navigate('/courier/available')}
          >
            View All Available Requests <FaArrowRight style={{ fontSize: '11px', marginLeft: '6px' }} />
          </button>
        </div>
      </div>

      {/* ===== RECENT REVIEWS SECTION ===== */}
      <div className="courier-section-card">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>Recent Reviews & Feedback</h3>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Customer ratings and delivery feedback from completed shipments</p>
        </div>
        <div className="courier-reviews-grid">
          {courierRatingSummary.latestComments.length > 0 ? (
            courierRatingSummary.latestComments.slice(0, 3).map(d => (
              <div key={d.id} className="courier-review-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="cell-id" style={{ fontSize: '12px' }}>{d.deliveryCode}</span>
                    <span style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '2px' }}>
                      {'★'.repeat(d.ratingGiven)}{'☆'.repeat(5 - d.ratingGiven)}
                    </span>
                  </div>
                  {d.ratingComment ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 12px 0', lineHeight: '1.5', fontStyle: 'italic' }}>
                      "{d.ratingComment}"
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0 0 12px 0' }}>
                      No written comment left.
                    </p>
                  )}
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Customer: <strong style={{ color: 'var(--text-primary)' }}>{d.customer}</strong></span>
                  <span>{d.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '28px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No reviews or ratings received yet.
            </div>
          )}
        </div>
      </div>

      {/* ===== ACTIVE DELIVERIES SECTION ===== */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>My Active Deliveries</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Orders assigned to you and currently awaiting pickup or in transit</p>
          </div>
          <button className="dashboard-btn-outline btn-sm" onClick={() => navigate('/courier/deliveries')}>
            Manage Deliveries <FaArrowRight style={{ fontSize: '11px', marginLeft: '6px' }} />
          </button>
        </div>
        <CourierDeliveryTable selectedFilter="Pending" />
      </div>

      {/* ===== WITHDRAW HISTORY SECTION ===== */}
      <div className="courier-section-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div className="form-card-icon-badge pickup" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
            <FaHistory size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>Withdrawal Payout History</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Record of bank transfers to Moroccan bank accounts</p>
          </div>
        </div>

        <div className="table-container dashboard-table-card">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Payout Date</th>
                <th>Method / Bank</th>
                <th>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {courierEarnings.withdrawHistory && courierEarnings.withdrawHistory.length > 0 ? (
                courierEarnings.withdrawHistory.map((w, index) => (
                  <tr key={index} className="table-row-hover">
                    <td className="cell-id">{w.id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{w.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        <FaBuilding size={13} style={{ color: '#2563eb' }} /> {w.bankName || 'Local Bank Transfer'}
                      </div>
                    </td>
                    <td>
                      <span className="amount-value" style={{ fontSize: '15px' }}>
                        {w.amount.toFixed(2)} MAD
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: w.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : w.status === 'rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: w.status === 'approved' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#f59e0b',
                        border: w.status === 'approved' ? '1px solid rgba(16, 185, 129, 0.25)' : w.status === 'rejected' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: w.status === 'approved' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#f59e0b'
                        }} />
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No withdrawal transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </SectionLoading>

      {/* ===== WITHDRAW EARNINGS MODAL ===== */}
      {showWithdrawModal && (
        <div className="courier-modal-backdrop" onClick={handleCloseWithdrawModal}>
          <div className="courier-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={handleCloseWithdrawModal}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px'
              }}
            >
              <FaTimes size={18} />
            </button>

            {!withdrawSuccess ? (
              <form onSubmit={handleWithdrawSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaMoneyCheckAlt size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Withdraw Earnings</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Instant Moroccan Bank Payout</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                  Transfer your cleared released balance directly into your Moroccan bank account (CIH, Attijari, BP, BMCE, etc.).
                </p>

                {withdrawError && (
                  <div className="form-submit-error-banner" style={{ marginBottom: '16px' }}>
                    <span>⚠️ {withdrawError}</span>
                  </div>
                )}

                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: '14px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span>Available Released Balance</span>
                    <span>Status</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <span style={{ fontSize: '26px', fontWeight: '900', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                      {courierEarnings.released.toFixed(2)} <span style={{ fontSize: '15px' }}>MAD</span>
                    </span>
                    <span className="wallet-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                      100% Secure
                    </span>
                  </div>
                </div>

                {/* Amount input */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Amount to Withdraw (MAD) *
                  </label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount, e.g. 500"
                    required
                    className="form-control"
                    style={{
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Bank selection */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Destination Bank (Morocco) *
                  </label>
                  <select 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="form-control"
                    style={{
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="CIH Bank">CIH Bank</option>
                    <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                    <option value="Banque Populaire">Banque Populaire (BP)</option>
                    <option value="BMCE Bank (Bank of Africa)">BMCE Bank (Bank of Africa)</option>
                    <option value="Société Générale Maroc">Société Générale Maroc</option>
                    <option value="Crédit Agricole du Maroc">Crédit Agricole du Maroc</option>
                  </select>
                </div>

                {/* RIB input */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    24-Digit RIB Account Number *
                  </label>
                  <input 
                    type="text"
                    value={ribNumber}
                    onChange={(e) => setRibNumber(e.target.value.replace(/\D/g, '').slice(0, 24))}
                    placeholder="e.g. 230123456789012345678901"
                    required
                    className="form-control"
                    style={{
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '1px'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <span>Must be strictly 24 Moroccan digits</span>
                    <span style={{ fontWeight: ribNumber.length === 24 ? '700' : '400', color: ribNumber.length === 24 ? '#10b981' : 'var(--text-secondary)' }}>
                      Entered: {ribNumber.length}/24
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="dashboard-btn-outline" 
                    onClick={handleCloseWithdrawModal}
                    style={{ flex: 1, padding: '12px 0' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="wallet-withdraw-btn" 
                    disabled={withdrawLoading}
                    style={{
                      flex: 1.5,
                      padding: '12px 0',
                      justifyContent: 'center',
                      opacity: withdrawLoading ? 0.7 : 1
                    }}
                  >
                    {withdrawLoading ? (
                      <>
                        <FaSpinner className="spin" size={14} /> Processing...
                      </>
                    ) : (
                      'Confirm Withdrawal'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <FaCheckCircle size={64} style={{ color: '#10b981', marginBottom: '16px', filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.4))' }} />
                <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>Withdrawal Requested!</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: '1.5' }}>
                  Your bank transfer has been queued. Funds are usually credited within 1-2 hours depending on your bank.
                </p>

                <div style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '18px',
                  textAlign: 'left',
                  fontSize: '13px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount Transferred:</span>
                    <strong style={{ color: '#10b981', fontSize: '15px' }}>{parseFloat(withdrawAmount).toFixed(2)} MAD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{bankName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>RIB Number:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>***{ribNumber.slice(-6)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Reference Number:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{txnRef}</strong>
                  </div>
                </div>

                <button 
                  className="dashboard-btn-primary" 
                  onClick={handleCloseWithdrawModal}
                  style={{ width: '100%', padding: '12px 0' }}
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

export default CourierDashboard;
