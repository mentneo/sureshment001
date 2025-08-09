import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './Admin.css';
import './Videos.css';

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setAdding(true);
    try {
      const docRef = await addDoc(collection(db, 'videos'), {
        url: newUrl,
        createdAt: serverTimestamp(),
      });
      
      // Add the new video to the state with its id
      setVideos([{ 
        id: docRef.id, 
        url: newUrl,
        createdAt: new Date() // Use current date for immediate display
      }, ...videos]);
      
      setNewUrl('');
      toast.success('Video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video: ' + error.message);
    } finally {
      setAdding(false);
    }
  };
  
  const handleEditVideo = async (e) => {
    e.preventDefault();
    if (!editUrl || !editingVideo) return;
    
    setEditing(true);
    try {
      await updateDoc(doc(db, 'videos', editingVideo.id), {
        url: editUrl,
        updatedAt: serverTimestamp()
      });
      
      // Update the video in the state
      setVideos(videos.map(video => 
        video.id === editingVideo.id 
          ? { ...video, url: editUrl } 
          : video
      ));
      
      toast.success('Video updated successfully!');
      setEditingVideo(null);
      setEditUrl('');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video: ' + error.message);
    } finally {
      setEditing(false);
    }
  };
  
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await deleteDoc(doc(db, 'videos', videoId));
      
      // Remove the video from the state
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video: ' + error.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage YouTube Videos</h1>
        </div>
        
        {/* Add video form */}
        <form className="admin-form" onSubmit={handleAddVideo} style={{ marginBottom: 24 }}>
          <input
            type="url"
            placeholder="YouTube Video URL"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            required
            style={{ width: '60%', marginRight: 12 }}
          />
          <button type="submit" className="admin-button" disabled={adding}>
            {adding ? 'Adding...' : 'Add Video'}
          </button>
        </form>
        
        {/* Edit video form */}
        {editingVideo && (
          <form className="admin-form edit-form" onSubmit={handleEditVideo}>
            <h3>Edit Video</h3>
            <input
              type="url"
              placeholder="New YouTube Video URL"
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 12 }}
            />
            <div className="edit-form-buttons">
              <button type="submit" className="admin-button" disabled={editing}>
                {editing ? 'Updating...' : 'Update Video'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setEditingVideo(null);
                  setEditUrl('');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        {loading ? (
          <div className="loading">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div>No videos found.</div>
        ) : (
          <div className="videos-list">
            {videos.map((video) => {
              const match = video.url.match(/(?:v=|youtu.be\/)([\w-]{11})/);
              const videoId = match ? match[1] : null;
              return videoId ? (
                <div key={video.id} className="video-embed">
                  <iframe
                    width="400"
                    height="225"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="video-actions">
                    <button 
                      onClick={() => {
                        setEditingVideo(video);
                        setEditUrl(video.url);
                      }}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteVideo(video.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;
