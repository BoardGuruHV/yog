"use client";

import { useEffect, useRef } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
}

// Simple QR Code generator using canvas
// For production, consider using a library like qrcode.react
export default function QRCode({ value, size = 128 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Simple QR-like pattern (placeholder - in production use qrcode library)
    // This creates a visual placeholder that looks like a QR code
    const moduleSize = size / 25;
    ctx.fillStyle = "#000000";

    // Finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      // Outer
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
      // White middle
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
      // Black center
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };

    drawFinder(moduleSize * 2, moduleSize * 2); // Top-left
    ctx.fillStyle = "#000000";
    drawFinder(moduleSize * 16, moduleSize * 2); // Top-right
    ctx.fillStyle = "#000000";
    drawFinder(moduleSize * 2, moduleSize * 16); // Bottom-left

    // Generate data pattern from string
    ctx.fillStyle = "#000000";
    const hash = value.split("").reduce((a, b) => {
      const h = (a << 5) - a + b.charCodeAt(0);
      return h & h;
    }, 0);

    // Data modules
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        const x = (i + 9) * moduleSize;
        const y = (j + 2) * moduleSize;

        // Skip finder areas
        if (i < 5 && j < 5) continue;
        if (i >= 14 && j < 5) continue;
        if (i < 5 && j >= 14) continue;

        // Pseudo-random fill based on hash and position
        if ((hash + i * 17 + j * 23) % 3 === 0) {
          ctx.fillRect(x, y, moduleSize * 0.9, moduleSize * 0.9);
        }
      }
    }

    // More data patterns
    for (let i = 2; i < 9; i++) {
      for (let j = 9; j < 16; j++) {
        if ((hash + i * 13 + j * 29) % 3 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize * 0.9, moduleSize * 0.9);
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg border border-gray-200"
    />
  );
}
