// src/pages/AdminPage.js
import React from 'react';
import ManageAbout from './ManageAbout';
import ManageCourses from './ManageCourses';
import ManageVideos from './ManageVideos';

function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">Welcome to the Admin Panel</h1>
      <ManageAbout />
      <ManageCourses />
      <ManageVideos />
    </div>
  );
}

export default AdminPage;
