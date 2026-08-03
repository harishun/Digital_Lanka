import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import { Camera, Search, AlertTriangle, ShieldCheck, Clock, MapPin, CheckCircle, User, Car, Bike, Truck, Bus, FileText, Shield, X, Info, LogOut } from 'lucide-react';
import CitizenProfileCard from './components/CitizenProfileCard';
import NicCard from './components/NicCard/NicCard';

function Dashboard({ setToken, onSwitchToCitizen }) {
  const [plateNo, setPlateNo] = useState('');
  const [dlNo, setDlNo] = useState('');
  const [plateImage, setPlateImage] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const [citationMsg, setCitationMsg] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsFetched, setGpsFetched] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [violationSearch, setViolationSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [citationDetails, setCitationDetails] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // Get GPS once logged in
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGps(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setGpsFetched(true);
      }, (error) => {
        console.warn("GPS failed", error);
        setGps("6.9271, 79.8612 (Colombo)");
        setGpsFetched(true);
      }, { timeout: 5000 });
    } else {
      setGps("6.9271, 79.8612 (Colombo)");
      setGpsFetched(true);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setCitationMsg('');
    try {
      // Initiate 5-minute session
      const formData = new FormData();
      formData.append('plateNo', plateNo);
      formData.append('dlNo', dlNo);
      if (plateImage) formData.append('plateImage', plateImage);

      const res = await api.post('/enforcement/search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const sessionToken = res.data.token;
      localStorage.setItem('sessionToken', sessionToken);
      
      // Fetch details using the new session token
      const detailsRes = await api.get('/enforcement/details');
      setData(detailsRes.data);
      
      // Start 5 min timer (300 seconds)
      setSessionActive(true);
      setTimeLeft(300);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearPrivacyData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data || 'Search failed');
    }
  };

  const clearPrivacyData = () => {
    setSessionActive(false);
    setData(null);
    localStorage.removeItem('sessionToken');
    setCitationMsg('Session expired. Data cleared for privacy.');
  };

  const handleCitation = async () => {
    if (violations.length === 0) {
      window.alert('Please select at least one violation.');
      return;
    }
    const violationString = violations.join(', ');
    try {
      const res = await api.post('/enforcement/citation', {
        violationType: violationString,
        gpsCoordinates: gps
      });
      setCitationDetails({
        msg: res.data,
        gps,
        violationType: violationString,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      });
      setShowCitationModal(true);
    } catch (err) {
      setCitationMsg(err.response?.data || 'Citation failed');
    }
  };

  const handleExitSession = () => {
    setSessionActive(false);
    setData(null);
    setTimeLeft(300);
    setViolations([]);
    setViolationSearch('');
    localStorage.removeItem('sessionToken');
    setCitationMsg('✓ Compliance check cleared — returned to officer dashboard without issuing citation.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('sessionToken');
    setToken(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const parseNIC = (nicStr) => {
    if (!nicStr) return { dob: 'Unknown', gender: 'Unknown' };
    let year, dayList, gender;
    if (nicStr.length === 10) {
      year = '19' + nicStr.substring(0, 2);
      dayList = parseInt(nicStr.substring(2, 5), 10);
    } else if (nicStr.length === 12) {
      year = nicStr.substring(0, 4);
      dayList = parseInt(nicStr.substring(4, 7), 10);
    } else {
      return { dob: 'Unknown', gender: 'Unknown' };
    }
    
    if (dayList > 500) {
      gender = 'Female';
      dayList = dayList - 500;
    } else {
      gender = 'Male';
    }
    
    let d = new Date(year, 0); 
    d.setDate(dayList);
    let dob = d.toISOString().split('T')[0];
    return { dob, gender };
  };

  const getVehicleIcon = (category) => {
    const cat = category.trim().toUpperCase();
    if (['A1', 'A'].includes(cat)) return <Bike size={14} />;
    if (['B1', 'B'].includes(cat)) return <Car size={14} />;
    if (['C1', 'C', 'CE'].includes(cat)) return <Truck size={14} />;
    if (['D1', 'D', 'DE'].includes(cat)) return <Bus size={14} />;
    return <Car size={14} />;
  };

  // Mock data for missing fields
  const mockAddress = "123, Galle Road, Colombo 03";
  const mockPlaceOfBirth = "Colombo";
  const mockIssueDate = "2015-05-10";

  const availableViolations = [
    { id: 1, label: 'RECKLESS/DANGEROUS DRIVING TWO WHEELER', fine: '1000' },
    { id: 2, label: 'OVER SPEEDING', fine: '2000' },
    { id: 3, label: 'REF.GO FOR HIRE', fine: '500' },
    { id: 4, label: 'DEM.EXCESSFARE', fine: '500' },
    { id: 5, label: 'DEF.SILENCER', fine: '500' },
    { id: 6, label: 'SHRILL HORN', fine: '500' },
    { id: 7, label: 'WRONG PARKING', fine: '1000' },
    { id: 8, label: 'WITHOUT D.L TWO WHEELERS', fine: '1000' },
    { id: 9, label: 'JUMPING TR.SIGNAL', fine: '500' },
    { id: 10, label: 'CUTT.YELLOW LINE', fine: '500' },
    { id: 11, label: 'LANE DISCIPLINE', fine: '500' },
    { id: 12, label: 'OVERTAKING FROM LEFT', fine: '500' },
    { id: 13, label: 'DEF.REG.NO PLATE', fine: '500' },
    { id: 14, label: 'WITHOUT UNIFORM', fine: '500' },
    { id: 15, label: 'WITHOUT INSURANCE', fine: '2000' },
    { id: 16, label: 'USING HIGH BEAM LIGHT', fine: '500' },
    { id: 17, label: 'DEF.HEADLIGHT', fine: '500' },
    { id: 18, label: 'DEF.TAILLIGHT', fine: '500' },
    { id: 19, label: 'BALDTYRES', fine: '500' },
    { id: 20, label: 'FOOT BOARD TRAVEL', fine: '500' },
    { id: 21, label: 'USING MOBILE PHONE', fine: '1000' },
    { id: 22, label: 'NOT WEARING SEAT BELT', fine: '500' },
    { id: 23, label: 'CARRYING LENGTH MATERIAL', fine: '500' },
    { id: 24, label: 'CARR.EXCESS SCHOOL CHILDREN', fine: '200' },
    { id: 25, label: 'TRIPPLE RIDING', fine: '500' },
    { id: 26, label: 'NO ENTRY', fine: '500' },
    { id: 27, label: 'ZIG ZAG DRIVING', fine: '500' },
    { id: 28, label: 'PARKED AT INTERSECTION', fine: '1000' },
    { id: 29, label: 'RIDING ON FOOTPATH', fine: '500' },
    { id: 30, label: 'RIDING WITHOUT HELMET', fine: '500' },
    { id: 31, label: 'HTV PROHIBITED', fine: '500' },
    { id: 32, label: 'NOT PRODUCE DOCUMENTS', fine: '500' },
    { id: 33, label: 'WITHOUT NUMBER PLATE', fine: '500' },
    { id: 34, label: 'CARRYING PASSENGER ON THE TOP', fine: '500' },
    { id: 35, label: 'CARRYING EXTRA PASSENGER', fine: '500' },
    { id: 36, label: 'CARRYING EXTRA PASSENGER - BUS/TRANSPORT', fine: '200' },
    { id: 37, label: 'DRIVING WHEN MENTALLY/PHYSICALLY UNFIT TO DRIVE', fine: '1000' },
    { id: 38, label: 'CARRYING MORE THAN 5 PERSONS IN HTV', fine: '200' },
    { id: 39, label: 'CARRYING MORE THAN 2 PERSONS IN LMV', fine: '200' },
    { id: 40, label: 'MISBEHAVIOUR WITH POLICE OFFICER', fine: '2000' },
    { id: 41, label: 'RECKLESS/DANGEROUS DRIVING - TRANSPORT', fine: '1000' },
    { id: 42, label: 'MINOR DRIVING', fine: '5000' },
    { id: 43, label: 'DRIVING DURING DISQUALIFICATION', fine: '10000' },
    { id: 44, label: 'RACING AND TRIALS OF SPEED', fine: '5000' },
    { id: 45, label: 'DISOBEDIENCE/ OBSTRUCTION/ REFUSAL/ FALSE INFORMATION', fine: '1000' },
    { id: 46, label: 'RECKLESS/DANGEROUS DRIVING - NON TRANSPORT', fine: '1000' },
    { id: 47, label: 'RECKLESS/DANGEROUS DRIVING AUTO', fine: '1000' },
    { id: 48, label: 'AIR/NOISE POLLUTION - 2/3 WHEELER', fine: '1000' },
    { id: 49, label: 'AIR/NOISE POLLUTION - 4 WHEELER', fine: '1000' },
    { id: 50, label: 'AIR/NOISE POLLUTION - HTV/CARRIAGE', fine: '1000' },
    { id: 51, label: 'OBSTRUCTING TRAFFIC', fine: '500' },
    { id: 52, label: 'REFUSE TO STOP AT POLICE SIGNAL', fine: '500' },
    { id: 53, label: 'CHASE AND CAUGHT', fine: '500' },
    { id: 54, label: 'U TURN PROHIBITED', fine: '500' },
    { id: 55, label: 'FREE WHEELING', fine: '5000' },
    { id: 56, label: 'OWNER TO BE PROSECUTED', fine: '5000' },
    { id: 57, label: 'PARKING NEAR TRAFFIC LIGHT OR ZEBRA CROSS', fine: '1000' },
    { id: 58, label: 'PARKING OPP.TO ANOTHER PARKED VECHICLE', fine: '1000' },
    { id: 59, label: 'DOUBLE PARKING', fine: '1000' },
    { id: 60, label: 'STOPING ON WHITE/STOP LINE', fine: '1000' },
    { id: 61, label: 'PARKING NEAR BUS STOP/SCHOOL/HOSPITAL ETC', fine: '1000' },
    { id: 62, label: 'PARKING ON FOOTPATH', fine: '1000' },
    { id: 63, label: 'PARKING NEAR ROAD CROSSING OR BENDTOP OF HILL ETC', fine: '1000' },
    { id: 64, label: 'CARRYING EXTRA PASSENGER IN AUTO', fine: '200' },
    { id: 65, label: 'NO PARKING', fine: '1000' },
    { id: 66, label: 'CROSSING MEDIAN LINE & GOING AGAINST FLOW OF TRAFFIC', fine: '500' },
    { id: 67, label: 'AGAINST ONE WAY', fine: '500' },
    { id: 68, label: 'USE OF BLACK FILM/OTHER MATERIALS', fine: '500' },
    { id: 69, label: 'BUSES STOPS OTHER THAN BUS-STOP', fine: '500' },
    { id: 70, label: 'NOT WEARING HELMET-PILLION RIDER', fine: '500' },
    { id: 71, label: 'WITHOUT INSURANCE TWO WHEELERS', fine: '1000' },
    { id: 72, label: 'WITHOUT INSURANCE LMV', fine: '2000' },
    { id: 73, label: 'WITHOUT INSURANCE LGV & OTHERS', fine: '4000' },
    { id: 74, label: 'USE OF HORN AT PROHIBITED PLACES 2W / 3 WHEELERS', fine: '500' },
    { id: 75, label: 'USE OF HORN AT PROHIBITED PLACES FOUR WHEELERS AND OTHERS', fine: '1000' },
    { id: 76, label: 'OVER SPEEDING 2W / 3 WHEELER & LMV', fine: '1000' },
    { id: 77, label: 'OVER SPEEDING LGV/HGV & OTHERS', fine: '2000' },
    { id: 78, label: 'OWNER TO BE PROSECUTED 2W / 3 WHEELERS', fine: '1000' },
    { id: 79, label: 'OWNER TO BE PROSECUTED LMV', fine: '2000' },
    { id: 80, label: 'OWNER TO BE PROSECUTED HGV / OTHERS', fine: '5000' },
    { id: 81, label: 'WITHOUT D.L THREE WHEELERS', fine: '1000' },
    { id: 82, label: 'WITHOUT D.L LMV', fine: '2000' },
    { id: 83, label: 'WITHOUT D.L OTHERS', fine: '5000' },
    { id: 84, label: 'WITHOUT INSURANCE THREE WHEELERS', fine: '1000' },
    { id: 85, label: 'RIGHT TURN PROHIBITED', fine: '500' },
    { id: 86, label: 'DRUNK AND DRIVE', fine: 'Court Fine' },
    { id: 87, label: 'AUTO/CAB/TAXI DISPLAYCARD', fine: 'Court Fine' },
    { id: 88, label: 'JAY WALKING', fine: 'Court Fine' },
    { id: 89, label: 'WITH OUT PERMIT/VIOLATION OF PERMIT', fine: 'Court Fine' },
    { id: 90, label: 'WITHOUT EMMISSION CERTIFICATE', fine: 'Court Fine' },
    { id: 91, label: 'VEHICLE WITHOUT REGISTRATION', fine: 'Court Fine' },
    { id: 92, label: 'ALTERATION OF VEHICLE', fine: 'Court Fine' },
    { id: 93, label: 'WITHOUT CERTIFICATE OF FITNESS', fine: 'Court Fine' }
  ];

  const handleAddViolation = (id) => {
    if (id && !violations.includes(id)) {
      setViolations([...violations, id]);
    }
  };

  const handleRemoveViolation = (id) => {
    setViolations(violations.filter(v => v !== id));
  };

  return (
    <div className="min-h-screen bg-lightBg font-sans text-gray-800">
      {/* Header */}
      <header className="bg-darkBlue text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck size={28} className="text-blue-300" />
          <h1 className="text-xl font-bold tracking-wider">DIGITAL LANKA - ENFORCEMENT</h1>
        </div>
        <div className="flex items-center gap-3">
          {onSwitchToCitizen && (
            <button
              onClick={onSwitchToCitizen}
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 transform active:scale-95 border border-blue-400"
            >
              <span>👤 My Citizen Portal</span>
            </button>
          )}
          <button onClick={handleLogout} className="text-sm bg-blue-800 px-4 py-2 rounded hover:bg-blue-700 transition">
            End Shift
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 p-4">
        {/* Search Panel */}
        {!sessionActive && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-darkBlue animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-darkBlue">
              <Search size={24} /> Compliance Check & Citation
            </h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Plate Number</label>
                <input 
                  type="text" 
                  required
                  value={plateNo}
                  onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
                  placeholder="e.g. CBA-1234"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-darkBlue focus:border-darkBlue transition uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Driver NIC / DL Number</label>
                <input 
                  type="text" 
                  required
                  value={dlNo}
                  onChange={(e) => setDlNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 197204509123 or DL-123"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-darkBlue focus:border-darkBlue transition uppercase"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle Photo / Plate Capture (Evidence)</label>
                <div className="w-full p-2 border border-dashed border-gray-400 rounded-lg text-gray-500 hover:bg-gray-50 flex justify-center items-center transition">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setPlateImage(e.target.files[0])}
                    className="w-full text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <button type="submit" className="w-full bg-darkBlue text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                  <Search size={20} /> Execute Search
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-3 rounded">{error}</p>}
            {citationMsg && !sessionActive && (
              <div className={`mt-4 p-4 rounded-xl border font-bold text-center flex items-center justify-center gap-2 shadow-sm ${citationMsg.toLowerCase().includes('seizure') ? 'bg-red-50 border-red-300 text-red-800' : 'bg-green-50 border-green-300 text-green-800'}`}>
                <AlertTriangle className={citationMsg.toLowerCase().includes('seizure') ? 'text-red-600' : 'text-green-600'} size={20} />
                <span>{citationMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* FLOATING TOAST NOTIFICATION FOR SEIZURES & CITATIONS */}
        {citationMsg && (
          <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl border-l-4 border-red-500 flex items-center gap-3 animate-slide-in max-w-md">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                {citationMsg.toLowerCase().includes('seizure') ? '🚨 Vehicle Seizure Toast' : '✓ Enforcement Action'}
              </span>
              <span className="text-sm font-semibold mt-0.5">{citationMsg}</span>
            </div>
            <button onClick={() => setCitationMsg('')} className="text-gray-400 hover:text-white ml-2 shrink-0">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Time-Locked View */}
        {sessionActive && data && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center bg-red-600 text-white p-4 rounded-t-xl shadow-lg">
              <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
                <AlertTriangle className="animate-pulse" />
                PRIVACY LOCK ACTIVE
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-2xl font-mono font-bold bg-black/20 px-4 py-1 rounded">
                  <Clock size={24} />
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={handleExitSession}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition uppercase tracking-wide border border-white/30 active:scale-95"
                  title="Exit compliance check and return to officer dashboard"
                >
                  <LogOut size={16} />
                  Exit
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-b-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 border-x border-b border-gray-200">
              
              {/* Data Display */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-darkBlue border-b pb-2">Driver License Preview</h3>
                
                <div className="grid grid-cols-1 gap-8">
                  {/* DRIVING LICENSE CARD (SMART CARD WITH REVERSO & METADATA TABLE) */}
                  <div className="w-full flex justify-center">
                    <div style={{ width: '540px', maxWidth: '100%' }}>
                      <div className="w-full mb-2 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          🪪 Sri Lanka Smart Driving License (DL)
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          Click card to flip • Back has Vehicle Classes
                        </span>
                      </div>
                      <CitizenProfileCard currentUser={{
                      nic: data.driverNic || '901234567V',
                      fullName: data.driverName || 'JOHN DOE',
                      dateOfBirth: parseNIC(data.driverNic).dob || '1990-01-01',
                      bloodGroup: data.bloodGroup || 'O+',
                      donor: true,
                      address: mockAddress || '123 Heritage Lane, Colombo',
                      placeOfBirth: mockPlaceOfBirth || 'Colombo General Hospital',
                      vehicleClasses: data.validOperators ? data.validOperators.split(',').map(c => ({
                        classCode: c.trim().toUpperCase(),
                        description: c.trim().toUpperCase() === 'A' || c.trim().toUpperCase() === 'A1' ? 'Motorcycle' : 'Passenger Vehicle',
                        issuedDate: mockIssueDate || '2021-05-10',
                        expiryDate: '2030-05-10'
                      })) : [
                        { classCode: 'B', description: 'Passenger Vehicle', issuedDate: '2021-05-10', expiryDate: '2030-05-10' },
                        { classCode: 'A', description: 'Motorcycle', issuedDate: '2021-05-10', expiryDate: '2030-05-10' }
                      ]
                    }} />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-darkBlue mt-6 border-b pb-2">Compliance Markers</h3>
                <div className="flex gap-4">
                  <div className={`flex-1 p-3 rounded-lg border-l-4 ${data.insuranceStatus === 'VALID' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Insurance</p>
                    <p className="font-black text-xl flex items-center gap-2">
                      {data.insuranceStatus === 'VALID' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                      {data.insuranceStatus}
                    </p>
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border-l-4 ${data.revenueStatus === 'VALID' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Revenue License</p>
                    <p className="font-black text-xl flex items-center gap-2">
                      {data.revenueStatus === 'VALID' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                      {data.revenueStatus}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <button onClick={() => setShowRevenueModal(true)} className="flex-1 bg-green-100 text-green-800 p-2 rounded-lg border border-green-300 font-bold hover:bg-green-200 transition text-sm flex items-center justify-center gap-2 shadow-sm">
                    <FileText size={16} /> View Revenue License
                  </button>
                  <button onClick={() => setShowInsuranceModal(true)} className="flex-1 bg-blue-100 text-blue-800 p-2 rounded-lg border border-blue-300 font-bold hover:bg-blue-200 transition text-sm flex items-center justify-center gap-2 shadow-sm">
                    <Shield size={16} /> View Insurance
                  </button>
                </div>
              </div>

              {/* Citation Processing */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-xl font-bold text-darkBlue mb-4">Issue Citation</h3>

                {/* STOLEN REPORTED VEHICLE / BIKE SEIZURE SECTION */}
                <div className="mb-6">
                  {data.status === 'STOLEN' ? (
                    <div className="bg-red-600 text-white p-5 rounded-xl shadow-lg border-2 border-red-700">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-yellow-300 shrink-0" size={32} />
                          <div>
                            <h4 className="text-lg font-black tracking-wide uppercase">🚨 REPORTED STOLEN / WANTED VEHICLE</h4>
                            <p className="text-sm text-red-100 font-medium mt-1">
                              This vehicle ({data.plateNo}) is listed as STOLEN in the national database. Immediate roadside seizure is required.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCitationMsg(`Seizure confirmed following the vehicle number ${data.plateNo}`);
                            setSessionActive(false);
                            setData(null);
                            setTimeLeft(300);
                          }}
                          className="bg-white text-red-700 hover:bg-red-50 font-black px-6 py-3 rounded-lg shadow-md transition transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 text-sm uppercase tracking-wider border border-red-200"
                        >
                          🚨 Bike Seizure
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-100 border border-green-300 text-green-800 p-3.5 rounded-lg flex items-center gap-2.5 font-bold text-sm shadow-sm">
                      <CheckCircle className="text-green-600 shrink-0" size={20} />
                      <span>✓ CLEAR — Not a Stolen Reported Vehicle ({data.plateNo})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="relative z-20">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Search Violations</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={violationSearch}
                        onChange={(e) => {
                          setViolationSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="Search for offence description..."
                        className="w-full p-3 pl-10 border border-blue-300 rounded-lg focus:ring-2 focus:ring-darkBlue bg-white font-medium mb-3"
                      />
                      <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>

                    {showDropdown && (
                      <div className="absolute z-30 w-full max-h-64 overflow-y-auto bg-white border border-blue-300 rounded shadow-2xl mt-[-8px] mb-3 left-0 right-0">
                        {availableViolations
                          .filter(v => v.label.toLowerCase().includes(violationSearch.toLowerCase()) || v.id.toString() === violationSearch)
                          .map(v => (
                            <div 
                              key={v.id} 
                              onClick={() => {
                                handleAddViolation(v.id);
                                setViolationSearch('');
                                setShowDropdown(false);
                              }}
                              className="p-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                            >
                              <span className="text-sm font-bold text-gray-800">{v.id}. {v.label}</span>
                              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                {v.fine === 'Court Fine' ? v.fine : `Rs ${v.fine}`}
                              </span>
                            </div>
                          ))}
                        {availableViolations.filter(v => v.label.toLowerCase().includes(violationSearch.toLowerCase()) || v.id.toString() === violationSearch).length === 0 && (
                           <div className="p-3 text-sm text-gray-500">No matching offenses found.</div>
                        )}
                      </div>
                    )}

                    {violations.length > 0 && (
                      <div className="flex flex-col gap-2 bg-white p-3 rounded border border-blue-200 shadow-inner">
                        <div className="flex justify-between items-center border-b pb-2 mb-1">
                          <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Selected Offences</span>
                          <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Fine Amount</span>
                        </div>
                        {violations.map(vId => {
                          const v = availableViolations.find(av => av.id === vId);
                          return (
                            <div key={vId} className="flex justify-between items-center bg-blue-50/50 p-2 rounded border border-blue-100 shadow-sm animate-fade-in">
                              <div className="flex items-start gap-2 max-w-[75%]">
                                <AlertTriangle size={14} className="text-red-500 mt-[2px] shrink-0" />
                                <div>
                                  <span className="text-[10px] font-bold text-gray-500 block leading-none mb-1">OFFENSE #{v?.id}</span>
                                  <span className="text-xs font-bold text-gray-800 leading-tight">{v?.label}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-red-700 text-sm">
                                  {v?.fine === 'Court Fine' ? 'Court Fine' : `Rs ${v?.fine}`}
                                </span>
                                <button 
                                  onClick={() => handleRemoveViolation(vId)}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition"
                                  title="Remove Violation"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-between items-center border-t border-gray-300 pt-3 mt-1 bg-red-50/50 p-2 rounded">
                          <span className="font-black text-gray-800 uppercase text-sm">Total Fine Amount:</span>
                          <span className="font-black text-red-700 text-lg">
                            {violations.some(vId => availableViolations.find(av => av.id === vId)?.fine === 'Court Fine') 
                              ? 'Court Fine Required'
                              : `Rs ${violations.reduce((sum, vId) => sum + parseInt(availableViolations.find(av => av.id === vId)?.fine || 0), 0).toLocaleString()}`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-darkBlue"/>
                      <span className="font-medium">GPS Lock:</span> {gps || 'Acquiring...'}
                    </div>
                    {gpsFetched && (
                      <div className="bg-green-100 text-green-800 p-2 rounded text-xs font-bold border border-green-200">
                        ✓ GPS Location fetched successfully
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={handleCitation}
                      className="w-full bg-red-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
                    >
                      <AlertTriangle size={20} />
                      SUBMIT CITATION & LOCK DATA
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2 font-medium">
                    This action is immutable and captures current exact timestamp.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Citation Modal */}
        {showCitationModal && citationDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up text-center border-t-8 border-green-500">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-800 mb-2">CITATION ISSUED</h2>
              <p className="text-gray-600 mb-6 font-medium text-lg">{citationDetails.msg}</p>
              
              <div className="bg-gray-50 p-4 rounded text-left mb-6 border text-sm">
                <p><span className="font-bold text-gray-500">Violation:</span> {citationDetails.violationType}</p>
                <p><span className="font-bold text-gray-500">GPS Lock:</span> {citationDetails.gps}</p>
                <p><span className="font-bold text-gray-500">Time Issued:</span> {citationDetails.timestamp}</p>
              </div>

              <button 
                onClick={() => {
                  setShowCitationModal(false);
                  clearPrivacyData();
                }}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition active:scale-95"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}
        {/* Revenue License Modal */}
        {showRevenueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative animate-slide-up max-w-md w-full bg-[#fcf9d9] rounded shadow-2xl overflow-hidden border border-gray-400" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(252,249,217,1) 70%)' }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Emblem_of_Sri_Lanka.svg/120px-Emblem_of_Sri_Lanka.svg.png" className="w-64" alt="Emblem" />
              </div>
              <button onClick={() => setShowRevenueModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 z-50 bg-white/50 rounded-full p-1"><X size={24}/></button>
              
              <div className="p-6 relative z-10 text-gray-800">
                <div className="text-center mb-4 border-b-2 border-gray-400/30 pb-2">
                  <h2 className="text-lg font-black uppercase tracking-tight leading-tight">Vehicle Revenue Licence<br/>වාහන ආදායම් බලපත්‍රය<br/>வாகன வருமானவரி பத்திரம்</h2>
                  <h1 className="text-2xl font-black mt-2 tracking-widest">MAY 2026</h1>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-xs font-bold font-mono">
                  <div className="col-span-2 text-sm">REV-2023-987</div>
                  <div className="col-span-2 text-sm bg-black/5 px-2 py-1 rounded">MTA 25 NORMAL LICENCE</div>
                  
                  <div>MOTOR</div>
                  <div>PETROL</div>

                  <div className="col-span-2 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase block font-sans">Vehicle Owner's Name & Address:</span>
                    <span className="uppercase">{data.driverName}<br/>{mockAddress}</span>
                  </div>

                  <div className="col-span-2 flex justify-between mt-2 border-y border-gray-400/30 py-2">
                    <span className="text-[10px] text-gray-500 uppercase font-sans">Amount (Rs) Fee + Arrears + Fine:</span>
                    <span>1,500.00</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-sans">Validity Period:</span>
                    <span className="text-green-800">2025-05-10 To 2026-05-09</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-sans">VET Number:</span>
                    <span>VET-9928374</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-sans">Unladen/Gross Weight:</span>
                    <span>1200 kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-sans">Number of Seats:</span>
                    <span>4</span>
                  </div>
                </div>
                <div className="mt-6 pt-2 border-t border-gray-800/20 flex justify-between items-end">
                   <div className="text-[9px] font-bold text-gray-600 text-center">
                     <p className="border-b border-gray-800/20 px-4 pb-1 mb-1 font-signature text-lg text-blue-900">Signed</p>
                     Signature / Designation & Date
                   </div>
                   <div className="w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center font-bold text-gray-500">CP</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Modal */}
        {showInsuranceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><Shield className="text-blue-600"/> Certificate of Insurance</h2>
                <button onClick={() => setShowInsuranceModal(false)} className="text-gray-500 hover:text-red-500"><X size={24}/></button>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-gray-50 p-4 rounded-lg border">
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Policy No</span><span className="font-bold text-lg">POL-554433</span></div>
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Vehicle No</span><span className="font-bold text-lg">{data.plateNo}</span></div>
                <div className="col-span-2"><span className="font-bold text-[10px] text-gray-500 uppercase block">Insured Name</span><span className="font-bold">{data.driverName}</span></div>
                <div className="col-span-2"><span className="font-bold text-[10px] text-gray-500 uppercase block">Address</span><span>{mockAddress}</span></div>
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Make & Model</span><span className="font-bold">Toyota Aqua 2018</span></div>
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Period of Cover</span><span className="font-bold text-blue-700">2025-05-10 to 2026-05-09</span></div>
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Engine No</span><span className="font-mono text-xs">1NZ-FE-998877</span></div>
                <div><span className="font-bold text-[10px] text-gray-500 uppercase block">Chassis No</span><span className="font-mono text-xs">NHP10-1234567</span></div>
              </div>
            </div>
          </div>
        )}

      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }

        .flip-card {
          background-color: transparent;
          width: 100%;
          height: 220px;
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
          border-radius: 12px;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 12px;
          padding: 1rem;
        }
        .flip-card-front {
          background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
          color: black;
          border: 1px solid #d1d5db;
        }
        .flip-card-back {
          background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
          color: #1f2937;
          transform: rotateY(180deg);
          border: 1px solid #d1d5db;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
