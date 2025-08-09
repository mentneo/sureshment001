import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Home.css';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(videosQuery);
        setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="home-page">
      <div className="container">
        <h2 style={{ marginTop: 32, marginBottom: 16 }}>Our YouTube Videos</h2>
        {loading ? (
          <div className="loading">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div>No videos found.</div>
        ) : (
          <div className="videos-list">
            {videos.map((video, idx) => {
              const match = video.url.match(/(?:v=|youtu.be\/)([\w-]{11})/);
              const videoId = match ? match[1] : null;
              return videoId ? (
                <div key={idx} className="video-embed" style={{ marginBottom: 24 }}>
                  <iframe
                    width="400"
                    height="225"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
