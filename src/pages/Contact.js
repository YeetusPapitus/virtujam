// src/pages/Contact.js
import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    message: ''
  });
  const [responseMessage, setResponseMessage] = useState('');

  // Update state when form fields change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Update the URL to match your PHP endpoint location.
    // For example, if your PHP file is hosted at http://localhost/api/contact_api.php
    // change the URL below accordingly.
    try {
      const response = await fetch('http://localhost/virtujam/public/api/contact_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Convert our form data to JSON
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(data.message);
        // Optionally clear form fields:
        setFormData({ firstname: '', lastname: '', email: '', message: '' });
      } else {
        setResponseMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An error occurred while submitting the form.');
    }
  };

  return (
    <main>
      <section className="py-12">
        <div className="container mx-auto flex flex-col px-4">
          <div className="flex flex-col w-full items-center">
            <h1 className="text-6xl mb-8">CONTACT</h1>
            <p className="text-xl text-gray-500 mb-4">
              Leave us a message if you have any questions, and we'll respond in no time! :)
            </p>
          </div>
          {/* Bind the handleSubmit function to the form's onSubmit event */}
          <form
            className="container px-56 flex flex-col items-start mt-12 gap-8"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="border-2 rounded-md border-primary p-1 shadow-md w-1/4 text-lg"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
            />
            <input
              type="text"
              className="border-2 rounded-md border-primary p-1 shadow-md w-1/4 text-lg"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
            />
            <input
              type="email"
              className="border-2 rounded-md border-primary p-1 shadow-md w-1/4 text-lg"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            <textarea
              className="border-2 rounded-md border-primary p-2 shadow-md w-full text-lg"
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              style={{ height: '200px' }}
            />
            <button
              type="submit"
              className="border-2 rounded-md border-primary px-2 py-1 text-lg shadow-md ms-auto hover:bg-primary transition"
            >
              Submit
            </button>
          </form>

          {responseMessage && (
            <div className="mt-4 text-center text-green-500">
              {responseMessage}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Contact;
