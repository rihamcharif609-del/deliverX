/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { calculatePrice } from '../utils/calculatePrice';

const DeliveryContext = createContext();

const API_BASE_URL = 'http://localhost:8000/api/v1';

const defaultCourierEarnings = {
  total: 6825,
  pending: 68,
  released: 102,
  withdrawHistory: [
    { id: 'W-001', amount: 1500, status: 'completed', date: '2026-05-01' },
    { id: 'W-002', amount: 2000, status: 'completed', date: '2026-05-10' },
    { id: 'W-003', amount: 1200, status: 'completed', date: '2026-05-18' }
  ]
};

const defaultCouriers = [
  { name: 'Yassine Mansouri', vehicle: 'Scooter', rating: 4.9, ratingsCount: 15, completedCount: 124, avatar: 'YM' },
  { name: 'Emma Brown', vehicle: 'E-Bike', rating: 4.8, ratingsCount: 12, completedCount: 89, avatar: 'EB' },
  { name: 'Mike Smith', vehicle: 'Motorcycle', rating: 4.7, ratingsCount: 8, completedCount: 56, avatar: 'MS' },
  { name: 'David Wilson', vehicle: 'Car', rating: 4.6, ratingsCount: 10, completedCount: 67, avatar: 'DW' },
  { name: 'James Taylor', vehicle: 'Motorcycle', rating: 4.5, ratingsCount: 7, completedCount: 92, avatar: 'JT' }
];

const defaultAdminAnalytics = {
  totalRevenue: 85240,
  platformProfit: 12786,
  courierEarnings: 72454,
  pendingPayments: 68,
  releasedPayments: 102,
  refunds: 450
};

const NOTIFICATION_ROLE_MAP = {
  user_registered: 'admin',
  delivery_created: 'admin',
  courier_request: 'admin',
  courier_accepted: 'sender',
  payment_received: 'sender',
  status_update: 'sender',
  delivery_completed: 'sender',
  delivery_refunded: 'sender',
  courier_notify_paid: 'courier',
  payout_released: 'courier',
  courier_notify_refunded: 'courier',
};

const resolveNotificationRole = (notif) =>
  notif.targetRole || NOTIFICATION_ROLE_MAP[notif.type] || 'admin';

const migrateNotification = (notif) => ({
  ...notif,
  targetRole: resolveNotificationRole(notif),
});

const toNumber = (value) => Number.parseFloat(value || 0);

const extractPackageType = (description) => {
  const match = String(description || '').match(/^Type:\s*(.+)$/im);
  return match?.[1] || 'Parcel';
};

const mapDeliveryFromApi = (delivery) => {
  const amount = toNumber(delivery.amount);
  const commission = toNumber(delivery.commission);
  const packageType = extractPackageType(delivery.package_description);

  return {
    apiId: delivery.id,
    id: delivery.tracking_code || `DEL-${delivery.id}`,
    customer: delivery.recipient_name || delivery.sender?.name || 'Sender',
    sender: delivery.sender?.name || 'Sender',
    from: delivery.pickup_address,
    to: delivery.delivery_address,
    pickup: delivery.pickup_address,
    destination: delivery.delivery_address,
    pickupContact: delivery.pickup_contact_name || '',
    pickupPhone: delivery.pickup_contact_phone || '',
    phone: delivery.recipient_phone || '',
    type: packageType,
    packageType,
    weight: delivery.package_weight ? `${delivery.package_weight} kg` : 'N/A',
    courier: delivery.courier?.name || null,
    courierPhone: delivery.courier?.phone || '',
    amount,
    total: amount,
    commission,
    netAmount: amount - commission,
    status: delivery.status,
    paymentStatus: delivery.payment_status === 'unpaid' ? 'pending' : delivery.payment_status,
    date: delivery.delivery_date || delivery.created_at?.slice(0, 10) || '',
    time: delivery.delivery_time || '',
    instructions: delivery.notes || delivery.package_description || '',
    createdAt: delivery.created_at,
  };
};

