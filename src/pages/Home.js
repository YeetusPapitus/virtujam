// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from the API on component mount.
  useEffect(() => {
    fetch('http://localhost/virtujam/public/api/course_api.php')
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <p className="text-2xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto mb-16">
      {courses.map((course) => (
        <Link
          key={course.IDCourse}
          to={`/category?id=${course.IDCourse}`}
          className="flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden mt-16 rounded-3xl border-2 border-stone-950"
          style={{ height: '600px' }}
        >
          <img
            src={
              course.ImageURL
                ? `http://localhost/virtujam${course.ImageURL}`
                : ''
            }
            alt={course.Title}
            className="absolute inset-0 object-cover w-full h-full opacity-75 hover:scale-110 transition-all"
          />
          <div className="relative bg-opacity-50 p-6 rounded">
            <h2 className="text-9xl font-bold text-white">
              {course.Title.toUpperCase()}
            </h2>
          </div>
        </Link>
      ))}
    </main>
  );
}

export default Home;
