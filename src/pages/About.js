// src/pages/About.js
import React, { useEffect, useState } from 'react';

function About() {
  // Set initial state for about page content and loading flag.
  const [about, setAbout] = useState({ Title: '', Text: '', ImageURL: '' });
  const [loading, setLoading] = useState(true);

  // Fetch the about content when the component mounts.
  useEffect(() => {
    fetch('http://localhost/virtujam/public/api/about_api.php', { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        // Update state with data from the API.
        setAbout(data);
        console.log(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching about content:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto p-8 mb-6 mt-6">
        <p className="text-2xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8 mb-6 mt-6">
      <h1 className="text-7xl mb-8">About</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        {/* Left Side: Text Content */}
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold mb-4">{about.Title || 'ABOUT'}</h2>
          <p className="text-gray-700 mb-4 text-2xl">
            {about.Text ||
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>
        </div>
        {/* Right Side: Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={about.ImageURL ? `http://localhost/virtujam/${about.ImageURL}` : ''}
            alt="Blue electric guitar"
            className="w-full max-w-lg rounded"
          />
        </div>
      </div>
    </main>
  );
}

export default About;
