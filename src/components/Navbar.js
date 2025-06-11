// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/virtujam_logo.png';


function Navbar() {
  return (
    <header className="bg-primary text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-4xl font-bold">
          <Link to="/" className='hover:text-gray-300 transition'>
            <img src={logo} alt="VirtuJam logo" className="h-full hover:opacity-75 transition-all"/>
          </Link>
        </div>
        <div className="text-2xl font-bold space-x-6">
          <Link to="/" className='hover:text-gray-300 transition'>COURSES</Link>
          <Link to="/about" className='hover:text-gray-300 transition'>ABOUT</Link>
          <Link to="/contact" className='hover:text-gray-300 transition'>CONTACT</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
