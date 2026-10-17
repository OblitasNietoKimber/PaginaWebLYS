import { useEffect, useRef } from 'react';
import '../styles/embers.css';

type Ember = { x: number; y: number; size: number; angle: number; born: number; drift: number };

/** Brasas decorativas: sólo se dibujan mientras hay partículas vivas. */
export function EmberTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(any-pointer: fine)');
    let particles: Ember[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let lastSpawn = 0;
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      particles = particles.filter(p => now - p.born < 1100);
      for (const p of particles) {
        const life = (now - p.born) / 1100;
        context.save();
        context.translate(p.x + p.drift * life, p.y - 42 * life);
        context.rotate(p.angle + life * .7);
        context.globalAlpha = .75 * (1 - life);
        context.shadowColor = '#e21816';
        context.shadowBlur = 10;
        const glow = context.createLinearGradient(-p.size, 0, p.size, 0);
        glow.addColorStop(0, '#850c13');
        glow.addColorStop(.5, '#ef3622');
        glow.addColorStop(1, '#b30d17');
        context.fillStyle = glow;
        context.beginPath();
        context.moveTo(-p.size, 0);
        context.lineTo(-p.size * .3, -p.size * .4);
        context.lineTo(p.size * .65, -p.size * .18);
        context.lineTo(p.size, 0);
        context.lineTo(0, p.size * .35);
        context.closePath();
        context.fill();
        context.restore();
      }
      frame = particles.length ? requestAnimationFrame(draw) : 0;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || motion.matches || !pointer.matches) return;
      const now = performance.now();
      if (now - lastSpawn < 35) return;
      lastSpawn = now;
      const bounds = host.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        particles.push({ x: event.clientX - bounds.left + (Math.random() - .5) * 24,
          y: event.clientY - bounds.top + (Math.random() - .5) * 18,
          size: 2 + Math.random() * 4, angle: Math.random() * Math.PI,
          born: now, drift: (Math.random() - .5) * 30 });
      }
      particles = particles.slice(-90);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const clear = () => {
      particles = [];
      cancelAnimationFrame(frame);
      frame = 0;
      context.clearRect(0, 0, width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener('pointermove', move);
    motion.addEventListener('change', clear);
    pointer.addEventListener('change', clear);
    return () => {
      clear();
      observer.disconnect();
      host.removeEventListener('pointermove', move);
      motion.removeEventListener('change', clear);
      pointer.removeEventListener('change', clear);
    };
  }, []);
  return <canvas ref={canvasRef} className="ember-trail" aria-hidden="true" />;
}
