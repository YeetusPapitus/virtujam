// src/components/Footer.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import instagramlogo from '../img/Instagram_icon.png';
import youtubelogo from '../img/Youtube_logo.png';
import tiktoklogo from '../img/tiktok_logo.png';
import facebooklogo from '../img/Facebook_Logo.png';

function Footer() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost/virtujam/public/api/course_api.php')
      .then((response) => response.json())
      .then((data) => {
        // Ensure that data is an array (if only one course is returned, you may need a check)
        if (!Array.isArray(data)) {
          data = [data];
        }
        setCourses(data);
      })
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  return (
    <footer id="footer" className="bg-primary text-white p-6">
      <div className="container mx-auto px-10 flex flex-col md:flex-row md:justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Courses</h2>
          {courses.map((course) => (
            <Link
              key={course.IDCourse}
              to={`/category?id=${course.IDCourse}`}
              className="hover:text-gray-300 transition text-lg font-bold"
            >
              {course.Title}
            </Link>
          ))}
        </div>
        <div>
          <h2 className="text-3xl font-bold">Contact</h2>
          <p className="text-lg font-bold">+385 98 123 1234</p>
          <p className="text-lg font-bold">ivanmusic123@gmail.com</p>
          <p className="text-lg font-bold">Pantovčak 28</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4 items-center">
          <a className="w-16 rounded-xl hover:scale-110 transition-all" href="https://www.instagram.com/virtu_jam/">
            <img src={instagramlogo} alt="Instagram" />
          </a>
          <a className="w-16 rounded-xl hover:scale-110 transition-all" href="https://www.youtube.com/@VirtuJam">
            <img src={youtubelogo} alt="Youtube" />
          </a>
          <a className="w-16 rounded-xl hover:scale-110 transition-all" href="https://www.tiktok.com/@virtujam">
            <img src={tiktoklogo} alt="Tiktok" />
          </a>
          <a className="w-16 rounded-xl hover:scale-110 transition-all" href="https://www.facebook.com/profile.php?id=61576091026813">
            <img src={facebooklogo} alt="Facebook" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
