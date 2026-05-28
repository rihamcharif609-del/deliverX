/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  vehicleType: '',
  vehicleNumber: '',
  cinNumber: '',
  driverLicense: '',
  avatar: '',
  photo: null,
  completedDeliveries: 0,
  rating: 0,
  earnings: 0,
};

const mapUserToVerification = (user) => {
  const name = user?.name || '';

  return {
    id: user?.id,
    status: user?.verification_status || 'draft',
    profile: {
      ...emptyProfile,
      name,
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      vehicleType: user?.vehicle_type || '',
      vehicleNumber: user?.vehicle_number || '',
      cinNumber: user?.cin_number || '',
      driverLicense: user?.driver_license || '',
      avatar: name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      photo: user?.profile_photo || null,
    },
    documents: {
      cinImage: user?.cin_image || null,
      licenseImage: user?.license_image || null,
      vehicleImage: user?.vehicle_image || null,
    },
    submittedAt: user?.verification_submitted_at || null,
    reviewedAt: user?.verification_reviewed_at || null,
    rejectionReason: user?.verification_rejection_reason || '',
  };
};

const mapProfileToApi = (profile) => ({
  name: profile.name,
  phone: profile.phone,
  address: profile.address,
  vehicle_type: profile.vehicleType,
  vehicle_number: profile.vehicleNumber,
  cin_number: profile.cinNumber,
  driver_license: profile.driverLicense,
  profile_photo: profile.photo,
});

const CourierVerificationContext = createContext();

export const CourierVerificationProvider = ({ children }) => {
  const { user, fetchUser } = useAuth();
  const [verification, setVerification] = useState(() => mapUserToVerification(user));
  const [adminVerifications, setAdminVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyUser = useCallback((nextUser) => {
    const nextVerification = mapUserToVerification(nextUser);
    setVerification(nextVerification);
    return nextVerification;
  }, []);

  const fetchCourierProfile = useCallback(async () => {
    if (user?.role !== 'courier') return null;

    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/courier/profile`);
      return applyUser(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courier profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyUser, user?.role]);

  const fetchAdminVerifications = useCallback(async () => {
    if (user?.role !== 'admin') return [];

    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/couriers/verification`);
      const rows = Array.isArray(data.data) ? data.data.map(mapUserToVerification) : [];
      setAdminVerifications(rows);
      return rows;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courier verification requests.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    applyUser(user);
    if (user?.role === 'courier') {
      fetchCourierProfile().catch(() => {});
    }
    if (user?.role === 'admin') {
      fetchAdminVerifications().catch(() => {});
    }
  }, [applyUser, fetchAdminVerifications, fetchCourierProfile, user]);

  const isCourierVerified = verification.status === 'approved';

  const allDocumentsUploaded = useCallback((source = verification.documents) => Boolean(
    source.cinImage?.dataUrl &&
    source.licenseImage?.dataUrl &&
    source.vehicleImage?.dataUrl
  ), [verification.documents]);

  const profileComplete = useCallback((source = verification.profile, docs = verification.documents) => Boolean(
    source.name &&
    source.email &&
    source.phone &&
    source.address &&
    source.vehicleType &&
    source.vehicleNumber &&
    source.cinNumber &&
    source.driverLicense &&
    allDocumentsUploaded(docs)
  ), [allDocumentsUploaded, verification.documents, verification.profile]);

  const canEditDocuments = verification.status === 'draft' || verification.status === 'rejected';

  const updateProfile = async (profileUpdates) => {
    const nextProfile = { ...verification.profile, ...profileUpdates };
    const { data } = await axios.patch(`${API_BASE_URL}/courier/profile`, mapProfileToApi(nextProfile));
    const nextVerification = applyUser(data.data);
    await fetchUser();
    return nextVerification;
  };

  const uploadDocument = (docKey, file) =>
    new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please upload an image file (JPG, PNG, etc.)'));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Image must be smaller than 2 MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/courier/profile/documents/${docKey}`, {
            fileName: file.name,
            dataUrl: reader.result,
            uploadedAt: new Date().toISOString(),
          });
          resolve(applyUser(data.data));
        } catch (err) {
          reject(new Error(err.response?.data?.message || 'Upload failed'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const submitForVerification = async () => {
    if (!profileComplete()) {
      return { success: false, message: 'Complete your profile and upload all 3 required documents first.' };
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/courier/profile/submit-verification`);
      applyUser(data.data);
      return { success: true, message: 'Profile completed. Waiting for admin approval.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Could not submit profile for verification.',
      };
    }
  };

  const approveVerification = async (courierId) => {
    const { data } = await axios.patch(`${API_BASE_URL}/admin/couriers/${courierId}/verification`, {
      status: 'approved',
    });
    const updated = mapUserToVerification(data.data);
    setAdminVerifications((prev) => prev.map((item) => item.id === courierId ? updated : item));
    return { success: true, verification: updated };
  };

  const rejectVerification = async (courierId, reason = 'Documents do not meet requirements.') => {
    const { data } = await axios.patch(`${API_BASE_URL}/admin/couriers/${courierId}/verification`, {
      status: 'rejected',
      reason,
    });
    const updated = mapUserToVerification(data.data);
    setAdminVerifications((prev) => prev.map((item) => item.id === courierId ? updated : item));
    return { success: true, verification: updated };
  };

  const completion = useMemo(() => {
    const checks = [
      verification.profile.name,
      verification.profile.email,
      verification.profile.phone,
      verification.profile.address,
      verification.profile.vehicleType,
      verification.profile.vehicleNumber,
      verification.profile.cinNumber,
      verification.profile.driverLicense,
      verification.documents.cinImage?.dataUrl,
      verification.documents.licenseImage?.dataUrl,
      verification.documents.vehicleImage?.dataUrl,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [verification]);

  return (
    <CourierVerificationContext.Provider
      value={{
        verification,
        profile: verification.profile,
        documents: verification.documents,
        verificationStatus: verification.status,
        verificationLoading: loading,
        verificationError: error,
        adminVerifications,
        completion,
        isCourierVerified,
        allDocumentsUploaded,
        profileComplete,
        canEditDocuments,
        fetchCourierProfile,
        fetchAdminVerifications,
        updateProfile,
        uploadDocument,
        submitForVerification,
        approveVerification,
        rejectVerification,
      }}
    >
      {children}
    </CourierVerificationContext.Provider>
  );
};

export const useCourierVerification = () => {
  const context = useContext(CourierVerificationContext);
  if (!context) {
    throw new Error('useCourierVerification must be used within CourierVerificationProvider');
  }
  return context;
};
