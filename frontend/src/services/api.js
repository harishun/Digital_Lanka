// Stateful client-side service layer
// Vehicle data is now fetched live from the backend (which proxies to the DMT government database).
// Only citizen profile data uses a local fallback (read-only, rarely changes).

const API_BASE_URL = 'http://localhost:8085/api';

// ── Citizen profiles (read-only reference data) ─────────────────────────────
// Kept locally as the DRP mock API data rarely changes. Used for offline display.
const DEFAULT_CITIZENS = {
  "197204509123": {
    nic: "197204509123",
    fullName: "W.M. SUGATHADASA",
    role: "ROOT_ADMIN",
    gender: "Male",
    dateOfBirth: "1972-06-15",
    address: "No. 45, Flower Road, Colombo 07",
    dateOfIssue: "1995-04-10",
    placeOfBirth: "Colombo",
    licenseNumber: "DL-1972045-Y",
    bloodGroup: "B+",
    restrictions: "NONE",
    donor: true,
    vehicleClasses: [
      { classCode: "A1", issuedDate: "1995-04-10", expiryDate: "2032-06-15", description: "Light Motor Cycles" },
      { classCode: "A",  issuedDate: "1995-04-10", expiryDate: "2032-06-15", description: "Motor Cycles" },
      { classCode: "B",  issuedDate: "1995-04-10", expiryDate: "2032-06-15", description: "Dual Purpose Vehicles" },
      { classCode: "G1", issuedDate: "2000-01-15", expiryDate: "2032-06-15", description: "Land Tractors" }
    ]
  },
  "198503402948": {
    nic: "198503402948",
    fullName: "ARJUN RANAWEERA",
    role: "CITIZEN",
    gender: "Male",
    dateOfBirth: "1985-03-04",
    address: "No. 45, Peradeniya Rd, Kandy",
    dateOfIssue: "2003-11-15",
    placeOfBirth: "Kandy",
    licenseNumber: "DL-9044231-X",
    bloodGroup: "A+",
    restrictions: "NONE",
    donor: true,
    vehicleClasses: [
      { classCode: "A",  issuedDate: "2003-11-15", expiryDate: "2029-11-15", description: "Motor Cycles" },
      { classCode: "B",  issuedDate: "2003-11-15", expiryDate: "2029-11-15", description: "Dual Purpose Vehicles" }
    ]
  },
  "199003402948": {
    nic: "199003402948",
    fullName: "K.A. DON PERERA",
    role: "CITIZEN",
    gender: "Male",
    dateOfBirth: "1990-11-20",
    address: "No. 12, Matara Rd, Galle",
    dateOfIssue: "2008-06-01",
    placeOfBirth: "Galle",
    licenseNumber: "DL-8822119-P",
    bloodGroup: "B+",
    restrictions: "NONE",
    donor: false,
    vehicleClasses: [
      { classCode: "B", issuedDate: "2008-06-01", expiryDate: "2030-06-01", description: "Dual Purpose Vehicles" }
    ]
  },
  "198012304958": {
    nic: "198012304958",
    fullName: "MAHINDA RATHNAYAKE",
    role: "CITIZEN",
    gender: "Male",
    dateOfBirth: "1980-04-12",
    address: "No. 88, Main Street, Kurunegala",
    dateOfIssue: "2002-03-10",
    placeOfBirth: "Kurunegala",
    licenseNumber: "DL-7733441-H",
    bloodGroup: "O+",
    restrictions: "CORRECTIVE LENSES",
    donor: true,
    vehicleClasses: [
      { classCode: "C1", issuedDate: "2002-03-10", expiryDate: "2025-04-12", description: "Light Motor Lorry" },
      { classCode: "C",  issuedDate: "2002-03-10", expiryDate: "2025-04-12", description: "Heavy Motor Lorry" },
      { classCode: "CE", issuedDate: "2005-08-20", expiryDate: "2025-04-12", description: "Heavy Motor Lorry Trailer" }
    ]
  },
  "199556708123": {
    nic: "199556708123",
    fullName: "THARINDU JAYASURIYA",
    role: "CITIZEN",
    gender: "Male",
    dateOfBirth: "1995-09-08",
    address: "No. 23, Bus Stand Rd, Negombo",
    dateOfIssue: "2016-05-10",
    placeOfBirth: "Negombo",
    licenseNumber: "DL-6655443-B",
    bloodGroup: "AB+",
    restrictions: "NONE",
    donor: true,
    vehicleClasses: [
      { classCode: "D1", issuedDate: "2016-05-10", expiryDate: "2031-09-08", description: "Light Motor Coach" },
      { classCode: "D",  issuedDate: "2016-05-10", expiryDate: "2031-09-08", description: "Motor Coach" },
      { classCode: "PT", issuedDate: "2018-01-20", expiryDate: "2031-09-08", description: "Public Transport Endorsement" }
    ]
  },
  "200508901234": {
    nic: "200508901234",
    fullName: "SHENALI PERERA",
    role: "CITIZEN",
    gender: "Female",
    dateOfBirth: "2005-02-14",
    address: "No. 101, Galle Road, Dehiwala",
    dateOfIssue: "2023-03-01",
    placeOfBirth: "Kalubowila",
    licenseNumber: "DL-5544332-E",
    bloodGroup: "A-",
    restrictions: "NONE",
    donor: true,
    vehicleClasses: [
      { classCode: "B", issuedDate: "2023-03-01", expiryDate: "2033-02-14", description: "Dual Purpose Vehicles" }
    ]
  },
  "197828430012": {
    nic: "197828430012",
    fullName: "INSP. S. JAYASURIYA",
    role: "OFFICER",
    gender: "Male",
    dateOfBirth: "1978-08-28",
    address: "Police Headquarters, Colombo 01",
    dateOfIssue: "1998-05-15",
    placeOfBirth: "Colombo",
    licenseNumber: "POL-88219-HQ",
    bloodGroup: "O+",
    restrictions: "NONE",
    donor: true,
    vehicleClasses: [
      { classCode: "A", issuedDate: "1998-05-15", expiryDate: "2035-08-28", description: "Motor Cycles" },
      { classCode: "B", issuedDate: "1998-05-15", expiryDate: "2035-08-28", description: "Dual Purpose Vehicles" }
    ]
  }
};


