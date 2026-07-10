import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import graphStore from '../store/GraphStore';
import CrashGameGraph from './CrashGameGraph'; // Make sure this file exists

const GameCanvas = observer(({ width, height }) => {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  // Initialize the graph when the component mounts
  useEffect(() => {
    if (canvasRef.current && !graphRef.current) {
      graphRef.current = new CrashGameGraph(graphStore.game);
      graphRef.current.mountEffect(canvasRef.current);
    }

    return () => {
      if (graphRef.current) {
        graphRef.current.mountEffect(null); // Unmount the graph
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current) {
        graphRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="bg-[var(--card-bg-1)] rounded w-full block h-[230px] md:h-[360px]"
      width={width}
      height={height}
    />
  );
});

export default GameCanvas; 