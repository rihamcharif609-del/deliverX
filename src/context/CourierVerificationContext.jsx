import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'courierVerification';

const defaultProfile = {
  name: 'Mike Courier',
  email: 'courier@deliverx.com',
  phone: '+212 661-234567',
  address: 'Hay Mohammadi, Casablanca',
  vehicleType: 'Motorcycle',
  vehicleNumber: '12345-A-6',
  cinNumber: 'CIN-987654321',
  driverLicense: 'DL-12345678',
  avatar: 'MC',
  photo: null,
  completedDeliveries: 0,
  rating: 0,
  earnings: 0,
};

const defaultVerification = {
  status: 'draft',
  profile: defaultProfile,
  documents: {
    cinImage: null,
    licenseImage: null,
    vehicleImage: null,
  },
  submittedAt: null,
  reviewedAt: null,
  rejectionReason: '',
};

const CourierVerificationContext = createContext();

const loadVerification = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== 'undefined') {
      const parsed = JSON.parse(saved);
      return {
        ...defaultVerification,
        ...parsed,
        profile: { ...defaultProfile, ...parsed.profile },
        documents: { ...defaultVerification.documents, ...parsed.documents },
      };
    }
  } catch (e) {
    console.error('Error parsing courier verification', e);
  }
  return defaultVerification;
};

const syncVerifiedFlag = (status) => {
  localStorage.setItem('isCourierVerified', status === 'approved' ? 'true' : 'false');
};

export const CourierVerificationProvider = ({ children }) => {
  const [verification, setVerification] = useState(loadVerification);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verification));
    syncVerifiedFlag(verification.status);
  }, [verification]);

  const isCourierVerified = verification.status === 'approved';

  const allDocumentsUploaded = useCallback(() => {
    const { documents } = verification;
    return Boolean(
      documents.cinImage?.dataUrl &&
      documents.licenseImage?.dataUrl &&
      documents.vehicleImage?.dataUrl
    );
  }, [verification]);

  const canEditDocuments = verification.status === 'draft' || verification.status === 'rejected';

  const updateProfile = (profileUpdates) => {
    setVerification((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates },
    }));
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
      reader.onload = () => {
        setVerification((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docKey]: {
              fileName: file.name,
              dataUrl: reader.result,
              uploadedAt: new Date().toISOString(),
            },
          },
        }));
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const submitForVerification = () => {
    if (!allDocumentsUploaded()) {
      return { success: false, message: 'Upload all 3 required documents first.' };
    }

    setVerification((prev) => ({
      ...prev,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      rejectionReason: '',
    }));

    return { success: true, message: 'Documents submitted. Waiting for admin approval.' };
  };

  const approveVerification = () => {
    setVerification((prev) => ({
      ...prev,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      rejectionReason: '',
    }));
    return { success: true };
  };

  const rejectVerification = (reason = 'Documents do not meet requirements.') => {
    setVerification((prev) => ({
      ...prev,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason,
    }));
    return { success: true };
  };

  const resetVerification = () => {
    setVerification(defaultVerification);
    syncVerifiedFlag('draft');
  };

  return (
    <CourierVerificationContext.Provider
      value={{
        verification,
        profile: verification.profile,
        documents: verification.documents,
        verificationStatus: verification.status,
        isCourierVerified,
        allDocumentsUploaded,
        canEditDocuments,
        updateProfile,
        uploadDocument,
        submitForVerification,
        approveVerification,
        rejectVerification,
        resetVerification,
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
