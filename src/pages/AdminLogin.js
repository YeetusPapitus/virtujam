// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/virtujam/public/api/admin_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        // Store the token, then navigate to the admin page.
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An error occurred while logging in.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
      {errorMsg && <p className="mb-4 text-red-500">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="border p-2 rounded"
          required
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 rounded"
          required
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-primary text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
