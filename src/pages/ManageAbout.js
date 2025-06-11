// src/pages/ManageAbout.js
import React, { useState, useEffect } from 'react';

function ManageAbout() {
  const [about, setAbout] = useState({ Title: '', Text: '' });
  const [imageFile, setImageFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch current About content on component mount
  useEffect(() => {
    fetch('http://localhost/virtujam/public/api/about_api.php', { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        // Update state only if data is returned
        if (data && data.Title) {
          setAbout(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching about content:', error);
      });
  }, []);

  // Handle changes in Title and Text fields
  const handleChange = (e) => {
    setAbout({ ...about, [e.target.name]: e.target.value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Submit the form using FormData to support file uploads
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Title', about.Title);
    formData.append('Text', about.Text);
    // If an image file is selected, append it
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost/virtujam/public/api/about_api.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg('About content updated successfully.');
      } else {
        setStatusMsg(data.message || 'Failed to update about content.');
      }
    } catch (error) {
      console.error('Error updating about content:', error);
      setStatusMsg('An error occurred while updating content.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Manage About Content</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        <input
          type="text"
          name="Title"
          placeholder="Title"
          className="border p-2 rounded"
          value={about.Title || ''}
          onChange={handleChange}
        />
        <textarea
          name="Text"
          placeholder="Text"
          className="border p-2 rounded min-h-[200px]"
          value={about.Text || ''}
          onChange={handleChange}
        ></textarea>
        <label className="flex flex-col">
          Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
        </label>
        <button type="submit" className="bg-primary text-white py-2 rounded">
          Save Changes
        </button>
      </form>
      {statusMsg && <p className="mt-4 text-center">{statusMsg}</p>}
    </div>
  );
}

export default ManageAbout;
