// src/pages/Category.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function Category() {
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get course id from query parameters.
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id");

  useEffect(() => {
    // Fetch course details using the course API.
    fetch(`http://localhost/virtujam/public/api/course_api.php?id=${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
      })
      .catch((err) => console.error("Error fetching course details:", err));

    // Fetch all videos and filter them by CourseID.
    fetch('http://localhost/virtujam/public/api/video_api.php')
      .then((res) => res.json())
      .then((data) => {
        // Ensure the types match; if courseId is a string, convert video.CourseID accordingly.
        const filteredVideos = data.filter(
          (video) => String(video.CourseID) === courseId
        );
        setVideos(filteredVideos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) {
    return (
      <main className="container mx-auto p-8 my-6">
        <p className="text-2xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="container flex flex-col items-center mx-auto p-8 mb-6 mt-6">
      <h1 className="text-3xl font-black mb-8">
        {course ? course.Title.toUpperCase() : "COURSE"}
      </h1>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full">
        {videos.map((video) => (
          <Link
            key={video.IDVideo}
            to={`/video?id=${video.IDVideo}`}
            className="relative flex flex-col items-center justify-center bg-cover bg-center rounded-3xl overflow-hidden"
            style={{ height: "400px" }}
          >
            <img
              src={
                video.ImageURL
                  ? `http://localhost/virtujam${video.ImageURL}`
                  : "http://localhost/virtujam/src/img/fallback.png"
              }
              alt={video.Title}
              className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-all"
            />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white">
                {video.Title.toUpperCase()}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Category;
