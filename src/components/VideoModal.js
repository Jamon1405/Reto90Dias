"use client";
import { useEffect, useRef } from 'react';
import styles from './VideoModal.module.css';

export default function VideoModal({ src, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const video = videoRef.current;
    if (video) {
      void video.play();
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleClose = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        className={styles.video}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
