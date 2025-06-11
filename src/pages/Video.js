// src/pages/Video.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Video() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("id");

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost/virtujam/public/api/video_api.php?id=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        setVideo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching video:", err);
        setLoading(false);
      });
  }, [videoId]);

  if (loading) {
    return (
      <main className="container mx-auto p-8 mb-6 mt-6 px-40">
        <p className="text-2xl">Loading...</p>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="container mx-auto p-8 mb-6 mt-6 px-40">
        <p className="text-2xl">Video not found.</p>
      </main>
    );
  }

  // Convert the YouTube URL into an embeddable URL, if necessary.
  let embedUrl = video.VideoURL;
  try {
    const urlObj = new URL(video.VideoURL);
    if (urlObj.hostname.includes("youtube.com")) {
      // If it's the standard YouTube URL, extract the "v" parameter.
      const vParam = urlObj.searchParams.get("v");
      if (vParam) {
        embedUrl = `https://www.youtube.com/embed/${vParam}`;
      }
    }
  } catch (error) {
    console.error("Error parsing VideoURL", error);
  }

  return (
    <main className="container mx-auto p-8 mb-6 mt-6 px-40">
      <div className="flex flex-col gap-4">
        <iframe
          className="w-full"
          style={{ height: "700px" }}
          title={video.Title}
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <h2 className="text-6xl mb-2 mt-4">{video.Title}</h2>
        <p className="text-gray-700 mb-4 text-2xl">{video.Description}</p>
      </div>
    </main>
  );
}

export default Video;
