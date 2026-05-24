import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePrice } from '../utils/calculatePrice';

const DeliveryContext = createContext();

const defaultDeliveries = [
  {
    id: 'DEL-9811',
    customer: 'John Sender',
    from: 'Maarif, Casablanca',
    to: 'Agdal, Rabat',
    pickup: 'Maarif, Casablanca',
    destination: 'Agdal, Rabat',
    type: 'Documents',
    packageType: 'Documents',
    weight: '0.5 kg',
    courier: 'Yassine Mansouri',
    courierVehicle: 'Scooter',
    courierRating: '4.9',
    courierPhone: '+212 661-234567',
    courierArrival: '25 min',
    amount: 120,
    total: 120,
    commission: 18, // 15%
    netAmount: 102,
    status: 'delivered',
    paymentStatus: 'released',
    otp: '4821',
    date: '2026-05-20',
    time: '10:30 AM',
    instructions: 'Please call when arriving at the office building.'
  },
  {
    id: 'DEL-9812',
    customer: 'Sarah Connor',
    from: 'Gueliz, Marrakech',
    to: 'Medina, Marrakech',
    pickup: 'Gueliz, Marrakech',
    destination: 'Medina, Marrakech',
    type: 'Parcel',
    packageType: 'Parcel',
    weight: '3.5 kg',
    courier: 'Emma Brown',
    courierVehicle: 'E-Bike',
    courierRating: '4.8',
    courierPhone: '+212 662-897654',
    courierArrival: '15 min',
    amount: 80,
    total: 80,
    commission: 12,
    netAmount: 68,
    status: 'in-transit',
    paymentStatus: 'held',
    otp: '3391',
    date: '2026-05-21',
    time: '02:15 PM',
    instructions: 'Fragile package containing ceramic products.'
  },
  {
    id: 'DEL-9813',
    customer: 'John Sender',
    from: 'Hay Riad, Rabat',
    to: 'Agdal, Rabat',
    pickup: 'Hay Riad, Rabat',
    destination: 'Agdal, Rabat',
    type: 'Electronics',
    packageType: 'Electronics',
    weight: '1.2 kg',
    courier: null,
    amount: 90,
    total: 90,
    commission: 13.5,
    netAmount: 76.5,
    status: 'waiting-courier',
    paymentStatus: 'pending',
    otp: null,
    date: '2026-05-21',
    time: '11:00 AM',
    instructions: 'Deliver to 3rd floor apartment.'
  }
];

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

export const DeliveryProvider = ({ children }) => {
  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = localStorage.getItem('myDeliveries');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing myDeliveries", e);
    }
    return defaultDeliveries;
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
    localStorage.setItem('myDeliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('courierEarnings', JSON.stringify(courierEarnings));
  }, [courierEarnings]);

  useEffect(() => {
    localStorage.setItem('adminAnalytics', JSON.stringify(adminAnalytics));
  }, [adminAnalytics]);

  useEffect(() => {
    localStorage.setItem('globalNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const PACKAGE_TYPE_LABELS = {
    documents: 'Documents',
    parcel: 'Parcel',
    electronics: 'Electronics',
    fragile: 'Fragile items',
    food: 'Food',
    other: 'Other',
  };

  // 1. Create a delivery request (Sender)
  const createDelivery = (formData) => {
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

    const newDelivery = {
      id: 'DEL-' + Math.floor(1000 + Math.random() * 9000),
      customer: formData.recipientName || formData.pickupContactName || 'John Sender',
      from: formData.pickupAddress,
      to: formData.deliveryAddress,
      pickup: formData.pickupAddress,
      destination: formData.deliveryAddress,
      pickupContact: formData.pickupContactName || '',
      pickupPhone: formData.pickupContactPhone || '',
      phone: formData.recipientPhone || '',
      type: packageLabel,
      packageType: packageLabel,
      weight: `${weightKg} kg`,
      dimensions: formData.packageDimensions || '',
      declaredValue: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
      priority: formData.priority || 'standard',
      distanceKm: priceQuote.distanceKm,
      courier: null,
      courierVehicle: null,
      courierRating: null,
      courierPhone: null,
      courierArrival: null,
      amount: amount,
      total: amount,
      commission: commission,
      netAmount: netAmount,
      status: 'waiting-courier',
      paymentStatus: 'pending',
      otp: null,
      date: formData.deliveryDate || new Date().toISOString().split('T')[0],
      time: formData.deliveryTime || '10:30 AM',
      instructions: formData.instructions || ''
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
  const acceptDelivery = (deliveryId, courierName = 'Mike Smith') => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId && d.status === 'waiting-courier') {
        // First courier to accept gets it
        return {
          ...d,
          status: 'accepted',
          courier: courierName,
          courierVehicle: 'Motorcycle',
          courierRating: '4.8',
          courierPhone: '+212 663-112233',
          courierArrival: '12 min'
        };
      }
      return d;
    }));

    addNotification({
      type: 'courier_accepted',
      targetRole: 'sender',
      text: `Courier Accepted Delivery`,
      description: `Courier ${courierName} accepted your delivery ${deliveryId}. Proceed to payment!`,
      time: 'Just now',
      path: `/sender/deliveries`,
      deliveryId: deliveryId
    });
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
    let desc = '';
    if (nextStatus === 'picked-up') desc = `Package was successfully picked up.`;
    else if (nextStatus === 'in-transit') desc = `Package is in transit to the destination.`;

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

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DeliveryContext.Provider value={{
      deliveries,
      courierEarnings,
      adminAnalytics,
      notifications,
      getNotificationsForRole,
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
      deleteNotification
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