export const DeliveryProvider = ({ children }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveriesError, setDeliveriesError] = useState('');

  const [couriers, setCouriers] = useState(() => {
    try {
      const saved = localStorage.getItem('myCouriers');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing myCouriers", e);
    }
    return defaultCouriers;
  });

  const [courierEarnings, setCourierEarnings] = useState(() => {
    try {
      const saved = localStorage.getItem('courierEarnings');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultCourierEarnings, ...parsed };
        }
      }
    } catch (e) {
      console.error("Error parsing courierEarnings", e);
    }
    return defaultCourierEarnings;
  });

  const [adminAnalytics, setAdminAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem('adminAnalytics');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultAdminAnalytics, ...parsed };
        }
      }
    } catch (e) {
      console.error("Error parsing adminAnalytics", e);
    }
    return defaultAdminAnalytics;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('globalNotifications');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(migrateNotification);
      }
    } catch (e) {
      console.error("Error parsing globalNotifications", e);
    }
    return [
      {
        id: 1,
        type: 'user_registered',
        targetRole: 'admin',
        text: 'New user registered',
        description: 'Alex Mercer has registered as a sender.',
        time: '2 hours ago',
        isRead: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('courierEarnings', JSON.stringify(courierEarnings));
  }, [courierEarnings]);

  useEffect(() => {
    localStorage.setItem('adminAnalytics', JSON.stringify(adminAnalytics));
  }, [adminAnalytics]);

  useEffect(() => {
    localStorage.setItem('globalNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('myCouriers', JSON.stringify(couriers));
  }, [couriers]);

  const PACKAGE_TYPE_LABELS = {
    documents: 'Documents',
    parcel: 'Parcel',
    electronics: 'Electronics',
    fragile: 'Fragile items',
    food: 'Food',
    other: 'Other',
  };

  const fetchDeliveries = useCallback(async (scope = 'sender') => {
    const endpoints = {
      admin: `${API_BASE_URL}/admin/deliveries`,
      sender: `${API_BASE_URL}/sender/deliveries`,
      courier: `${API_BASE_URL}/courier/deliveries`,
      available: `${API_BASE_URL}/courier/deliveries/available`,
    };

    setDeliveriesLoading(true);
    setDeliveriesError('');

    try {
      const { data } = await axios.get(endpoints[scope] || endpoints.sender);
      const rows = Array.isArray(data.data) ? data.data : [];
      const mapped = rows.map(mapDeliveryFromApi);
      setDeliveries(mapped);
      return mapped;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Could not load deliveries from the backend.';
      setDeliveriesError(message);
      throw err;
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  // 1. Create a delivery request (Sender)
  const createDelivery = async (formData) => {
    const weightKg = parseFloat(formData.packageWeight || 1);
    const priceQuote =
      formData.calculatedAmount != null
        ? {
            total: formData.calculatedAmount,
            distanceKm: formData.distanceKm ?? 0,
          }
        : calculatePrice({
            pickupAddress: formData.pickupAddress,
            deliveryAddress: formData.deliveryAddress,
            packageWeight: formData.packageWeight,
            priority: formData.priority,
          });
    const amount = priceQuote.total;
    const commission = amount * 0.15;
    const netAmount = amount - commission;
    const packageLabel =
      PACKAGE_TYPE_LABELS[formData.packageType] || PACKAGE_TYPE_LABELS.documents;

    const { data } = await axios.post(`${API_BASE_URL}/sender/deliveries`, {
      pickup_address: formData.pickupAddress,
      pickup_contact_name: formData.pickupContactName,
      pickup_contact_phone: formData.pickupContactPhone,
      delivery_address: formData.deliveryAddress,
      recipient_name: formData.recipientName,
      recipient_phone: formData.recipientPhone,
      package_description: [
        `Type: ${formData.packageType}`,
        formData.packageDimensions ? `Dimensions: ${formData.packageDimensions}` : null,
        formData.declaredValue ? `Declared value: ${formData.declaredValue} MAD` : null,
        formData.instructions ? `Instructions: ${formData.instructions}` : null,
      ].filter(Boolean).join('\n'),
      package_weight: weightKg,
      delivery_date: formData.deliveryDate,
      delivery_time: formData.deliveryTime,
      amount,
      commission,
      payment_status: 'unpaid',
      notes: formData.instructions,
    });

    const newDelivery = {
      ...mapDeliveryFromApi(data.data),
      type: packageLabel,
      packageType: packageLabel,
      netAmount,
      distanceKm: priceQuote.distanceKm,
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    addNotification({
      type: 'delivery_created',
      targetRole: 'admin',
      text: `New Delivery Request Created`,
      description: `Delivery ${newDelivery.id} from ${newDelivery.pickup.split(',')[0]} is waiting for a courier.`,
      time: 'Just now',
      path: '/admin/deliveries'
    });

    return newDelivery;
  };

  // 2. Accept a delivery (Courier)
  const acceptDelivery = async (deliveryId, courierName = 'Courier') => {
    const target = deliveries.find((delivery) => delivery.id === deliveryId);
    const apiId = target?.apiId || deliveryId;
    const { data } = await axios.post(`${API_BASE_URL}/courier/deliveries/${apiId}/accept`);
    const acceptedDelivery = mapDeliveryFromApi(data.data);

    setDeliveries(prev =>
      prev.map((delivery) =>
        delivery.id === deliveryId ? acceptedDelivery : delivery
      )
    );

    addNotification({
      type: 'courier_accepted',
      targetRole: 'sender',
      text: `Courier Accepted Delivery`,
      description: `Courier ${courierName} accepted your delivery ${deliveryId}. Proceed to payment!`,
      time: 'Just now',
      path: `/sender/deliveries`,
      deliveryId: deliveryId
    });

    return acceptedDelivery;
  };

  // 3. Process payment (Sender)
  const payDelivery = (deliveryId, cardName) => {
    let targetAmount = 0;
    let targetCommission = 0;
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        targetAmount = d.amount;
        targetCommission = d.commission;
        return {
          ...d,
          status: 'paid',
          paymentStatus: 'held',
          otp: code,
          paymentDetails: {
            cardHolder: cardName,
            paidAt: new Date().toLocaleString()
          }
        };
      }
      return d;
    }));

    // Hold payment in Admin Analytics and Courier Pending Earnings
    setAdminAnalytics(prev => ({
      ...prev,
      pendingPayments: prev.pendingPayments + targetAmount
    }));

    setCourierEarnings(prev => ({
      ...prev,
      pending: prev.pending + (targetAmount - targetCommission)
    }));

    addNotification({
      type: 'payment_received',
      targetRole: 'sender',
      text: `Payment Confirmed`,
      description: `You paid ${targetAmount} MAD for ${deliveryId}. Your OTP code is ${code} — share it with the courier upon delivery.`,
      time: 'Just now',
      path: `/sender/tracking/${deliveryId}`,
      deliveryId: deliveryId
    });

    addNotification({
      type: 'courier_notify_paid',
      targetRole: 'courier',
      text: `Order ${deliveryId} Paid!`,
      description: `Sender completed online payment. You can now start pickup.`,
      time: 'Just now',
      path: `/courier/deliveries`,
      deliveryId: deliveryId
    });

    addNotification({
      type: 'payment_received',
      targetRole: 'admin',
      text: `Payment Held in Escrow`,
      description: `${targetAmount} MAD secured for ${deliveryId}. Funds locked until OTP confirmation.`,
      time: 'Just now',
      path: '/admin',
      deliveryId: deliveryId
    });
  };

  // 4. Update delivery state (Courier: picked-up, in-transit)
  const updateDeliveryState = (deliveryId, nextStatus) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: nextStatus
        };
      }
      return d;
    }));

    // Add status timeline notifications
    addNotification({
      type: 'status_update',
      targetRole: 'sender',
      text: `Delivery status: ${nextStatus.toUpperCase()}`,
      description: `Delivery ${deliveryId} is now ${nextStatus.replace('-', ' ')}.`,
      time: 'Just now',
      path: `/sender/tracking/${deliveryId}`,
      deliveryId: deliveryId
    });
  };

  // 5. Confirm Delivery via OTP (Courier + automatic payout release)
  const confirmDeliveryOTP = (deliveryId, enteredOtp) => {
    let success = false;
    let targetAmount = 0;
    let targetCommission = 0;

    const updated = deliveries.map(d => {
      if (d.id === deliveryId) {
        if (d.otp === enteredOtp) {
          success = true;
          targetAmount = d.amount;
          targetCommission = d.commission;
          return {
            ...d,
            status: 'delivered',
            paymentStatus: 'released'
          };
        }
      }
      return d;
    });

    if (success) {
      setDeliveries(updated);

      // Release money in Admin Analytics & Courier Earnings
      const courierEarn = targetAmount - targetCommission;

      setAdminAnalytics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + targetAmount,
        platformProfit: prev.platformProfit + targetCommission,
        courierEarnings: prev.courierEarnings + courierEarn,
        pendingPayments: Math.max(0, prev.pendingPayments - targetAmount),
        releasedPayments: prev.releasedPayments + targetAmount
      }));

      setCourierEarnings(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - courierEarn),
        released: prev.released + courierEarn,
        total: prev.total + courierEarn
      }));

      addNotification({
        type: 'delivery_completed',
        targetRole: 'sender',
        text: `Delivery Completed!`,
        description: `Order ${deliveryId} delivered. Funds released. Thank you!`,
        time: 'Just now',
        path: `/sender/tracking/${deliveryId}`,
        deliveryId: deliveryId
      });

      addNotification({
        type: 'payout_released',
        targetRole: 'courier',
        text: `Earnings Released!`,
        description: `OTP match. +${courierEarn} MAD credited to your balance.`,
        time: 'Just now',
        path: `/courier`,
        deliveryId: deliveryId
      });

      addNotification({
        type: 'delivery_completed',
        targetRole: 'admin',
        text: `Delivery Settled`,
        description: `Order ${deliveryId} completed. ${targetAmount} MAD released from escrow.`,
        time: 'Just now',
        path: '/admin',
        deliveryId: deliveryId
      });

      return { success: true, message: 'Delivery confirmed and payout released successfully!' };
    } else {
      return { success: false, message: 'Invalid OTP code! Please try again.' };
    }
  };

  // 6. Request Courier Withdrawal (Courier)
  const requestWithdrawal = (amount, bank = 'CIH Bank') => {
    if (courierEarnings.released >= amount) {
      const newWithdrawal = {
        id: 'W-' + Math.floor(100 + Math.random() * 900),
        amount: amount,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        bankName: bank
      };

      setCourierEarnings(prev => ({
        ...prev,
        released: prev.released - amount,
        withdrawHistory: [newWithdrawal, ...prev.withdrawHistory]
      }));

      return { success: true, message: `Withdrawal of ${amount} MAD processed successfully!` };
    }
    return { success: false, message: 'Insufficient released balance.' };
  };

  // 7. Dispute & Refund Delivery (Admin)
  const refundDelivery = (deliveryId) => {
    let success = false;
    let targetAmount = 0;
    let targetCommission = 0;

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId && d.paymentStatus === 'held') {
        success = true;
        targetAmount = d.amount;
        targetCommission = d.commission;
        return {
          ...d,
          status: 'cancelled',
          paymentStatus: 'refunded'
        };
      }
      return d;
    }));

    if (success) {
      // Revert Admin Analytics Escrow
      setAdminAnalytics(prev => ({
        ...prev,
        pendingPayments: Math.max(0, prev.pendingPayments - targetAmount),
        refunds: prev.refunds + targetAmount
      }));

      // Revert Courier Pending Earnings
      const courierEarn = targetAmount - targetCommission;
      setCourierEarnings(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - courierEarn)
      }));

      addNotification({
        type: 'delivery_refunded',
        targetRole: 'sender',
        text: `Refund Processed for ${deliveryId}`,
        description: `Admin approved refund of ${targetAmount} MAD to your account.`,
        time: 'Just now',
        path: `/sender/deliveries`,
        deliveryId: deliveryId
      });

      addNotification({
        type: 'courier_notify_refunded',
        targetRole: 'courier',
        text: `Order ${deliveryId} Cancelled & Refunded`,
        description: `Admin processed a dispute refund. Escrow earnings reverted.`,
        time: 'Just now',
        path: `/courier/deliveries`,
        deliveryId: deliveryId
      });

      return { success: true, message: 'Dispute resolved and refund processed successfully!' };
    }
    return { success: false, message: 'Only payments held in escrow can be refunded.' };
  };

  const addNotification = (notif) => {
    const newNotif = migrateNotification({
      id: Date.now() + Math.random(),
      isRead: false,
      ...notif,
    });
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getNotificationsForRole = (role) =>
    notifications.filter((n) => n.targetRole === role);

  const markAsRead = (id, role) => {
    setNotifications(prev =>
      prev.map((n) =>
        n.id === id && (!role || n.targetRole === role) ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = (role) => {
    setNotifications(prev =>
      prev.map((n) => (n.targetRole === role ? { ...n, isRead: true } : n))
    );
  };

  const rateCourier = (deliveryId, ratingValue, comment) => {
    let courierName = '';

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        courierName = d.courier;
        return {
          ...d,
          courierRating: String(ratingValue),
          ratingGiven: ratingValue,
          ratingComment: comment || ''
        };
      }
      return d;
    }));

    if (courierName) {
      setCouriers(prev => {
        const exists = prev.some(c => c.name === courierName);
        if (exists) {
          return prev.map(c => {
            if (c.name === courierName) {
              const newCount = (c.ratingsCount || 0) + 1;
              const newRating = parseFloat((((c.rating || 0) * (c.ratingsCount || 0)) + ratingValue) / newCount).toFixed(1);
              return {
                ...c,
                rating: parseFloat(newRating),
                ratingsCount: newCount,
                completedCount: (c.completedCount || 0) + 1
              };
            }
            return c;
          });
        } else {
          return [
            ...prev,
            {
              name: courierName,
              vehicle: 'Motorcycle',
              rating: ratingValue,
              ratingsCount: 1,
              completedCount: 1,
              avatar: courierName.split(' ').map(n => n[0]).join('')
            }
          ];
        }
      });
    }
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DeliveryContext.Provider value={{
      deliveries,
      deliveriesLoading,
      deliveriesError,
      courierEarnings,
      adminAnalytics,
      notifications,
      getNotificationsForRole,
      fetchDeliveries,
      createDelivery,
      acceptDelivery,
      payDelivery,
      updateDeliveryState,
      confirmDeliveryOTP,
      requestWithdrawal,
      refundDelivery,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      couriers,
      rateCourier
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
