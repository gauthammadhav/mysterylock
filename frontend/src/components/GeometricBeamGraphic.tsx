"use client";

import React, { useEffect, useRef } from "react";

export function GeometricBeamGraphic() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 560);
    let height = (canvas.height = 480);

    // Create ambient dust particles
    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      pulse: number;
    }> = [];

    const colors = ["#2ee6a8", "#67e8f9", "#c084fc", "#f472b6"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Render floating ambient particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = Math.max(0.1, p.alpha * (0.6 + 0.4 * Math.sin(p.pulse)));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[540px] aspect-[1.15/1] select-none pointer-events-none flex items-center justify-center">
      {/* Background canvas for floating dust particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Main Vector 3D Origami / Directional Ray Beam */}
      <svg
        viewBox="0 0 540 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_40px_rgba(46,230,168,0.25)] transform hover:scale-105 transition-transform duration-700"
      >
        <defs>
          {/* Gradient for left wing (Mint to Cyan) */}
          <linearGradient id="mintGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ee6a8" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
          </linearGradient>

          {/* Gradient for right wing (Cyan to Neon Pink/Violet) */}
          <linearGradient id="purpleGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ee6a8" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
          </linearGradient>

          {/* Radiant Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic Dot Grid / Ray Array mimicking the 3D folded aerodynamic shape */}
        <g filter="url(#glow)">
          {/* Central Nose Point: (490, 180) */}
          {/* Array of dotted rays fanning backward to create the volumetric mesh */}
          {Array.from({ length: 28 }).map((_, i) => {
            const ratio = i / 27; // 0 to 1
            // Top wing rays
            const startX = 490;
            const startY = 180;
            const endX = 30 + ratio * 240;
            const endY = 320 - ratio * 180;

            const strokeColor =
              ratio < 0.45 ? "#2ee6a8" : ratio < 0.75 ? "#38bdf8" : "#e879f9";

            return (
              <line
                key={`top-ray-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth={ratio > 0.8 ? "1.8" : "1.2"}
                strokeOpacity={0.4 + 0.5 * (1 - ratio * 0.3)}
                strokeDasharray="2 6"
              />
            );
          })}

          {/* Lower wing rays expanding downward */}
          {Array.from({ length: 24 }).map((_, i) => {
            const ratio = i / 23;
            const startX = 490;
            const startY = 180;
            const endX = 140 + ratio * 200;
            const endY = 350 - ratio * 40;

            const strokeColor = ratio < 0.4 ? "#2ee6a8" : "#c084fc";

            return (
              <line
                key={`bot-ray-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth="1.4"
                strokeOpacity={0.35 + 0.4 * (1 - ratio)}
                strokeDasharray="1.5 5"
              />
            );
          })}

          {/* Cross contour lines providing 3D depth */}
          {Array.from({ length: 14 }).map((_, i) => {
            const step = (i + 1) / 15;
            const x1 = 490 - step * 380;
            const y1 = 180 + step * 100;
            const x2 = 490 - step * 280;
            const y2 = 180 - step * 60;

            return (
              <line
                key={`cross-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2ee6a8"
                strokeWidth="1.5"
                strokeOpacity={0.25 + step * 0.4}
                strokeDasharray="2 4"
              />
            );
          })}

          {/* Solid structural accent spine */}
          <line
            x1="490"
            y1="180"
            x2="80"
            y2="330"
            stroke="url(#purpleGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <line
            x1="490"
            y1="180"
            x2="240"
            y2="140"
            stroke="url(#mintGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Glowing Nose Sparkle */}
          <circle cx="490" cy="180" r="5" fill="#ffffff" filter="url(#glow)" />
          <circle cx="490" cy="180" r="10" fill="#2ee6a8" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
