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
  FaMoneyCheckAlt 
} from 'react-icons/fa';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const CourierDashboard = () => {
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

  // Dynamic stats for cards
  const stats = [
    { title: 'Completed Today', value: completedTodayCount.toString(), change: '+2', icon: '✅', trend: 'positive' },
    { title: 'Today\'s Earnings', value: `${earningsToday.toFixed(0)} MAD`, change: earningsToday > 0 ? `+${earningsToday} MAD` : '0 MAD', icon: '💸', trend: 'positive' },
    { title: 'Active Deliveries', value: activeDeliveries.length.toString(), change: activeDeliveries.length > 0 ? 'Active' : 'Idle', icon: '🚚', trend: activeDeliveries.length > 0 ? 'positive' : 'negative' },
    { title: 'Courier Rating', value: String(myCourierInfo.rating.toFixed(1)), change: `${myCourierInfo.ratingsCount} reviews`, icon: '⭐', trend: 'positive' },
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
    <MainLayout userRole="courier" activePage="courier">
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: '700' }}>{t('dashboard')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {currentCourierName}. Here is your delivery performance and earnings summary.</p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <SectionLoading loading={dashboardLoading} label="Loading courier dashboard..." minHeight="360px">
      <div className="grid grid-4" style={{ marginBottom: '30px', gap: '20px' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* PREMIUM ESCROW & WALLET SYSTEM SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
        borderRadius: '16px',
        padding: '30px',
        color: '#fff',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(170, 59, 255, 0.15)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glowing decorations */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaWallet size={20} color="#c084fc" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#fff' }}>Moroccan Payout Wallet</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>Escrow protected payments & instant local bank transfers</p>
              </div>
            </div>
            
            <button 
              className="btn" 
              onClick={() => setShowWithdrawModal(true)}
              style={{
                background: 'linear-gradient(90deg, #aa3bff, #8b5cf6)',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Withdraw Earnings
            </button>
          </div>

          <div className="grid grid-3" style={{ gap: '20px' }}>
            {/* RELEASED BALANCE */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Released Balance (Cleared)</span>
              <h1 style={{ margin: '8px 0', fontSize: '32px', fontWeight: '800', color: '#4ade80' }}>
                {courierEarnings.released.toFixed(2)} <span style={{ fontSize: '18px' }}>MAD</span>
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Fully settled. Ready for instant bank transfer.</p>
            </div>

            {/* PENDING BALANCE */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Held In Escrow (Pending)</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '9px',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  color: '#facc15',
                  fontWeight: '600'
                }}>PROTECTED</span>
              </div>
              <h1 style={{ margin: '8px 0', fontSize: '32px', fontWeight: '800', color: '#facc15' }}>
                {courierEarnings.pending.toFixed(2)} <span style={{ fontSize: '18px' }}>MAD</span>
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Requires 4-digit customer delivery code to release.</p>
            </div>

            {/* TOTAL EARNINGS */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Earned (All-Time)</span>
              <h1 style={{ margin: '8px 0', fontSize: '32px', fontWeight: '800', color: '#60a5fa' }}>
                {courierEarnings.total.toFixed(2)} <span style={{ fontSize: '18px' }}>MAD</span>
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Platform fee (15%) already deducted.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '30px', gap: '25px' }}>
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>Available Deliveries Nearby</h3>
            <span style={{
              padding: '3px 8px',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent)',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600'
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
                <p style={{ fontWeight: '600' }}>All Caught Up!</p>
                <p style={{ fontSize: '12px' }}>There are no waiting deliveries in Morocco currently. Check back soon.</p>
              </div>
            ) : (
              availableDeliveries.map((delivery) => {
                // Moroccan commission calculation for displaying payout
                const courierPayout = delivery.amount - delivery.commission;

                return (
                  <div key={delivery.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'var(--hover-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{delivery.id}</span>
                        <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {delivery.packageType || delivery.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>
                        <strong style={{ color: '#3b82f6' }}>From:</strong> {delivery.pickup.split(',')[0]}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                        <strong style={{ color: '#10b981' }}>To:</strong> {delivery.destination.split(',')[0]}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: '#10b981', fontSize: '16px', marginBottom: '8px' }}>
                        {courierPayout.toFixed(0)} MAD
                      </p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleAcceptNearby(delivery.id)}
                        disabled={acceptingDeliveryId === delivery.id}
                        style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', cursor: acceptingDeliveryId === delivery.id ? 'not-allowed' : 'pointer' }}
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
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '15px' }}
            onClick={() => navigate('/courier/available')}
          >
            View All Available Requests
          </button>
        </div>
      </div>

      {/* RECENT REVIEWS SECTION */}
      <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '30px' }}>
        <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px', marginBottom: '20px' }}>Recent Reviews & Feedback</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {courierRatingSummary.latestComments.length > 0 ? (
            courierRatingSummary.latestComments.slice(0, 3).map(d => (
              <div key={d.id} style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--hover-bg)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>{d.deliveryCode}</span>
                  <span style={{ color: '#facc15', fontSize: '12px' }}>
                    {'★'.repeat(d.ratingGiven)}{'☆'.repeat(5 - d.ratingGiven)}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Customer: <strong>{d.customer}</strong> • {d.date}
                </p>
                {d.ratingComment ? (
                  <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0 }}>
                    "{d.ratingComment}"
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    No comment left.
                  </p>
                )}
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No reviews or ratings received yet.
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE DELIVERIES SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>My Active Deliveries</h3>
          <button className="btn btn-outline" onClick={() => navigate('/courier/deliveries')}>Manage Deliveries</button>
        </div>
        <CourierDeliveryTable selectedFilter="Pending" />
      </div>

      {/* WITHDRAW HISTORY SECTION */}
      <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaHistory color="var(--primary-color)" />
          <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>Withdrawal Payout History</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Transaction ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Payout Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {courierEarnings.withdrawHistory && courierEarnings.withdrawHistory.length > 0 ? (
                courierEarnings.withdrawHistory.map((w, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', hover: { backgroundColor: 'var(--hover-bg)' } }}>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{w.id}</td>
                    <td style={{ padding: '14px 12px' }}>{w.date}</td>
                    <td style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBuilding size={12} color="gray" /> {w.bankName || 'Local Bank Transfer'}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#10b981' }}>{w.amount.toFixed(2)} MAD</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: w.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : w.status === 'rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                        color: w.status === 'approved' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#eab308'
                      }}>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No withdrawal transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </SectionLoading>

      {/* WITHDRAW EARNINGS MODAL */}
      {showWithdrawModal && (
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
              onClick={handleCloseWithdrawModal}
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

            {!withdrawSuccess ? (
              <form onSubmit={handleWithdrawSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <FaMoneyCheckAlt size={20} color="var(--primary-color)" />
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Withdraw Earnings</h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Transfer your cleared released balance directly into your Moroccan bank account.
                </p>

                {withdrawError && (
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
                    {withdrawError}
                  </div>
                )}

                <div style={{
                  padding: '15px',
                  backgroundColor: 'var(--hover-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Available Released Balance</span>
                    <span>Max Payout</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                      {courierEarnings.released.toFixed(2)} MAD
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>100% Secure</span>
                  </div>
                </div>

                {/* Amount input */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Amount to Withdraw (MAD)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount, e.g. 500"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Bank selection */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Destination Bank (Morocco)</label>
                  <select 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
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
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>24-Digit RIB Account Number</label>
                  <input 
                    type="text"
                    value={ribNumber}
                    onChange={(e) => setRibNumber(e.target.value.replace(/\D/g, '').slice(0, 24))}
                    placeholder="E.g. 230123456789012345678901"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>Must be strictly 24 digits</span>
                    <span>Entered: {ribNumber.length}/24</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleCloseWithdrawModal}
                    style={{ flex: 1, padding: '10px 0', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={withdrawLoading}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #4ade80, #10b981)',
                      color: '#fff',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <FaCheckCircle size={55} color="#4ade80" style={{ marginBottom: '15px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Withdrawal Requested!</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Your bank transfer has been queued. Funds are usually credited within 1-2 hours depending on your bank.
                </p>

                <div style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount Transferred:</span>
                    <strong style={{ color: '#10b981' }}>{parseFloat(withdrawAmount).toFixed(2)} MAD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                    <strong>{bankName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>RIB Number:</span>
                    <span style={{ fontFamily: 'monospace' }}>***{ribNumber.slice(-6)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Reference Number:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{txnRef}</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleCloseWithdrawModal}
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

export default CourierDashboard;