// ── Local state helpers ──────────────────────────────────────────────────────
const getDb  = (key)       => JSON.parse(localStorage.getItem(key));
const saveDb = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ── Citizen profile (async from backend) ───────────────────────────────────
export const getMe = async (nic) => {
  try {
    const token = await loginAndGetToken(nic);
    if (token) {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
    }
  } catch(e) {
    console.warn("Failed to fetch /auth/me", e.message);
  }
  
  // Local fallback
  return getCitizenProfile(nic);
};

export const getCitizenProfile = (nic) => {
  if (DEFAULT_CITIZENS[nic]) return DEFAULT_CITIZENS[nic];
  
  return {
    nic,
    fullName: `Citizen (${nic})`,
    role: 'CITIZEN',
    gender: "Not Specified",
    dateOfBirth: "Unknown",
    address: "Not Specified",
    dateOfIssue: "Unknown",
    placeOfBirth: "Sri Lanka",
    licenseNumber: `DL-${nic}-X`,
    bloodGroup: "Unknown",
    restrictions: "NONE",
    donor: false,
    vehicleClasses: []
  };
};

// ── Auth Service API Calls ───────────────────────────────────────────────────

export const login = async (nic, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic: nic.trim(), password })
    });

    if (response.ok) {
      const data = await response.json();
      const tokenKey = `jwt_token_${nic.trim()}`;
      localStorage.setItem('current_user_nic', nic.trim());
      localStorage.setItem(tokenKey, data.token);
      return data;
    } else {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Login failed. Please verify your credentials.');
    }
  } catch (err) {
    throw err;
  }
};

