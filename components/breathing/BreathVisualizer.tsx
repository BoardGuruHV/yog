"use client";

import { useEffect, useRef } from "react";
import { BreathPhase } from "@/lib/audio/breath-detector";

interface BreathVisualizerProps {
  phase: BreathPhase;
  volume: number;
  targetPhase?: BreathPhase;
  progress?: number; // 0-1 progress through current guided phase
  size?: number;
}

const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: "#22c55e", // green
  exhale: "#3b82f6", // blue
  hold: "#f59e0b", // amber
  idle: "#6b7280", // gray
};

export default function BreathVisualizer({
  phase,
  volume,
  targetPhase,
  progress = 0,
  size = 300,
}: BreathVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2 - 20;

    const animate = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, size, size);

      // Background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#f3f4f6";
      ctx.fill();

      // Target phase indicator (outer ring)
      if (targetPhase) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.strokeStyle = PHASE_COLORS[targetPhase];
        ctx.lineWidth = 4;
        ctx.stroke();

        // Progress arc
        if (progress > 0) {
          ctx.beginPath();
          ctx.arc(
            centerX,
            centerY,
            maxRadius,
            -Math.PI / 2,
            -Math.PI / 2 + progress * Math.PI * 2
          );
          ctx.strokeStyle = PHASE_COLORS[targetPhase];
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // Breathing circle (responds to volume)
      const baseRadius = maxRadius * 0.3;
      const breathRadius = baseRadius + volume * maxRadius * 0.5;

      // Pulsing effect based on phase
      let pulseOffset = 0;
      if (phase === "inhale") {
        pulseOffset = Math.sin(timeRef.current * 3) * 5;
      } else if (phase === "exhale") {
        pulseOffset = Math.sin(timeRef.current * 2) * 3;
      }

      const finalRadius = breathRadius + pulseOffset;

      // Gradient fill
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        finalRadius
      );
      const phaseColor = PHASE_COLORS[phase];
      gradient.addColorStop(0, phaseColor + "ff");
      gradient.addColorStop(0.7, phaseColor + "aa");
      gradient.addColorStop(1, phaseColor + "44");

      ctx.beginPath();
      ctx.arc(centerX, centerY, finalRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, finalRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fill();

      // Ripple effect during active phases
      if (phase === "inhale" || phase === "exhale") {
        const ripplePhase = (timeRef.current * 2) % 1;
        const rippleRadius = finalRadius + ripplePhase * 30;
        const rippleAlpha = 1 - ripplePhase;

        ctx.beginPath();
        ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${phaseColor}${Math.floor(rippleAlpha * 100)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, volume, targetPhase, progress, size]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} />

      {/* Phase label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-2xl font-bold capitalize"
            style={{ color: PHASE_COLORS[phase] }}
          >
            {phase === "idle" ? "Ready" : phase}
          </p>
          {volume > 0.1 && (
            <p className="text-sm text-gray-500 mt-1">
              {Math.round(volume * 100)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
