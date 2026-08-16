import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface ShareParticlesCanvasHandle {
  triggerShareBurst: (x?: number, y?: number, intensity?: number) => void;
  triggerBlockJackpot: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  rotation: number;
  rotSpeed: number;
  type: 'dot' | 'spark' | 'coin' | 'ring';
  glow: number;
}

interface ShareParticlesCanvasProps {
  validSharesCount: number;
  bestDifficulty: number;
  blocksFoundCount: number;
  className?: string;
}

export const ShareParticlesCanvas = forwardRef<ShareParticlesCanvasHandle, ShareParticlesCanvasProps>(({
  validSharesCount,
  bestDifficulty,
  blocksFoundCount,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  const prevSharesRef = useRef<number>(validSharesCount);
  const prevDiffRef = useRef<number>(bestDifficulty);
  const prevBlocksRef = useRef<number>(blocksFoundCount);

  // Colors palette for Bitcoin Mining Gold & Cyan Sparks
  const GOLD_COLORS = ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#ffffff', '#38bdf8'];

  // Add a burst of particles
  const addBurst = useCallback((
    originX: number, 
    originY: number, 
    count = 35, 
    speedMultiplier = 1, 
    isBlock = false
  ) => {
    const newParticles: Particle[] = [];
    const colors = isBlock 
      ? ['#f59e0b', '#fbbf24', '#ffffff', '#10b981', '#a855f7', '#ec4899'] 
      : GOLD_COLORS;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = (Math.random() * 4 + 1.5) * speedMultiplier;
      const size = Math.random() * 4 + 2;
      const typeChoice = Math.random();
      const type: Particle['type'] = typeChoice < 0.65 ? 'dot' : typeChoice < 0.85 ? 'spark' : typeChoice < 0.95 ? 'coin' : 'ring';

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isBlock ? 2 : 1),
        size: type === 'coin' ? 10 : size,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + (isBlock ? 0.008 : 0.015),
        gravity: 0.06,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type,
        glow: Math.random() * 8 + 4
      });
    }

    particlesRef.current.push(...newParticles);

    // Start animation loop if not running
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      requestAnimationFrame(renderLoop);
    }
  }, []);

  // Expose handles to parent
  useImperativeHandle(ref, () => ({
    triggerShareBurst: (x?: number, y?: number, intensity = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const posX = x ?? canvas.width / 2;
      const posY = y ?? canvas.height / 2;
      addBurst(posX, posY, Math.floor(35 * intensity), intensity);
    },
    triggerBlockJackpot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Multiple cascading fireworks bursts
      for (let b = 0; b < 4; b++) {
        setTimeout(() => {
          if (!canvasRef.current) return;
          const cx = Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
          const cy = Math.random() * (canvas.height * 0.6) + canvas.height * 0.2;
          addBurst(cx, cy, 60, 1.4, true);
        }, b * 220);
      }
    }
  }), [addBurst]);

  // Main Canvas Render Loop
  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      isRunningRef.current = false;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isRunningRef.current = false;
      return;
    }

    // Clear frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update position & physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98; // Air resistance
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      // Remove dead particles
      if (p.alpha <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowBlur = p.glow;
      ctx.shadowColor = p.color;

      if (p.type === 'coin') {
        // Draw miniature glowing ₿ Bitcoin
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.font = `bold ${Math.round(p.size)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₿', 0, 0);
      } else if (p.type === 'spark') {
        // Star spark line
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(p.size, 0);
        ctx.moveTo(0, -p.size);
        ctx.lineTo(0, p.size);
        ctx.stroke();
      } else if (p.type === 'ring') {
        // Expanding pulse ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (2 - p.alpha), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Glowing circular ember
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }
  };

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width || 320;
        canvas.height = rect.height || 240;
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      observer.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // React on Valid Share count increase
  useEffect(() => {
    if (validSharesCount > prevSharesRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        // Trigger celebratory share particle burst from bottom/center
        const cx = canvas.width / 2 + (Math.random() - 0.5) * 60;
        const cy = canvas.height * 0.65;
        addBurst(cx, cy, 40, 1.1);
      }
    }
    prevSharesRef.current = validSharesCount;
  }, [validSharesCount, addBurst]);

  // React on Best Difficulty increase
  useEffect(() => {
    if (bestDifficulty > prevDiffRef.current && prevDiffRef.current > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        addBurst(canvas.width * 0.5, canvas.height * 0.4, 30, 1.2);
      }
    }
    prevDiffRef.current = bestDifficulty;
  }, [bestDifficulty, addBurst]);

  // React on Block Won count increase
  useEffect(() => {
    if (blocksFoundCount > prevBlocksRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        for (let b = 0; b < 5; b++) {
          setTimeout(() => {
            if (!canvasRef.current) return;
            const cx = Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
            const cy = Math.random() * (canvas.height * 0.6) + canvas.height * 0.2;
            addBurst(cx, cy, 60, 1.5, true);
          }, b * 200);
        }
      }
    }
    prevBlocksRef.current = blocksFoundCount;
  }, [blocksFoundCount, addBurst]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-30 ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
});

ShareParticlesCanvas.displayName = 'ShareParticlesCanvas';