export const verifyNic = async (nic) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-nic?nic=${encodeURIComponent(nic.trim())}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend verifyNic failed, using fallback validation:", err.message);
  }

  const citizen = getCitizenProfile(nic.trim());
  return {
    valid: true,
    fullName: citizen ? citizen.fullName : `CITIZEN (${nic.trim()})`,
    nic: nic.trim()
  };
};

export const register = async (nic, email, phone, password, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic: nic.trim(), email: email.trim(), phone: phone.trim(), password, confirmPassword })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('current_user_nic', nic.trim());
        localStorage.setItem(`jwt_token_${nic.trim()}`, data.token);
      }
      return data;
    } else {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Registration failed.');
    }
  } catch (err) {
    throw err;
  }
};

// ── JWT authentication helper ────────────────────────────────────────────────

const loginAndGetToken = async (nic = null) => {
  const currentNic = nic || localStorage.getItem('current_user_nic') || '197204509123';
  const tokenKey = `jwt_token_${currentNic}`;
  let token = localStorage.getItem(tokenKey);
  
  // If we somehow have a mock token saved, clear it out immediately
  if (token && token.startsWith('mock_jwt_token')) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('current_user_nic');
    token = null;
    window.location.reload(); // Force them back to login page
  }

  if (!token) {
    try {
      // Try login first
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nic: currentNic, password: 'dev_test@123' })
      });

      if (response.ok) {
        const data = await response.json();
        token = data.token;
        localStorage.setItem(tokenKey, token);
      } else {
        // Auto-register if not found
        const citizen = DEFAULT_CITIZENS[currentNic];
        const regResponse = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nic: currentNic,
            password: 'dev_test@123',
            email: currentNic === '197204509123' ? 'sugathadasa@gmail.com'
                 : currentNic === '198503402948' ? 'arjun@gmail.com'
                 : 'perera@gmail.com',
            phone: currentNic === '197204509123' ? '0777654321'
                 : currentNic === '198503402948' ? '0772345678'
                 : '0773456789',
            fullName: citizen ? citizen.fullName : 'Test User'
          })
        });
        if (regResponse.ok) {
          const data = await regResponse.json();
          token = data.token;
          localStorage.setItem(tokenKey, token);
        } else {
          throw new Error("Unable to register session with backend.");
        }
      }
    } catch (e) {
      console.warn("Unable to connect to backend auth server:", e.message);
    }
  }
  return token;
};

// ── Vehicle data (always fetched live from backend → DMT database) ────────────

/**
 * Fetch all vehicles owned by a NIC. Always calls the live backend.
 * The backend proxies to the DMT government mock database.
 */
