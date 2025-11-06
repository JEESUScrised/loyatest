import { useState, useEffect } from 'react';

export const useZoomDetection = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const updateZoom = () => {
      const zoom = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;
      const screenWidth = window.screen.width;
      
      // Detect if zoomed
      const zoomed = viewportWidth < screenWidth * 0.9;
      
      setZoomLevel(zoom);
      setIsZoomed(zoomed);
      
      // Add class to body for CSS targeting
      if (zoomed) {
        document.body.classList.add('zoomed');
      } else {
        document.body.classList.remove('zoomed');
      }
    };

    // Initial check
    updateZoom();

    // Listen for resize events
    window.addEventListener('resize', updateZoom);
    window.addEventListener('orientationchange', updateZoom);

    return () => {
      window.removeEventListener('resize', updateZoom);
      window.removeEventListener('orientationchange', updateZoom);
    };
  }, []);

  return { zoomLevel, isZoomed };
};
