// src/pages/ManageCourses.js
import React, { useEffect, useState } from 'react';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ Title: '' });
  const [newImageFile, setNewImageFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  
  // For edit mode, track the course id, its data, and any new image file chosen.
  const [editingId, setEditingId] = useState(null);
  const [editingCourse, setEditingCourse] = useState({ Title: '' });
  const [editingImageFile, setEditingImageFile] = useState(null);

  const apiUrl = 'http://localhost/virtujam/public/api/course_api.php';

  // Fetch the list of courses.
  const fetchCourses = () => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ------ For Adding a New Course ------
  const handleNewChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleNewFileChange = (e) => {
    setNewImageFile(e.target.files[0]);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Title', newCourse.Title);
    if (newImageFile) {
      formData.append('image', newImageFile);
    }
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg('Course added successfully.');
        setNewCourse({ Title: '' });
        setNewImageFile(null);
        fetchCourses();
      } else {
        setStatusMsg(data.message || 'Failed to add course.');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setStatusMsg('Error adding course.');
    }
  };

  // ------ For Deleting a Course ------
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg('Course deleted successfully.');
        fetchCourses();
      } else {
        setStatusMsg(data.message || 'Failed to delete course.');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setStatusMsg('Error deleting course.');
    }
  };

  // ------ For Editing a Course ------
  const handleEdit = (course) => {
    setEditingId(course.IDCourse);
    setEditingCourse({ Title: course.Title, ImageID: course.ImageID });
    setEditingImageFile(null); // Reset any previously chosen file.
  };

  const handleEditChange = (e) => {
    setEditingCourse({ ...editingCourse, [e.target.name]: e.target.value });
  };

  const handleEditingFileChange = (e) => {
    setEditingImageFile(e.target.files[0]);
  };

const handleUpdateCourse = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('_method', 'PUT'); // method override for PHP
  formData.append('Title', editingCourse.Title);
  // Include the existing ImageID as a hidden field, in case no new image is provided.
  formData.append('ImageID', editingCourse.ImageID || '');
  if (editingImageFile) {
    formData.append('image', editingImageFile);
  }
  try {
    const response = await fetch(`${apiUrl}?id=${editingId}`, {
      method: 'POST', // Use POST with the method override
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      setStatusMsg('Course updated successfully.');
      setEditingId(null);
      setEditingCourse({ Title: '', ImageID: '' });
      setEditingImageFile(null);
      fetchCourses();
    } else {
      setStatusMsg(data.message || 'Failed to update course.');
    }
  } catch (error) {
    console.error('Error updating course:', error);
    setStatusMsg('Error updating course.');
  }
};


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Manage Courses</h1>

      {/* Status message */}
      {statusMsg && <p className="mb-4">{statusMsg}</p>}

      {/* New course form */}
      <form onSubmit={handleAddCourse} className="flex flex-col gap-4 mb-8" encType="multipart/form-data">
        <input
          type="text"
          name="Title"
          placeholder="Course Title"
          className="border p-2 rounded"
          value={newCourse.Title || ''}
          onChange={handleNewChange}
          required
        />
        <label className="flex flex-col">
          Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleNewFileChange}
            className="border p-2 rounded"
          />
        </label>
        <button type="submit" className="bg-primary text-white py-2 rounded">
          Add Course
        </button>
      </form>

      {/* Courses list */}
      <div>
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Image</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.IDCourse}>
                  <td className="border p-2">{course.IDCourse}</td>
                  <td className="border p-2">
                    {editingId === course.IDCourse ? (
                      <input
                        type="text"
                        name="Title"
                        value={editingCourse.Title}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    ) : (
                      course.Title
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === course.IDCourse ? (
                      <>
                        {/* Show current image (if exists) */}
                        {course.ImageURL && (
                          <img
                            src={`http://localhost/virtujam${course.ImageURL}`}
                            alt="Course"
                            className="w-16 h-16 object-cover mb-2"
                          />
                        )}
                        <label className="flex flex-col">
                          New Image:
                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleEditingFileChange}
                            className="border p-1 rounded"
                          />
                        </label>
                      </>
                    ) : course.ImageURL ? (
                      <img
                        src={`http://localhost/virtujam${course.ImageURL}`}
                        alt="Course"
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === course.IDCourse ? (
                      <>
                        <button
                          onClick={handleUpdateCourse}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingImageFile(null); }}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(course)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.IDCourse)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageCourses;
