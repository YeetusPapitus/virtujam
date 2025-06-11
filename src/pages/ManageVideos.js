// src/pages/ManageVideos.js
import React, { useState, useEffect } from 'react';

function ManageVideos() {
  // State for listing videos and for the new video form.
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    Title: '',
    Description: '',
    VideoURL: '',
    CourseID: ''
  });
  const [newThumb, setNewThumb] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // State for editing a video.
  const [editingId, setEditingId] = useState(null);
  const [editingVideo, setEditingVideo] = useState({
    Title: '',
    Description: '',
    VideoURL: '',
    CourseID: '',
    ImageURL: ''
  });
  const [editingImageFile, setEditingImageFile] = useState(null);

  // State for available courses for the dropdown.
  const [coursesList, setCoursesList] = useState([]);

  const videoApiUrl = 'http://localhost/virtujam/public/api/video_api.php';
  const courseApiUrl = 'http://localhost/virtujam/public/api/course_api.php';

  // Fetch videos
  const fetchVideos = () => {
    fetch(videoApiUrl)
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error('Error fetching videos:', error));
  };

  // Fetch courses for dropdown
  const fetchCourses = () => {
    fetch(courseApiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Ensure data is an array.
        if (!Array.isArray(data)) {
          data = [data];
        }
        setCoursesList(data);
      })
      .catch((error) => console.error("Error fetching courses:", error));
  };

  useEffect(() => {
    fetchVideos();
    fetchCourses();
  }, []);

  // --- New Video Form Handlers ---
  const handleNewChange = (e) => {
    setNewVideo({ ...newVideo, [e.target.name]: e.target.value });
  };

  const handleNewThumb = (e) => {
    setNewThumb(e.target.files[0]);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Title', newVideo.Title);
    formData.append('Description', newVideo.Description);
    formData.append('VideoURL', newVideo.VideoURL);
    formData.append('CourseID', newVideo.CourseID);
    if (newThumb) {
      formData.append('image', newThumb);
    }
    try {
      const response = await fetch(videoApiUrl, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("Video added successfully.");
        setNewVideo({ Title: '', Description: '', VideoURL: '', CourseID: '' });
        setNewThumb(null);
        fetchVideos();
      } else {
        setStatusMsg(data.message || "Failed to add video.");
      }
    } catch (error) {
      console.error("Error adding video:", error);
      setStatusMsg("Error adding video.");
    }
  };

  // --- Delete Video ---
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${videoApiUrl}?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("Video deleted successfully.");
        fetchVideos();
      } else {
        setStatusMsg(data.message || "Failed to delete video.");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      setStatusMsg("Error deleting video.");
    }
  };

  // --- Edit Video Handlers ---
  const handleEdit = (video) => {
  // Ensure video.Title exists.
  console.log("Editing video Title:", video.Title);
  setEditingId(video.IDVideo);
  setEditingVideo({
    Title: video.Title,
    Description: video.Description,
    VideoURL: video.VideoURL,
    CourseID: video.CourseID,
    ImageURL: video.ImageURL || ""
  });
  setEditingImageFile(null);
};


  const handleEditChange = (e) => {
    setEditingVideo({ ...editingVideo, [e.target.name]: e.target.value });
  };

  const handleEditThumb = (e) => {
    setEditingImageFile(e.target.files[0]);
  };

  const handleUpdateVideo = async (e) => {
  e.preventDefault();
  console.log("Updating video with Title:", editingVideo.Title); // Debug log
  const formData = new FormData();
  formData.append('_method', 'PUT'); // Method override for update
  formData.append('Title', editingVideo.Title);
  formData.append('Description', editingVideo.Description);
  formData.append('VideoURL', editingVideo.VideoURL);
  formData.append('CourseID', editingVideo.CourseID);
  if (editingImageFile) {
    formData.append('image', editingImageFile);
  } else {
    formData.append('ImageURL', editingVideo.ImageURL);
  }
  
  try {
    const response = await fetch(`${videoApiUrl}?id=${editingId}`, {
      method: 'POST', // Using POST with _method override.
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      setStatusMsg("Video updated successfully.");
      setEditingId(null);
      setEditingVideo({ Title: '', Description: '', VideoURL: '', CourseID: '', ImageURL: '' });
      setEditingImageFile(null);
      fetchVideos();
    } else {
      setStatusMsg(data.message || "Failed to update video.");
    }
  } catch (error) {
    console.error("Error updating video:", error);
    setStatusMsg("Error updating video.");
  }
};


  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingVideo({ Title: '', Description: '', VideoURL: '', CourseID: '', ImageURL: '' });
    setEditingImageFile(null);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Manage Videos</h1>
      {statusMsg && <p className="mb-4">{statusMsg}</p>}

      {/* Form to Add New Video */}
      <form onSubmit={handleAddVideo} className="flex flex-col gap-4 mb-8" encType="multipart/form-data">
        <input
          type="text"
          name="Title"
          placeholder="Title"
          className="border p-2 rounded"
          value={newVideo.Title}
          onChange={handleNewChange}
          required
        />
        <textarea
          name="Description"
          placeholder="Description"
          className="border p-2 rounded"
          value={newVideo.Description}
          onChange={handleNewChange}
        ></textarea>
        <input
          type="text"
          name="VideoURL"
          placeholder="Video URL (YouTube)"
          className="border p-2 rounded"
          value={newVideo.VideoURL}
          onChange={handleNewChange}
          required
        />
        <label className="flex flex-col">
          Course:
          <select
            name="CourseID"
            value={newVideo.CourseID}
            onChange={handleNewChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Course</option>
            {coursesList.map((course) => (
              <option key={course.IDCourse} value={course.IDCourse}>
                {course.Title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          Thumbnail Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleNewThumb}
            className="border p-2 rounded"
          />
        </label>
        <button type="submit" className="bg-primary text-white py-2 rounded">
          Add Video
        </button>
      </form>

      {/* Video List */}
      <div>
        {videos.length === 0 ? (
          <p>No videos available.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Thumbnail</th>
                <th className="border p-2">Video URL</th>
                <th className="border p-2">Course</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.IDVideo}>
                  <td className="border p-2">{video.IDVideo}</td>
                  <td className="border p-2">
                    {editingId === video.IDVideo ? (
                      <input
                        type="text"
                        name="Title"
                        value={editingVideo.Title || ''} // Use an empty string if undefined
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                    />

                    ) : (
                      video.Title
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === video.IDVideo ? (
                      <>
                        {video.ImageURL && !editingImageFile && (
                          <img
                            src={`http://localhost/virtujam${video.ImageURL}`}
                            alt={video.Title}
                            className="w-16 h-16 object-cover mb-2"
                          />
                        )}
                        <label className="flex flex-col">
                          New Thumbnail:
                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleEditThumb}
                            className="border p-1 rounded"
                          />
                        </label>
                      </>
                    ) : video.ImageURL ? (
                      <img
                        src={`http://localhost/virtujam${video.ImageURL}`}
                        alt={video.Title}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      "No thumbnail"
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === video.IDVideo ? (
                      <input
                        type="text"
                        name="VideoURL"
                        value={editingVideo.VideoURL}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                      />
                    ) : (
                      video.VideoURL
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === video.IDVideo ? (
                      <select
                        name="CourseID"
                        value={editingVideo.CourseID}
                        onChange={handleEditChange}
                        className="border p-1 rounded"
                        required
                      >
                        <option value="">Select Course</option>
                        {coursesList.map((course) => (
                          <option key={course.IDCourse} value={course.IDCourse}>
                            {course.Title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Display Course Title based on matching CourseID
                      coursesList.find(c => c.IDCourse === video.CourseID)?.Title || video.CourseID
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === video.IDVideo ? (
                      <>
                        <button
                          onClick={handleUpdateVideo}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(video)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.IDVideo)}
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

export default ManageVideos;
