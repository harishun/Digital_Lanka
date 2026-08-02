import React, { useState } from 'react';
import api from './api';

function Login({ setToken }) {
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { nic, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setToken(token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-lightBg">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-darkBlue mb-6 text-center">Digital Lanka Login</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">NIC Number</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-darkBlue"
              value={nic} 
              onChange={(e) => setNic(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-darkBlue"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-darkBlue text-white p-2 rounded hover:bg-blue-900 transition-colors"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
