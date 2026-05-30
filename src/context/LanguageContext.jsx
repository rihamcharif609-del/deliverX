import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Sidebar & Navigation
    dashboard: 'Dashboard',
    allDeliveries: 'All Deliveries',
    myDeliveries: 'My Deliveries',
    manageUsers: 'Manage Users',
    createDelivery: 'Create Delivery',
    trackPackage: 'Track Package',
    available: 'Available',
    profile: 'Profile',
    logout: 'Logout',
    deliveryManagement: 'Delivery Management',

    // Settings
    settings: 'Settings',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    language: 'Language',
    accountSettings: 'Account Settings',
    manage: 'Manage',

    // Header
    welcome: 'Welcome',
    searchPlaceholder: 'Search...',
    
    // Statuses
    pending: 'Pending',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    all: 'All',

    // Landing Page
    features: 'Features',
    howItWorks: 'How it Works',
    contact: 'Contact',
    login: 'Login',
    signUp: 'Sign Up',
    getStarted: 'Get Started',
    fastReliableTitle: 'Fast, Reliable Package Delivery Platform',
    fastReliableSubtitle: 'Contact us for a quote on our fast, reliable package delivery platform.',
    deliveres: 'deliveres',
    everythingYouNeed:'Everything you need for delivery management',
    readyToGetStarted: 'Ready to Get Started?',
    costperDelivery: 'Cost per Delivery',
    fastDelivery:'fast Delivery',
    deliveriesaremade:'Deliveries are made within 2 hours of the request. Track your deliveries in real time.',
    comparepricesandchoose:'Compare prices and choose the best option for your needs.',
    quickDelivery: 'quick Delivery',
    getyourpackagesdelivered:'Get your parcels delivered to your home in just 1 hour.',
    howDeliverXWorks: 'how DeliverX Works',
    simplefastandefficient: 'Simple, fast and efficient delivery service',
    createRequest:'create Request',
    createadeliveryrequestwithall:'Create a delivery request with all the necessary details.',
    CheckAvailability: 'Check Availability',
    Checktheavailabilityof: 'Check the availability of delivery slots.',
    PlaceOrder:'Place Order',
    Placeyourorderonline:'Place your order online or call us for help.',
    signUpNow: 'Sign Up Now',
    copyright: 'Copyright © 2023 DeliverX | All Rights Reserved',

    // Common Page Headers & Descriptions
    allDeliveriesDesc: 'Manage and track all your deliveries',
    myDeliveriesDesc: 'View and track your package requests',
    manageUsersDesc: 'View and manage all system users',
    createDeliveryDesc: 'Enter package details to book a delivery',
    trackPackageDesc: 'Real-time tracking for delivery',
    availableDesc: 'Accept new delivery jobs',
    profileDesc: 'Update your personal information and settings',
    dashboardDesc: 'Overview of system activity and statistics',

    // Forms & Fields
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    saveChanges: 'Save Changes',
    pickupLocation: 'Pickup Location',
    deliveryLocation: 'Delivery Location',
    packageDetails: 'Package Details',
    weight: 'Weight',
    packageType: 'Package Type',
    estimateFee: 'Estimate Fee',
    submitRequest: 'Submit Request',
    exportPDF: 'Export PDF',
    searchCustomer: 'Search by customer name...',
    showingDeliveries: 'Showing 1-5 of 24 deliveries',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',

    // Tracking
    liveLocation: 'Live Location',
    yourCourier: 'Your Courier',
    messageCourier: 'Message Courier',
    messageAdmin: 'Message Admin',
    contactSupport: 'Contact Support',
    cancelDelivery: 'Cancel Delivery',
    estimatedDelivery: 'Estimated Delivery',
    today: 'Today',
    byTime: 'by 3:00 PM',
    deliveryTimeline: 'Delivery Timeline',

    // Dashboard Cards
    activeDeliveries: 'Active Deliveries',
    completedDeliveries: 'Completed Deliveries',
    activeCouriers: 'Active Couriers',
    totalRevenue: 'Total Revenue',
    acceptJob: 'Accept Job',
  },
  fr: {
    // Sidebar & Navigation
    dashboard: 'Tableau de bord',
    allDeliveries: 'Toutes les livraisons',
    myDeliveries: 'Mes livraisons',
    manageUsers: 'Gérer les utilisateurs',
    createDelivery: 'Créer une livraison',
    trackPackage: 'Suivre le colis',
    available: 'Disponible',
    profile: 'Profil',
    logout: 'Déconnexion',
    deliveryManagement: 'Gestion de livraison',

    // Settings
    settings: 'Paramètres',
    darkMode: 'Mode sombre',
    notifications: 'Notifications',
    language: 'Langue',
    accountSettings: 'Paramètres du compte',
    manage: 'Gérer',

    // Header
    welcome: 'Bienvenue',
    searchPlaceholder: 'Rechercher...',

    // Statuses
    pending: 'En attente',
    inTransit: 'En transit',
    delivered: 'Livré',
    cancelled: 'Annulé',
    all: 'Tout',

    // Landing Page
    features: 'Fonctionnalités',
    howItWorks: 'Comment ça marche',
    contact: 'Contact',
    login: 'Connexion',
    signUp: 'S\'inscrire',
    getStarted: 'Commencer',
    fastReliableTitle: 'Plateforme de livraison rapide et fiable',
    fastReliableSubtitle: 'Contactez-nous pour obtenir un devis sur notre plateforme de livraison de colis rapide et fiable.',
    deliveres: 'Livraisons',
    everythingYouNeed:'Tout ce dont vous avez besoin pour la gestion des livraisons',
    readyToGetStarted: 'Prêt à commencer ?',
    costperDelivery: 'Coût par livraison',
    fastDelivery:'Livraison rapide',
    deliveriesaremade:'Les livraisons sont effectuées dans les 2 heures suivant la demande. Suivez vos livraisons en temps réel.',
    comparepricesandchoose:'Comparez les prix et choisissez la meilleure option pour vos besoins.',
    quickDelivery: 'Livraison efficace',
    getyourpackagesdelivered:'Faites-vous livrer vos colis à domicile en seulement 1 heure.',
    howDeliverXWorks: 'Comment fonctionne DeliverX',
    simplefastandefficient: 'Service de livraison simple, rapide et efficace',
    createRequest:'Créer une demande',
    createadeliveryrequestwithall:'Créez une demande de livraison avec tous les détails nécessaires.',
    CheckAvailability: 'Vérifier la disponibilité',
    Checktheavailabilityof: 'Vérifiez la disponibilité des créneaux de livraison.',
    PlaceOrder:'Passer une commande',
    Placeyourorderonline:'Passez votre commande en ligne ou appelez-nous pour obtenir de l\'aide',
    signUpNow: 'Inscrivez-vous maintenant',
    followUs: 'Suivez-nous',
    copyright: 'Copyright © 2023 DeliverX | Tous droits réservés',

    // Common Page Headers & Descriptions
    allDeliveriesDesc: 'Gérer et suivre toutes vos livraisons',
    myDeliveriesDesc: 'Afficher et suivre vos demandes de colis',
    manageUsersDesc: 'Afficher et gérer tous les utilisateurs du système',
    createDeliveryDesc: 'Saisissez les détails du colis pour réserver une livraison',
    trackPackageDesc: 'Suivi en temps réel de la livraison',
    availableDesc: 'Accepter de nouveaux travaux de livraison',
    profileDesc: 'Mettez à jour vos informations personnelles et vos paramètres',
    dashboardDesc: 'Aperçu de l\'activité du système et statistiques',

    // Forms & Fields
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse e-mail',
    phone: 'Numéro de téléphone',
    saveChanges: 'Enregistrer',
    pickupLocation: 'Lieu de ramassage',
    deliveryLocation: 'Lieu de livraison',
    packageDetails: 'Détails du colis',
    weight: 'Poids',
    packageType: 'Type de colis',
    estimateFee: 'Frais estimés',
    submitRequest: 'Soumettre la demande',
    exportPDF: 'Exporter PDF',
    searchCustomer: 'Rechercher par nom de client...',
    showingDeliveries: 'Affichage de 1 à 5 sur 24 livraisons',
    role: 'Rôle',
    status: 'Statut',
    actions: 'Actions',

    // Tracking
    liveLocation: 'Localisation en direct',
    yourCourier: 'Votre coursier',
    messageCourier: 'Contacter le coursier',
    messageAdmin: 'Contacter l\'admin',
    contactSupport: 'Contacter le support',
    cancelDelivery: 'Annuler la livraison',
    estimatedDelivery: 'Livraison estimée',
    today: 'Aujourd\'hui',
    byTime: 'avant 15h00',
    deliveryTimeline: 'Chronologie de la livraison',

    // Dashboard Cards
    activeDeliveries: 'Livraisons actives',
    completedDeliveries: 'Livraisons terminées',
    activeCouriers: 'Coursiers actifs',
    totalRevenue: 'Revenu total',
    acceptJob: 'Accepter le travail',
  },
  ar: {
    // Sidebar & Navigation
    dashboard: 'لوحة القيادة',
    allDeliveries: 'جميع الشحنات',
    myDeliveries: 'شحناتي',
    manageUsers: 'إدارة المستخدمين',
    createDelivery: 'إنشاء شحنة',
    trackPackage: 'تتبع الشحنة',
    available: 'متاح',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    deliveryManagement: 'إدارة التوصيل',

    // Settings
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    notifications: 'الإشعارات',
    language: 'اللغة',
    accountSettings: 'إعدادات الحساب',
    manage: 'إدارة',

    // Header
    welcome: 'مرحباً',
    searchPlaceholder: 'بحث...',

    // Statuses
    pending: 'قيد الانتظار',
    inTransit: 'في الطريق',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    all: 'الكل',

    // Landing Page
    features: 'المميزات',
    howItWorks: 'كيف يعمل',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    getStarted: 'ابدأ الآن',
    fastReliableTitle: 'منصة توصيل طرود سريعة وموثوقة',
    fastReliableSubtitle: 'اتصل بنا للحصول على عرض سعر على منصتنا السريعة والموثوقة لتوصيل الطرود.',
    readyToGetStarted: 'جاهز للبدء؟',
    signUpNow: 'سجل الآن',
    copyright: 'حقوق النشر © 2023 DeliverX | جميع الحقوق محفوظة',

    // Common Page Headers & Descriptions
    allDeliveriesDesc: 'إدارة وتتبع جميع الشحنات الخاصة بك',
    myDeliveriesDesc: 'عرض وتتبع طلبات الطرود الخاصة بك',
    manageUsersDesc: 'عرض وإدارة جميع مستخدمي النظام',
    createDeliveryDesc: 'أدخل تفاصيل الطرد لحجز شحنة',
    trackPackageDesc: 'تتبع الشحنة في الوقت الحقيقي',
    availableDesc: 'قبول وظائف توصيل جديدة',
    profileDesc: 'تحديث معلوماتك الشخصية وإعداداتك',
    dashboardDesc: 'نظرة عامة على نشاط النظام والإحصائيات',

    // Forms & Fields
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    saveChanges: 'حفظ التغييرات',
    pickupLocation: 'موقع الاستلام',
    deliveryLocation: 'موقع التسليم',
    packageDetails: 'تفاصيل الطرد',
    weight: 'الوزن',
    packageType: 'نوع الطرد',
    estimateFee: 'الرسوم المقدرة',
    submitRequest: 'تقديم الطلب',
    exportPDF: 'تصدير PDF',
    searchCustomer: 'البحث باسم العميل...',
    showingDeliveries: 'عرض 1-5 من أصل 24 شحنة',
    role: 'الدور',
    status: 'الحالة',
    actions: 'الإجراءات',

    // Tracking
    liveLocation: 'الموقع المباشر',
    yourCourier: 'مندوب التوصيل الخاص بك',
    messageCourier: 'مراسلة المندوب',
    messageAdmin: 'مراسلة المسؤول',
    contactSupport: 'الاتصال بالدعم',
    cancelDelivery: 'إلغاء الشحنة',
    estimatedDelivery: 'التوصيل المقدر',
    today: 'اليوم',
    byTime: 'بحلول الساعة 3:00 مساءً',
    deliveryTimeline: 'مخطط التوصيل الزمني',

    // Dashboard Cards
    activeDeliveries: 'الشحنات النشطة',
    completedDeliveries: 'الشحنات المكتملة',
    activeCouriers: 'المناديب النشطين',
    totalRevenue: 'إجمالي الإيرادات',
    acceptJob: 'قبول المهمة',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    // Force English, French, or Arabic only
    if (language !== 'en' && language !== 'fr' && language !== 'ar') {
      setLanguage('en');
    }
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