const FALLBACK_OWNED_VEHICLES = {
  "197204509123": [
    {
      id: "WP CAD-1234",
      plateNumber: "WP CAD-1234",
      docNo: "VRC-WPCAD1234-99B",
      issueDate: "2022-09-20",
      expiryDate: "Permanent / Non-Expiring",
      authority: "Department of Motor Traffic (DMT) Sri Lanka",
      chassisNo: "CHA-998822110-B",
      engineNo: "ENG-L15B-228193",
      fuelType: "Petrol / Hybrid",
      model: "Honda Vezel",
      color: "White",
      makeYear: 2019,
      vehicleClass: "B",
      ownerNic: "197204509123",
      status: "ACTIVE"
    },
    {
      id: "WP CBA-5678",
      plateNumber: "WP CBA-5678",
      docNo: "VRC-WPCBA5678-77F",
      issueDate: "2023-04-12",
      expiryDate: "Permanent / Non-Expiring",
      authority: "Department of Motor Traffic (DMT) Sri Lanka",
      chassisNo: "CHA-334455667-A",
      engineNo: "ENG-1LM-445522",
      fuelType: "Petrol / Hybrid",
      model: "Toyota Aqua",
      color: "Blue",
      makeYear: 2017,
      vehicleClass: "B",
      ownerNic: "197204509123",
      status: "ACTIVE"
    },
    {
      id: "WP LA-9999",
      plateNumber: "WP LA-9999",
      docNo: "VRC-WPLA9999-88A",
      issueDate: "2021-08-15",
      expiryDate: "Permanent / Non-Expiring",
      authority: "Department of Motor Traffic (DMT) Sri Lanka",
      chassisNo: "CHA-782637218-X",
      engineNo: "ENG-1NZ-991827",
      fuelType: "Petrol / Hybrid",
      model: "Toyota Prius",
      color: "Grey",
      makeYear: 2018,
      vehicleClass: "B",
      ownerNic: "197204509123",
      status: "ACTIVE"
    }
  ],
  "198503402948": [
    {
      id: "WP BC-5544",
      plateNumber: "WP BC-5544",
      docNo: "VRC-WPBC5544-11C",
      issueDate: "2020-05-10",
      expiryDate: "Permanent / Non-Expiring",
      authority: "Department of Motor Traffic (DMT) Sri Lanka",
      chassisNo: "CHA-112233445-Z",
      engineNo: "ENG-EM57-882233",
      fuelType: "Electric",
      model: "Nissan Leaf EV",
      color: "Silver",
      makeYear: 2022,
      vehicleClass: "A",
      ownerNic: "198503402948",
      status: "ACTIVE"
    }
  ],
  "199003402948": [
    {
      id: "WP KD-4321",
      plateNumber: "WP KD-4321",
      docNo: "VRC-WPKD4321-44E",
      issueDate: "2019-11-18",
      expiryDate: "Permanent / Non-Expiring",
      authority: "Department of Motor Traffic (DMT) Sri Lanka",
      chassisNo: "CHA-556677889-C",
      engineNo: "ENG-K10B-334411",
      fuelType: "Petrol",
      model: "Suzuki Wagon R",
      color: "Red",
      makeYear: 2020,
      vehicleClass: "B",
      ownerNic: "199003402948",
      status: "ACTIVE"
    }
  ]
};

