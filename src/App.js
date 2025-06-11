// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Video from './pages/Video';
import Category from './pages/Category';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/video" element={<Video />} />
          <Route path="/category" element={<Category />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}


export default App;
