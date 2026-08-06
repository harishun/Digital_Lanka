import React, { useState, useEffect } from 'react';
import api from './api';
import { Shield, FileCheck, CheckCircle } from 'lucide-react';

function AdminPortal() {
  const [citations, setCitations] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCitations();
  }, []);

  const fetchCitations = async () => {
    try {
      const res = await api.get('/citations/verifying');
      setCitations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async (id) => {
    try {
      const res = await api.post(`/citations/${id}/clear`);
      setMsg(res.data);
      fetchCitations();
    } catch (err) {
      setMsg(err.response?.data || 'Failed to clear');
    }
  };


  return (
    <div className="min-h-screen bg-lightBg font-sans text-gray-800">
      <header className="bg-red-800 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield size={28} className="text-red-300" />
          <h1 className="text-xl font-bold tracking-wider">ADMIN PORTAL</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 p-4">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-red-800">
          <FileCheck size={24} /> Verify Payments
        </h2>
        {msg && <p className="text-green-600 mb-4 font-medium bg-green-50 p-3 rounded">{msg}</p>}

        <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 border-b">Ref Number</th>
                <th className="p-4 border-b">Offender NIC</th>
                <th className="p-4 border-b">Violation</th>
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {citations.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b font-medium">{c.referenceNumber}</td>
                  <td className="p-4 border-b">{c.offender.nic}</td>
                  <td className="p-4 border-b">{c.violationType}</td>
                  <td className="p-4 border-b">{new Date(c.timestamp).toLocaleString()}</td>
                  <td className="p-4 border-b">
                    <button 
                      onClick={() => handleClear(c.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Mark Cleared
                    </button>
                  </td>
                </tr>
              ))}
              {citations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">No citations pending verification.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminPortal;