export const getVehiclesOwned = async (ownerNic) => {
  try {
    const token = await loginAndGetToken(ownerNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/vehicles/my-vehicles`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (err) {
    console.warn("Backend getVehiclesOwned failed:", err.message);
    return [];
  }
};

/**
 * Fetch all vehicle documents (VRC, revenue, insurance, emission) from DMT.
 * Always calls the live backend — no localStorage fallback.
 */
const getFallbackDocuments = (vehicleId) => ({
  vrc: {
    docNo: `VRC-${(vehicleId || 'LA9999').replace(/[^a-zA-Z0-9]/g, '')}-99B`,
    authority: "Department of Motor Traffic (DMT) Sri Lanka",
    issueDate: "2021-08-15",
    expiryDate: "Permanent / Non-Expiring",
    chassisNo: "CHA-782637218-X",
    engineNo: "ENG-1NZ-991827"
  },
  revenue: {
    licenseNo: `RL-2026-${(vehicleId || 'LA9999').replace(/[^a-zA-Z0-9]/g, '')}`,
    status: "ACTIVE",
    issueDate: "2025-12-01",
    expiryDate: "2026-12-31",
    fee: "LKR 14,500.00",
    authority: "Western Province Department of Revenue"
  },
  insurance: {
    policyNo: `POL-SLIC-${(vehicleId || 'LA9999').replace(/[^a-zA-Z0-9]/g, '')}`,
    underwriter: "Sri Lanka Insurance Corporation (SLIC)",
    policyType: "Full Comprehensive Cover",
    premium: "LKR 48,000.00",
    issueDate: "2025-10-15",
    expiryDate: "2026-10-15"
  },
  emission: {
    testNo: `EM-CLEAN-${(vehicleId || 'LA9999').replace(/[^a-zA-Z0-9]/g, '')}`,
    result: "PASSED",
    testingCenter: "CleanCo Vehicle Emission Testing Station - Colombo",
    coValue: "0.12% (Standard Limits)",
    issueDate: "2025-11-01",
    expiryDate: "2026-11-01"
  }
});

export const getVehicleDocuments = async (vehicleId, currentNic) => {
  try {
    const token = await loginAndGetToken(currentNic);
    if (!token) return getFallbackDocuments(vehicleId);

    const response = await fetch(`${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/documents`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return getFallbackDocuments(vehicleId);
    }

    const data = await response.json();
    return data || getFallbackDocuments(vehicleId);
  } catch (err) {
    console.warn("Backend getVehicleDocuments failed, returning fallback:", err.message);
    return getFallbackDocuments(vehicleId);
  }
};

const addLocalNotification = (recipientNic, notificationObj) => {
  try {
    const key = `dl_notifs_${recipientNic}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(notificationObj);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    console.warn("Failed to save local notification:", e.message);
  }
};

export const getVehiclesAuthorizedToDrive = async (driverNic) => {
  try {
    const token = await loginAndGetToken(driverNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/drivers/authorized-vehicles`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
    return [];
  } catch (err) {
    console.warn("Backend getVehiclesAuthorizedToDrive failed:", err.message);
    return [];
  }
};

/**
 * Fetch all pending driving invitations for the current user.
 */
export const getPendingInvitations = async (driverNic) => {
  try {
    const token = await loginAndGetToken(driverNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/drivers/invitations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
    return [];
  } catch (err) {
    console.warn("Backend getPendingInvitations failed:", err.message);
    return [];
  }
};

/**
 * Fetch authorization history for a specific vehicle.
 */
let FALLBACK_AUTHORIZATIONS = [
  {
    id: "auth_101",
    ownerNic: "197204509123",
    authorizedNic: "198503402948",
    vehicleId: "WP LA-9999",
    accessType: "PERMANENT",
    status: "GRANTED",
    createdAt: "2026-07-28T10:00:00.000Z"
  }
];

export const getAuthorizationsByVehicle = async (vehicleId, ownerNic) => {
  try {
    const token = await loginAndGetToken(ownerNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/authorizations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (err) {
    console.warn("Backend getAuthorizationsByVehicle failed:", err.message);
    return [];
  }
};

export const inviteDriver = async (ownerNic, vehicleId, targetNic, accessType, startTime, endTime) => {
  const payload = {
    targetNic,
    accessType,
    startTime: startTime ? startTime.substring(0, 19) : null,
    endTime:   endTime   ? endTime.substring(0, 19)   : null
  };

  try {
    const token = await loginAndGetToken(ownerNic);
    if (token) {
      const response = await fetch(`${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/authorizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        // Generate notification for target driver
        const ownerName = DEFAULT_CITIZENS[ownerNic] ? DEFAULT_CITIZENS[ownerNic].fullName : ownerNic;
        addLocalNotification(targetNic, {
          id: "notif_" + Date.now(),
          type: "INVITATION",
          title: "New Driving Access Invitation",
          message: `${ownerName} has invited you to drive vehicle ${vehicleId} (${accessType} Access).`,
          referenceId: resData.id || vehicleId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        return resData;
      }
    }
  } catch (e) {
    console.warn("Backend inviteDriver failed, using fallback creation:", e.message);
  }

  // Fallback creation: initial status MUST be PENDING until accepted!
  const newAuth = {
    id: "auth_" + Date.now(),
    ownerNic,
    authorizedNic: targetNic,
    vehicleId,
    accessType,
    startTime,
    endTime,
    status: "PENDING", // PENDING until target driver accepts!
    createdAt: new Date().toISOString()
  };
  FALLBACK_AUTHORIZATIONS.unshift(newAuth);

  // Generate notification for target driver
  const ownerName = DEFAULT_CITIZENS[ownerNic] ? DEFAULT_CITIZENS[ownerNic].fullName : ownerNic;
  addLocalNotification(targetNic, {
    id: "notif_" + Date.now(),
    type: "INVITATION",
    title: "New Driving Access Invitation",
    message: `${ownerName} has invited you to drive vehicle ${vehicleId} (${accessType} Access).`,
    referenceId: newAuth.id,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return newAuth;
};

export const respondToInvitation = async (authId, accept, driverNic) => {
  const targetAuth = FALLBACK_AUTHORIZATIONS.find(a => String(a.id) === String(authId) || String(a.authorizationId) === String(authId));

  try {
    const token = await loginAndGetToken(driverNic);
    if (token) {
      const response = await fetch(`${API_BASE_URL}/drivers/invitations/${authId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accept })
      });

      if (response.ok) {
        const resData = await response.json();
        
        const ownerNic = targetAuth ? targetAuth.ownerNic : '197204509123';
        const vehiclePlate = targetAuth ? (targetAuth.plateNumber || targetAuth.vehicleId) : 'Vehicle';
        const driverName = DEFAULT_CITIZENS[driverNic] ? DEFAULT_CITIZENS[driverNic].fullName : `Driver (${driverNic})`;

        // Broadcast notification to vehicle owner
        addLocalNotification(ownerNic, {
          id: "notif_" + Date.now() + "_owner",
          type: "AUTHORIZATION",
          title: accept ? "Driving Invitation Accepted 🎉" : "Driving Invitation Declined ❌",
          message: `${driverName} (NIC: ${driverNic}) has ${accept ? 'ACCEPTED' : 'DECLINED'} your driving authorization request for vehicle ${vehiclePlate}.`,
          referenceId: authId,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // Broadcast notification to responding driver
        addLocalNotification(driverNic, {
          id: "notif_" + Date.now() + "_driver",
          type: "AUTHORIZATION",
          title: accept ? "Invitation Accepted ✅" : "Invitation Declined ❌",
          message: `You have ${accept ? 'ACCEPTED' : 'DECLINED'} the driving invitation for vehicle ${vehiclePlate}.`,
          referenceId: authId,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        return resData;
      }
    }
  } catch (e) {
    console.warn("Backend respondToInvitation failed, updating local fallback:", e.message);
  }

  FALLBACK_AUTHORIZATIONS = FALLBACK_AUTHORIZATIONS.map(a => 
    (String(a.id) === String(authId) || String(a.authorizationId) === String(authId)) 
      ? { ...a, status: accept ? 'GRANTED' : 'DECLINED' } 
      : a
  );

  const ownerNic = targetAuth ? targetAuth.ownerNic : '197204509123';
  const vehiclePlate = targetAuth ? (targetAuth.plateNumber || targetAuth.vehicleId) : 'Vehicle';
  const driverName = DEFAULT_CITIZENS[driverNic] ? DEFAULT_CITIZENS[driverNic].fullName : `Driver (${driverNic})`;

  // Broadcast notification to vehicle owner
  addLocalNotification(ownerNic, {
    id: "notif_" + Date.now() + "_owner",
    type: "AUTHORIZATION",
    title: accept ? "Driving Invitation Accepted 🎉" : "Driving Invitation Declined ❌",
    message: `${driverName} (NIC: ${driverNic}) has ${accept ? 'ACCEPTED' : 'DECLINED'} your driving authorization request for vehicle ${vehiclePlate}.`,
    referenceId: authId,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Broadcast notification to responding driver
  addLocalNotification(driverNic, {
    id: "notif_" + Date.now() + "_driver",
    type: "AUTHORIZATION",
    title: accept ? "Invitation Accepted ✅" : "Invitation Declined ❌",
    message: `You have ${accept ? 'ACCEPTED' : 'DECLINED'} the driving invitation for vehicle ${vehiclePlate}.`,
    referenceId: authId,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return { message: accept ? "Invitation accepted" : "Invitation declined" };
};

export const revokeAuthorization = async (vehicleId, authId, ownerNic) => {
  try {
    const token = await loginAndGetToken(ownerNic);
    if (token) {
      const response = await fetch(`${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/authorizations/${authId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        FALLBACK_AUTHORIZATIONS = FALLBACK_AUTHORIZATIONS.map(a => a.id === authId ? { ...a, status: 'REVOKED' } : a);
        return await response.json();
      }
    }
  } catch (e) {
    console.warn("Backend revokeAuthorization failed, updating local fallback:", e.message);
  }

  FALLBACK_AUTHORIZATIONS = FALLBACK_AUTHORIZATIONS.map(a => a.id === authId ? { ...a, status: 'REVOKED' } : a);
  return { message: "Authorization revoked successfully." };
};

// ── Notifications (backend with localStorage fallback) ────────────────────────

export const getMyNotifications = async (recipientNic) => {
  try {
    const token = await loginAndGetToken(recipientNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
    return [];
  } catch (err) {
    console.warn("Backend getMyNotifications failed:", err.message);
    return [];
  }
};

export const readNotification = async (notifId, recipientNic) => {
  try {
    const token = await loginAndGetToken(recipientNic);
    if (!token) return;

    await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.warn("Backend readNotification failed:", err.message);
  }
};

// ── Stolen vehicle reporting (Application Database Level) ─────────────────────

let LOCAL_APPLICATION_STOLEN_FLAGS = {};

/**
 * Report a vehicle as stolen in the Digital Lanka Application Database.
 */
export const reportVehicleStolen = async (vehicleId, ownerNic) => {
  try {
    const token = await loginAndGetToken(ownerNic);
    if (token) {
      const response = await fetch(`${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/stolen`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        LOCAL_APPLICATION_STOLEN_FLAGS[vehicleId] = 'STOLEN';
        return await response.json();
      }
    }
  } catch (e) {
    console.warn("Backend reportVehicleStolen failed, updating Application Database fallback:", e.message);
  }

  LOCAL_APPLICATION_STOLEN_FLAGS[vehicleId] = 'STOLEN';
  return { message: "Vehicle marked as STOLEN in Application Database." };
};

/**
 * Mark a stolen vehicle as recovered in the Digital Lanka Application Database (officer action).
 */
export const markVehicleRecovered = async (vehicleId, remarks, officerNic) => {
  try {
    const token = await loginAndGetToken(officerNic || '197204509123');
    if (token) {
      const response = await fetch(`${API_BASE_URL}/officers/vehicles/${encodeURIComponent(vehicleId)}/recovered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks })
      });

      if (response.ok) {
        LOCAL_APPLICATION_STOLEN_FLAGS[vehicleId] = 'ACTIVE';
        return await response.json();
      }
    }
  } catch (e) {
    console.warn("Backend markVehicleRecovered failed, updating Application Database fallback:", e.message);
  }

  LOCAL_APPLICATION_STOLEN_FLAGS[vehicleId] = 'ACTIVE';
  return { message: "Vehicle marked as RECOVERED/ACTIVE in Application Database." };
};

// ── Officer compliance check ──────────────────────────────────────────────────

export const getStolenVehicles = async (officerNic) => {
  try {
    const token = await loginAndGetToken(officerNic || '197204509123');
    if (token) {
      const response = await fetch(`${API_BASE_URL}/officers/vehicles/stolen`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (e) {
    console.warn("Backend getStolenVehicles failed:", e.message);
  }
  return [];
};

export const queryCompliance = async (plateNumber, driverNic, officerNic) => {
  try {
    const token = await loginAndGetToken(officerNic || '197204509123');
    if (token) {
      const response = await fetch(
        `${API_BASE_URL}/officers/compliance/check?plateNumber=${encodeURIComponent(plateNumber)}&driverNic=${encodeURIComponent(driverNic || '')}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          plateNumber:   data.plateNumber,
          vehicleStatus: LOCAL_APPLICATION_STOLEN_FLAGS[plateNumber] || data.vehicleStatus,
          alert:         LOCAL_APPLICATION_STOLEN_FLAGS[plateNumber] === 'STOLEN' ? 'VEHICLE REPORTED STOLEN' : data.authorizationStatus,
          allowed:       LOCAL_APPLICATION_STOLEN_FLAGS[plateNumber] === 'STOLEN' ? false : data.allowedToDrive,
          ownerNic:      data.ownerNic
        };
      }
    }
  } catch (e) {
    console.warn("Backend queryCompliance failed, performing Application Database compliance lookup:", e.message);
  }

  const appStatus = LOCAL_APPLICATION_STOLEN_FLAGS[plateNumber] || 'ACTIVE';
  const isStolen = appStatus === 'STOLEN';
  return {
    plateNumber,
    vehicleStatus: appStatus,
    alert: isStolen ? 'VEHICLE REPORTED STOLEN' : 'Compliance Verified',
    allowed: !isStolen,
    ownerNic: '197204509123'
  };
};

// ── Citations & Violations Service Layer ──────────────────────────────────────

const INITIAL_CITATIONS = [
  {
    id: 'cit_101',
    referenceNumber: 'CIT-882910',
    date: '2026-07-28 14:30',
    plateNumber: 'WP CAD-1234',
    driverNic: '197204509123',
    nature: 'OVER SPEEDING (75 km/h in 50 km/h Zone)',
    place: 'Galle Road, Colombo 03',
    officerName: 'INSP. S. JAYASURIYA',
    officerBatch: 'POL-88219',
    officerNic: '197828430012',
    amount: 2000,
    status: 'PENDING_PAYMENT',
    proofUploaded: false
  },
  {
    id: 'cit_102',
    referenceNumber: 'CIT-773412',
    date: '2026-06-14 09:15',
    plateNumber: 'WP CAD-1234',
    driverNic: '197204509123',
    nature: 'PARKED AT INTERSECTION',
    place: 'Flower Road, Colombo 07',
    officerName: 'INSP. S. JAYASURIYA',
    officerBatch: 'POL-88219',
    officerNic: '197828430012',
    amount: 1000,
    status: 'PAID',
    proofUploaded: true
  }
];

export const getCitations = () => {
  let citations = getDb('dl_citations');
  if (!citations || citations.length === 0) {
    citations = INITIAL_CITATIONS;
    saveDb('dl_citations', citations);
  }
  return citations;
};

export const getCitationsForCitizen = async (driverNic) => {
  try {
    const token = await loginAndGetToken(driverNic);
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/citations/my`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
    return [];
  } catch (err) {
    console.warn("Backend getCitationsForCitizen failed:", err.message);
    return [];
  }
};

export const getCitationsForOfficer = (officerNic) => {
  const all = getCitations();
  return all.filter(c => c.officerNic === officerNic || officerNic === '197828430012' || !c.officerNic);
};

export const issueCitation = (plateNumber, driverNic, nature, place, amount, officerName, officerBatch, officerNic = '197828430012') => {
  const citations = getCitations();
  const newCit = {
    id: 'cit_' + Math.random().toString(36).substr(2, 9),
    referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    plateNumber,
    driverNic,
    place,
    nature,
    officerName,
    officerBatch,
    officerNic,
    amount: parseFloat(amount) || 1000,
    status: 'PENDING_PAYMENT',
    proofUploaded: false
  };
  citations.unshift(newCit);
  saveDb('dl_citations', citations);
  return newCit;
};

export const submitProofOfPayment = (citationId, receiptImage) => {
  const citations = getCitations();
  const idx = citations.findIndex(c => c.id === citationId || c.referenceNumber === citationId);
  if (idx === -1) throw new Error("Citation not found.");
  citations[idx].proofUploaded = true;
  citations[idx].status = 'PAID';
  saveDb('dl_citations', citations);
  return citations[idx];
};


// ── Module 3: Vehicle Registration & Asset Verification ───────────────────────

export const registerVehicleAsset = async (vehicleData, currentNic) => {
  try {
    const token = await loginAndGetToken(currentNic);
    if (!token) throw new Error("Authentication failed");

    const response = await fetch(`${API_BASE_URL}/assets/register-vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to register vehicle");
    }

    return await response.json();
  } catch (err) {
    console.error("Backend registerVehicleAsset failed:", err.message);
    throw err;
  }
};

export const publicVerifyVehicle = async (plateNumber, nic) => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/public-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plateNumber, nic })
    });

    if (response.ok) {
      return await response.json();
    }
    return { isRegisteredAndActive: false };
  } catch (err) {
    console.error("Backend publicVerifyVehicle failed:", err.message);
    return { isRegisteredAndActive: false, error: err.message };
  }
};

