import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  // Roles
  roles: {
    admin: string;
    manager: string;
    owner: string;
    tenant: string;
    agent: string;
  };
  // Navigation & Tabs
  tabs: {
    dashboard: string;
    properties: string;
    contracts: string;
    finances: string;
    services: string;
    myRental: string;
    payments: string;
    tickets: string;
    chatAndHelp: string;
    inspection: string;
  };
  // Common
  common: {
    search: string;
    filter: string;
    status: string;
    actions: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    download: string;
    downloadPdf: string;
    back: string;
    next: string;
    loading: string;
    certified: string;
    pending: string;
    rejected: string;
    verified: string;
    active: string;
    available: string;
    occupied: string;
    notice: string;
    maintenance: string;
    landmark: string;
    comments: string;
    addComment: string;
    offlineMode: string;
    onlineMode: string;
    simulatedDevice: string;
    desktopMode: string;
    mobileMode: string;
    switchRole: string;
    aboutAdmin: string;
    escalateDispute: string;
    qrFreeLeaseCode: string;
    enterLeaseCode: string;
    cameraCapture: string;
    takeSelfie: string;
  };
  // Financial
  financial: {
    rentDue: string;
    rentCollected: string;
    unpaidArrears: string;
    penalties: string;
    occupancyRate: string;
    collectionRate: string;
    balanceToPay: string;
    upToDate: string;
    availableCredit: string;
    payRent: string;
    declarePayment: string;
    receiptOfficial: string;
    cashPayment: string;
    mobileMoney: string;
    bankTransfer: string;
    gracePeriod: string;
    dailyPenalty: string;
    rateExchange: string;
  };
  // KYC
  kyc: {
    title: string;
    nationalId: string;
    voterCard: string;
    passport: string;
    studentCard: string;
    pupilCard: string;
    docNumber: string;
    frontPhoto: string;
    backPhoto: string;
    liveSelfie: string;
    emergencyContact: string;
    certifySuccess: string;
    lockedNotice: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    appName: 'LocatifPro',
    tagline: 'SaaS Universel de Gestion Locative & Patrimoine',
    roles: {
      admin: 'Super-Administrateur',
      manager: 'Gestionnaire / Bailleur',
      owner: 'Propriétaire (Mandant)',
      tenant: 'Locataire',
      agent: 'Agent / Technicien',
    },
    tabs: {
      dashboard: 'Tableau de bord',
      properties: 'Patrimoine & Carte',
      contracts: 'Contrats & Locataires',
      finances: 'Finances & Relances',
      services: 'Chat & Entretiens',
      myRental: 'Mon Logement',
      payments: 'Paiements & Quittances',
      tickets: 'Pannes & Entretiens',
      chatAndHelp: 'Chat & Assistance',
      inspection: 'États des Lieux',
    },
    common: {
      search: 'Rechercher...',
      filter: 'Filtrer',
      status: 'Statut',
      actions: 'Actions',
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Consulter',
      close: 'Fermer',
      download: 'Télécharger',
      downloadPdf: 'Télécharger la Quittance PDF',
      back: 'Retour',
      next: 'Continuer',
      loading: 'Chargement...',
      certified: 'Certifié KYC',
      pending: 'En attente',
      rejected: 'Rejeté',
      verified: 'Vérifié',
      active: 'Actif',
      available: 'Disponible',
      occupied: 'Occupé',
      notice: 'Fin proche',
      maintenance: 'Maintenance',
      landmark: 'Point de repère visuel',
      comments: 'Remarques & Photos',
      addComment: 'Ajouter une note ou photo',
      offlineMode: 'Mode Hors-Ligne (Données locales)',
      onlineMode: 'En ligne & Synchronisé',
      simulatedDevice: 'Simulateur Smartphone APK',
      desktopMode: 'Plein Écran Ordinateur',
      mobileMode: 'Vue Mobile',
      switchRole: 'Changer de profil',
      aboutAdmin: "À Propos de l'Administrateur",
      escalateDispute: 'Escalade vers Super-Admin',
      qrFreeLeaseCode: 'Code Unique de Bail (Sans QR Code)',
      enterLeaseCode: 'Saisir mon Code de Bail reçu',
      cameraCapture: 'Capture Caméra en direct',
      takeSelfie: 'Prendre un Selfie en direct',
    },
    financial: {
      rentDue: 'Loyers attendus',
      rentCollected: 'Loyers encaissés',
      unpaidArrears: 'Impayés & Retards',
      penalties: 'Pénalités appliquées',
      occupancyRate: "Taux d'occupation",
      collectionRate: 'Taux de recouvrement',
      balanceToPay: 'Solde à payer',
      upToDate: 'À jour de paiement',
      availableCredit: 'Avance disponible',
      payRent: 'Payer mon loyer',
      declarePayment: 'Déclarer un versement',
      receiptOfficial: 'Quittance officielle certifiée',
      cashPayment: 'Encaissement Espèces (Cash)',
      mobileMoney: 'Mobile Money (M-Pesa / Orange / Airtel)',
      bankTransfer: 'Banque locale (Rawbank / Equity / TMB)',
      gracePeriod: 'Délai de grâce',
      dailyPenalty: 'Pénalité par jour de retard',
      rateExchange: 'Taux du jour (1 USD = CDF)',
    },
    kyc: {
      title: 'Vérification d’Identité Obligatoire (KYC)',
      nationalId: "Carte d'Identité Nationale",
      voterCard: "Carte d'Électeur",
      passport: 'Passeport',
      studentCard: "Carte d'Étudiant",
      pupilCard: "Carte d'Élève",
      docNumber: 'Numéro de la pièce',
      frontPhoto: 'Photo Recto',
      backPhoto: 'Photo Verso',
      liveSelfie: 'Selfie de contrôle en direct',
      emergencyContact: "Contact d'Urgence",
      certifySuccess: 'Profil certifié avec succès',
      lockedNotice: 'Vos pièces sont verrouillées et infalsifiables.',
    },
  },
  sw: {
    appName: 'LocatifPro',
    tagline: 'Mfumo Kamili wa Kusimamia Nyumba na Kodi',
    roles: {
      admin: 'Msimamizi Mkuu (Admin)',
      manager: 'Mwenye Nyumba / Wakala',
      owner: 'Mmiliki wa Mali',
      tenant: 'Mpangaji',
      agent: 'Fundi / Mkaguzi',
    },
    tabs: {
      dashboard: 'Dashibodi Kuu',
      properties: 'Mali na Ramani',
      contracts: 'Mikataba na Wapangaji',
      finances: 'Fedha na Vikumbusho',
      services: 'Mazungumzo & Matengenezo',
      myRental: 'Nyumba Yangu',
      payments: 'Malipo na Risiti',
      tickets: 'Hitilafu na Matengenezo',
      chatAndHelp: 'Msaada na Upatanishi',
      inspection: 'Ukaguzi wa Nyumba',
    },
    common: {
      search: 'Tafuta...',
      filter: 'Chuja',
      status: 'Hali',
      actions: 'Vitendo',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      confirm: 'Thibitisha',
      delete: 'Futa',
      edit: 'Badilisha',
      view: 'Angalia',
      close: 'Funga',
      download: 'Pakua',
      downloadPdf: 'Pakua Risiti ya PDF',
      back: 'Nyuma',
      next: 'Endelea',
      loading: 'Inapakia...',
      certified: 'Imeidhinishwa KYC',
      pending: 'Inasubiri',
      rejected: 'Imekataliwa',
      verified: 'Imethibitishwa',
      active: 'Inafanya kazi',
      available: 'Ipo Wazi',
      occupied: 'Ina Mtu',
      notice: 'Muda Karibu Kuisha',
      maintenance: 'Ukarabati',
      landmark: 'Kielelezo cha Eneo (Alama)',
      comments: 'Maoni na Picha',
      addComment: 'Weka maoni au picha',
      offlineMode: 'Hali ya Nje ya Mtandao',
      onlineMode: 'Mtandaoni na Imesawazishwa',
      simulatedDevice: 'Mwonekano wa Simu (APK)',
      desktopMode: 'Mwonekano wa Kompyuta',
      mobileMode: 'Mwonekano wa Simu',
      switchRole: 'Badili Nafasi',
      aboutAdmin: 'Kuhusu Msimamizi Mkuu',
      escalateDispute: 'Peleka Malalamiko kwa Admin',
      qrFreeLeaseCode: 'Nambari ya Mkataba (Bila QR Code)',
      enterLeaseCode: 'Ingiza Nambari ya Mkataba',
      cameraCapture: 'Piga Picha ya Moja kwa Moja',
      takeSelfie: 'Piga Picha ya Uso (Selfie)',
    },
    financial: {
      rentDue: 'Kodi Inayotarajiwa',
      rentCollected: 'Kodi Iliyopokelewa',
      unpaidArrears: 'Malimbikizo na Faini',
      penalties: 'Faini Zilizotozwa',
      occupancyRate: 'Kiwango cha Upangaji',
      collectionRate: 'Kiwango cha Ukusanyaji',
      balanceToPay: 'Salio la Kulipa',
      upToDate: 'Umelipa Kikamilifu',
      availableCredit: 'Pesa ya Ziada',
      payRent: 'Lipa Kodi Sasa',
      declarePayment: 'Tuma Uthibitisho wa Malipo',
      receiptOfficial: 'Risiti Rasmi ya Kisheria',
      cashPayment: 'Malipo ya Pesa Taslimu (Cash)',
      mobileMoney: 'Simu ya Mkononi (M-Pesa / Airtel / Orange)',
      bankTransfer: 'Benki (Rawbank / Equity / TMB)',
      gracePeriod: 'Siku za Kusubiri Kabla ya Faini',
      dailyPenalty: 'Faini kwa Kila Siku ya Ucheleweshaji',
      rateExchange: 'Kiwango cha Kubadilisha (1 USD = CDF)',
    },
    kyc: {
      title: 'Uhakiki wa Utambulisho (KYC)',
      nationalId: 'Kitambulisho cha Taifa',
      voterCard: 'Kadi ya Mpiga Kura',
      passport: 'Pasipoti',
      studentCard: 'Kitambulisho cha Mwanafunzi',
      pupilCard: 'Kitambulisho cha Shule',
      docNumber: 'Nambari ya Hati',
      frontPhoto: 'Picha ya Mbele',
      backPhoto: 'Picha ya Nyuma',
      liveSelfie: 'Picha ya Uso wa Moja kwa Moja',
      emergencyContact: 'Mtu wa Dharura',
      certifySuccess: 'Utambulisho Umethibitishwa',
      lockedNotice: 'Hati zako zimefungwa kuzuia udanganyifu.',
    },
  },
  ln: {
    appName: 'LocatifPro',
    tagline: 'Bongisa Kotekisa na Kofutisa Ndako na Lolenge ya Peto',
    roles: {
      admin: 'Mokonzi ya Ebandeli (Admin)',
      manager: 'Mobongisi Ndako / Nkolo',
      owner: 'Nkolo Lopango',
      tenant: 'Mofuti Ndako',
      agent: 'Motongi / Mokengeli',
    },
    tabs: {
      dashboard: 'Liboso ya Kazi',
      properties: 'Bandako na Karti',
      contracts: 'Mikanda na Bafuti',
      finances: 'Mbongo na Bokundoli',
      services: 'Masolo & Kobongisa',
      myRental: 'Ndako na Ngai',
      payments: 'Kofuta na Risiti',
      tickets: 'Mbeba na Kobongisa',
      chatAndHelp: 'Kosolola na Lisalisi',
      inspection: 'Botalisi Ndako',
    },
    common: {
      search: 'Luká...',
      filter: 'Pona',
      status: 'Lolenge',
      actions: 'Misala',
      save: 'Bomba',
      cancel: 'Tika',
      confirm: 'Ndimisa',
      delete: 'Longola',
      edit: 'Bongisa',
      view: 'Tala',
      close: 'Kanga',
      download: 'Kitisa',
      downloadPdf: 'Kitisa Risiti PDF',
      back: 'Zonga',
      next: 'Kende liboso',
      loading: 'Ezali koya...',
      certified: 'Endimami KYC',
      pending: 'Ezali kozela',
      rejected: 'Eboyami',
      verified: 'Etalemi',
      active: 'Ezali kosala',
      available: 'Ezali pamba',
      occupied: 'Mofuti azali',
      notice: 'Kaka moke esila',
      maintenance: 'Kobongisa',
      landmark: 'Elembo ya Esika',
      comments: 'Makanisi & Bafoto',
      addComment: 'Bakisa liyebisi to foto',
      offlineMode: 'Kosala kozanga Internet',
      onlineMode: 'Internet ezali & esangisi nyonso',
      simulatedDevice: 'Mekola Telefoni (APK)',
      desktopMode: 'Kompiuta ya Munene',
      mobileMode: 'Telefoni',
      switchRole: 'Bongola Kiti',
      aboutAdmin: 'Makanisi ya Mokonzi',
      escalateDispute: 'Kunda Likambo na Mokonzi Admin',
      qrFreeLeaseCode: 'Nimero ya Mukanda (Kozanga QR Code)',
      enterLeaseCode: 'Kotisa Nimero ya Mukanda',
      cameraCapture: 'Kamata Foto ya Kamela',
      takeSelfie: 'Kamata Elongi na yo',
    },
    financial: {
      rentDue: 'Mbongo ya Ndako Ezelami',
      rentCollected: 'Mbongo Ezwami',
      unpaidArrears: 'Nyongo na Mandat',
      penalties: 'Mandat ya Kowelisa',
      occupancyRate: 'Motango ya Bandako Etondi',
      collectionRate: 'Kozwa Mbongo',
      balanceToPay: 'Mbongo Etikali Kofuta',
      upToDate: 'Ofuti Nyonso',
      availableCredit: 'Mbongo ya Boponami Liboso',
      payRent: 'Futa Mbongo ya Ndako',
      declarePayment: 'Tinda Elembo ya Kofuta',
      receiptOfficial: 'Risiti ya Leta na Mokonzi',
      cashPayment: 'Mbongo ya Maboko (Cash)',
      mobileMoney: 'Mbongo na Telefoni (M-Pesa / Orange / Airtel)',
      bankTransfer: 'Banque (Rawbank / Equity / TMB)',
      gracePeriod: 'Mikolo ya Bozeli Liboso ya Mandat',
      dailyPenalty: 'Mandat ya Mokolo na Mokolo',
      rateExchange: 'Taux ya Lelo (1 USD = CDF)',
    },
    kyc: {
      title: 'Kondimisa Biso Nani Oza (KYC)',
      nationalId: 'Karti ya Ekolo',
      voterCard: 'Karti ya Kopona',
      passport: 'Passeport',
      studentCard: 'Karti ya Eteyelo',
      pupilCard: 'Karti ya Kelasi',
      docNumber: 'Nimero ya Karti',
      frontPhoto: 'Foto ya Liboso',
      backPhoto: 'Foto ya Sima',
      liveSelfie: 'Foto ya Elongi na yo mpenza',
      emergencyContact: 'Moko ya Libota mpo na Libanga',
      certifySuccess: 'Profil na yo endimami',
      lockedNotice: 'Mikanda na yo ebatelami makasi.',
    },
  },
  en: {
    appName: 'LocatifPro',
    tagline: 'Universal Property & Rental Management SaaS',
    roles: {
      admin: 'Super Administrator',
      manager: 'Property Manager / Landlord',
      owner: 'Property Owner (Principal)',
      tenant: 'Tenant',
      agent: 'Field Agent / Inspector',
    },
    tabs: {
      dashboard: 'Dashboard',
      properties: 'Properties & Map',
      contracts: 'Contracts & Tenants',
      finances: 'Finances & Reminders',
      services: 'Chat & Meetings',
      myRental: 'My Rental',
      payments: 'Payments & Receipts',
      tickets: 'Maintenance & Repairs',
      chatAndHelp: 'Chat & Support',
      inspection: 'Digital Walkthroughs',
    },
    common: {
      search: 'Search...',
      filter: 'Filter',
      status: 'Status',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      download: 'Download',
      downloadPdf: 'Download Official PDF Receipt',
      back: 'Back',
      next: 'Continue',
      loading: 'Loading...',
      certified: 'KYC Certified',
      pending: 'Pending',
      rejected: 'Rejected',
      verified: 'Verified',
      active: 'Active',
      available: 'Available',
      occupied: 'Occupied',
      notice: 'Notice Given',
      maintenance: 'Maintenance',
      landmark: 'Visual Landmark',
      comments: 'Notes & Photos',
      addComment: 'Add note or photo',
      offlineMode: 'Offline Mode (Local Storage)',
      onlineMode: 'Online & Synced',
      simulatedDevice: 'Mobile APK Frame',
      desktopMode: 'Desktop Full-Width',
      mobileMode: 'Mobile View',
      switchRole: 'Switch Role Profile',
      aboutAdmin: 'About Platform Administrator',
      escalateDispute: 'Escalate Dispute to Super-Admin',
      qrFreeLeaseCode: 'Unique Lease Code (No QR Code)',
      enterLeaseCode: 'Enter Received Lease Code',
      cameraCapture: 'Live Camera Capture',
      takeSelfie: 'Take Live Selfie',
    },
    financial: {
      rentDue: 'Expected Rent',
      rentCollected: 'Collected Rent',
      unpaidArrears: 'Unpaid & Overdue',
      penalties: 'Applied Late Fees',
      occupancyRate: 'Occupancy Rate',
      collectionRate: 'Collection Rate',
      balanceToPay: 'Outstanding Balance',
      upToDate: 'Up to Date',
      availableCredit: 'Advance Credit',
      payRent: 'Pay Rent Now',
      declarePayment: 'Submit Payment Proof',
      receiptOfficial: 'Certified Official Receipt',
      cashPayment: 'Cash In-Person Receipt',
      mobileMoney: 'Mobile Money (M-Pesa / Orange / Airtel)',
      bankTransfer: 'Local Bank (Rawbank / Equity / TMB)',
      gracePeriod: 'Grace Period',
      dailyPenalty: 'Daily Late Fee',
      rateExchange: 'Daily Exchange Rate (1 USD = CDF)',
    },
    kyc: {
      title: 'Mandatory Identity Verification (KYC)',
      nationalId: 'National Identity Card',
      voterCard: 'Voter Registration Card',
      passport: 'Passport',
      studentCard: 'Student Card',
      pupilCard: 'Pupil Card',
      docNumber: 'Document Number',
      frontPhoto: 'Front Photo',
      backPhoto: 'Back Photo',
      liveSelfie: 'Live Verification Selfie',
      emergencyContact: 'Emergency Contact',
      certifySuccess: 'Profile certified successfully',
      lockedNotice: 'Documents are locked and tamper-proof.',
    },
  },
};
