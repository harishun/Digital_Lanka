import React, { useState, useEffect } from 'react';
import api from './api';
import { User, FileText, Upload, CheckCircle, Clock } from 'lucide-react';

function CitizenPortal({ setToken, isOfficer, onSwitchToOfficer }) {
  const [citations, setCitations] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedCitationId, setSelectedCitationId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCitations();
  }, []);

  const fetchCitations = async () => {
    try {
      const res = await api.get('/citations/my');
      setCitations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile || !selectedCitationId) return;

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const res = await api.post(`/citations/${selectedCitationId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(res.data);
      setSelectedCitationId(null);
      setReceiptFile(null);
      fetchCitations();
    } catch (err) {
      setMsg(err.response?.data || 'Upload failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-lightBg font-sans text-gray-800">
      <header className="bg-darkBlue text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User size={28} className="text-blue-300" />
          <h1 className="text-xl font-bold tracking-wider">CITIZEN PORTAL</h1>
        </div>
        <div className="flex items-center gap-3">
          {isOfficer && (
            <button
              onClick={onSwitchToOfficer}
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 transform active:scale-95"
            >
              <span>👮‍♂️ Officer Dashboard (Penalty Citation)</span>
            </button>
          )}
          <button onClick={handleLogout} className="text-sm bg-blue-800 px-4 py-2 rounded hover:bg-blue-700 transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 p-4">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-darkBlue">
          <FileText size={24} /> My Citations
        </h2>
        {msg && <p className="text-green-600 mb-4 font-medium bg-green-50 p-3 rounded">{msg}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {citations.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-darkBlue">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-700">Ref: {c.referenceNumber}</span>
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  c.status === 'PENDING_PAYMENT' ? 'bg-red-100 text-red-700' :
                  c.status === 'VERIFYING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2"><strong>Violation:</strong> {c.violationType}</p>
              <p className="text-sm text-gray-600 mb-4"><strong>Date:</strong> {new Date(c.timestamp).toLocaleString()}</p>
              
              {c.status === 'PENDING_PAYMENT' && (
                <form onSubmit={handleUpload} className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Upload Payment Receipt</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        setReceiptFile(e.target.files[0]);
                        setSelectedCitationId(c.id);
                      }}
                      className="text-sm border p-1 rounded flex-1"
                      required
                    />
                    <button type="submit" className="bg-darkBlue text-white px-4 py-2 rounded hover:bg-blue-900 transition flex items-center gap-1">
                      <Upload size={16} /> Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
          {citations.length === 0 && <p className="text-gray-500">You have no citations.</p>}
        </div>
      </main>
    </div>
  );
}

export default CitizenPortal;
