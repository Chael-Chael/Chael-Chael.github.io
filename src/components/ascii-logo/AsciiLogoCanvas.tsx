'use client';

/* eslint-disable @next/next/no-img-element -- The hidden native image is the Canvas pixel-sampling source. */

import { useEffect, useRef } from 'react';
import styles from './AsciiLogoCanvas.module.css';

const CELL_SIZE = 10;
const CELL_GAP = 2;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const ASCII_CHARS = '.#@%*+=-';

// The MAIR mark contains intentionally deep blues (median perceived brightness
// is about 50), so a conventional 128 threshold would remove most of the logo.
const THRESHOLD = 24;

const PUSH_RADIUS = 110;
const PUSH_FORCE = 15;
const SPRING = 0.1;
const DAMPING = 0.85;

const POINTER_IDLE_DELAY = 90;
const MAX_SPEED = 30;
const SLEEP_VELOCITY = 0.02;
const SLEEP_OFFSET = 0.04;

type Cell = {
  col: number;
  row: number;
  x: number;
  y: number;
  char: string;
  isLit: boolean;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
  color: string;
};

type SourceBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MouseState = {
  x: number;
  y: number;
  isMoving: boolean;
};

function randomAsciiChar() {
  return ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
}

function perceivedBrightness(red: number, green: number, blue: number) {
  return (red * 0.299) + (green * 0.587) + (blue * 0.114);
}

function getVisibleColor(red: number, green: number, blue: number, brightness: number, alpha: number) {
  const lift = Math.min(1.55, Math.max(1.08, 78 / Math.max(brightness, 1)));
  const visibleRed = Math.min(255, Math.round((red * lift) + 5));
  const visibleGreen = Math.min(255, Math.round((green * lift) + 10));
  const visibleBlue = Math.min(255, Math.round((blue * lift) + 14));
  const visibleAlpha = Math.max(0.58, alpha / 255);

  return `rgba(${visibleRed}, ${visibleGreen}, ${visibleBlue}, ${visibleAlpha.toFixed(3)})`;
}

export default function AsciiLogoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const sourceNode = sourceRef.current;

    if (!canvasNode || !sourceNode) {
      return;
    }

    const context = canvasNode.getContext('2d');

    if (!context) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasNode;
    const source: HTMLImageElement = sourceNode;
    const ctx: CanvasRenderingContext2D = context;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mouse: MouseState = {
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY,
      isMoving: false,
    };

    let cells: Cell[] = [];
    let litCells: Cell[] = [];
    let sourceBounds: SourceBounds | null = null;
    let cssWidth = 0;
    let cssHeight = 0;
    let reducedMotion = motionPreference.matches;
    let initialized = false;
    let animationFrame = 0;
    let resizeFrame = 0;
    let flickerTimer = 0;
    let pointerIdleTimer = 0;
    let lastFrameTime = 0;

    function findSourceBounds(): SourceBounds {
      const sourceCanvas = document.createElement('canvas');
      const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });

      if (!sourceCtx || source.naturalWidth === 0 || source.naturalHeight === 0) {
        return {
          x: 0,
          y: 0,
          width: Math.max(1, source.naturalWidth),
          height: Math.max(1, source.naturalHeight),
        };
      }

      sourceCanvas.width = source.naturalWidth;
      sourceCanvas.height = source.naturalHeight;
      sourceCtx.drawImage(source, 0, 0);

      const pixels = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
      let minX = sourceCanvas.width;
      let minY = sourceCanvas.height;
      let maxX = -1;
      let maxY = -1;

      for (let row = 0; row < sourceCanvas.height; row += 1) {
        for (let col = 0; col < sourceCanvas.width; col += 1) {
          const index = ((row * sourceCanvas.width) + col) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];

          if (alpha > 12 && perceivedBrightness(red, green, blue) > THRESHOLD) {
            minX = Math.min(minX, col);
            minY = Math.min(minY, row);
            maxX = Math.max(maxX, col);
            maxY = Math.max(maxY, row);
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        return {
          x: 0,
          y: 0,
          width: sourceCanvas.width,
          height: sourceCanvas.height,
        };
      }

      const padding = 2;
      const x = Math.max(0, minX - padding);
      const y = Math.max(0, minY - padding);
      const right = Math.min(sourceCanvas.width, maxX + padding + 1);
      const bottom = Math.min(sourceCanvas.height, maxY + padding + 1);

      return {
        x,
        y,
        width: right - x,
        height: bottom - y,
      };
    }

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      cssWidth = Math.max(1, Math.round(bounds.width));
      cssHeight = Math.max(1, Math.round(bounds.height));

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.max(1, Math.round(cssWidth * devicePixelRatio));
      canvas.height = Math.max(1, Math.round(cssHeight * devicePixelRatio));
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function sampleLogoIntoCells() {
      if (!sourceBounds || cssWidth === 0 || cssHeight === 0) {
        return;
      }

      const columns = Math.max(1, Math.floor(cssWidth / CELL_STEP));
      const rows = Math.max(1, Math.floor(cssHeight / CELL_STEP));
      const samplingCanvas = document.createElement('canvas');
      const samplingCtx = samplingCanvas.getContext('2d', { willReadFrequently: true });

      if (!samplingCtx) {
        return;
      }

      samplingCanvas.width = columns;
      samplingCanvas.height = rows;
      samplingCtx.clearRect(0, 0, columns, rows);
      samplingCtx.imageSmoothingEnabled = true;
      samplingCtx.imageSmoothingQuality = 'high';

      const sourceAspect = sourceBounds.width / sourceBounds.height;
      const maxLogoWidth = cssWidth * (cssWidth < 640 ? 0.86 : 0.76);
      const maxLogoHeight = cssHeight * (cssWidth < 640 ? 0.72 : 0.79);
      const targetWidth = Math.min(maxLogoWidth, maxLogoHeight * sourceAspect);
      const targetHeight = targetWidth / sourceAspect;
      const targetColumns = targetWidth / CELL_STEP;
      const targetRows = targetHeight / CELL_STEP;
      const destinationX = (columns - targetColumns) / 2;
      const destinationY = (rows - targetRows) / 2;

      samplingCtx.drawImage(
        source,
        sourceBounds.x,
        sourceBounds.y,
        sourceBounds.width,
        sourceBounds.height,
        destinationX,
        destinationY,
        targetColumns,
        targetRows,
      );

      const pixels = samplingCtx.getImageData(0, 0, columns, rows).data;
      const gridInsetX = (cssWidth - (columns * CELL_STEP)) / 2;
      const gridInsetY = (cssHeight - (rows * CELL_STEP)) / 2;
      const nextCells: Cell[] = [];
      const nextLitCells: Cell[] = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const index = ((row * columns) + col) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const brightness = perceivedBrightness(red, green, blue);
          const isLit = alpha > 20 && brightness > THRESHOLD;
          const cell: Cell = {
            col,
            row,
            x: gridInsetX + ((col + 0.5) * CELL_STEP),
            y: gridInsetY + ((row + 0.5) * CELL_STEP),
            char: randomAsciiChar(),
            isLit,
            offsetX: 0,
            offsetY: 0,
            vx: 0,
            vy: 0,
            color: isLit
              ? getVisibleColor(red, green, blue, brightness, alpha)
              : 'rgba(0, 0, 0, 0)',
          };

          nextCells.push(cell);

          if (cell.isLit) {
            nextLitCells.push(cell);
          }
        }
      }

      cells = nextCells;
      litCells = nextLitCells;
    }

    function resetCellMotion() {
      for (const cell of cells) {
        cell.offsetX = 0;
        cell.offsetY = 0;
        cell.vx = 0;
        cell.vy = 0;
      }
    }

    function updatePhysics(frameScale: number) {
      const damping = Math.pow(DAMPING, frameScale);
      const pushRadiusSquared = PUSH_RADIUS * PUSH_RADIUS;

      for (const cell of litCells) {
        const currentX = cell.x + cell.offsetX;
        const currentY = cell.y + cell.offsetY;
        const dx = currentX - mouse.x;
        const dy = currentY - mouse.y;
        const distanceSquared = (dx * dx) + (dy * dy);

        if (mouse.isMoving && distanceSquared < pushRadiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const force = ((PUSH_RADIUS - distance) / PUSH_RADIUS) * PUSH_FORCE * frameScale;

          if (distance > 0.001) {
            cell.vx += (dx / distance) * force;
            cell.vy += (dy / distance) * force;
          } else {
            const angleSeed = ((cell.col * 12.9898) + (cell.row * 78.233)) % 1;
            const angle = angleSeed * Math.PI * 2;
            cell.vx += Math.cos(angle) * force;
            cell.vy += Math.sin(angle) * force;
          }
        }

        cell.vx -= cell.offsetX * SPRING * frameScale;
        cell.vy -= cell.offsetY * SPRING * frameScale;
        cell.vx *= damping;
        cell.vy *= damping;

        const speed = Math.hypot(cell.vx, cell.vy);
        if (speed > MAX_SPEED) {
          const velocityScale = MAX_SPEED / speed;
          cell.vx *= velocityScale;
          cell.vy *= velocityScale;
        }

        cell.offsetX += cell.vx * frameScale;
        cell.offsetY += cell.vy * frameScale;

        const isNearlyStill = Math.abs(cell.vx) < SLEEP_VELOCITY && Math.abs(cell.vy) < SLEEP_VELOCITY;
        const isNearlyHome = Math.abs(cell.offsetX) < SLEEP_OFFSET && Math.abs(cell.offsetY) < SLEEP_OFFSET;

        if (isNearlyStill && isNearlyHome) {
          cell.vx = 0;
          cell.vy = 0;
          cell.offsetX = 0;
          cell.offsetY = 0;
        }
      }
    }

    function drawCells() {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.font = `600 ${CELL_SIZE}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const cell of litCells) {
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.char, cell.x + cell.offsetX, cell.y + cell.offsetY);
      }
    }

    function renderFrame(timestamp: number) {
      const frameScale = lastFrameTime === 0
        ? 1
        : Math.min(2, Math.max(0.35, (timestamp - lastFrameTime) / 16.667));

      lastFrameTime = timestamp;
      updatePhysics(frameScale);
      drawCells();
      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    function stopMotionLoop() {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(flickerTimer);
      animationFrame = 0;
      flickerTimer = 0;
    }

    function startMotionLoop() {
      stopMotionLoop();
      lastFrameTime = 0;

      if (reducedMotion) {
        resetCellMotion();
        drawCells();
        return;
      }

      flickerTimer = window.setInterval(() => {
        for (const cell of litCells) {
          cell.char = randomAsciiChar();
        }
      }, 50);

      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    function resizeAndResample() {
      resizeCanvas();
      sampleLogoIntoCells();

      if (reducedMotion) {
        drawCells();
      }
    }

    function handleResize() {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(resizeAndResample);
    }

    function setMousePosition(clientX: number, clientY: number) {
      const bounds = canvas.getBoundingClientRect();
      mouse.x = clientX - bounds.left;
      mouse.y = clientY - bounds.top;
      mouse.isMoving = !reducedMotion;

      window.clearTimeout(pointerIdleTimer);
      pointerIdleTimer = window.setTimeout(() => {
        mouse.isMoving = false;
      }, POINTER_IDLE_DELAY);
    }

    function handleMouseMove(event: MouseEvent) {
      setMousePosition(event.clientX, event.clientY);
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];

      if (touch) {
        setMousePosition(touch.clientX, touch.clientY);
      }
    }

    function releasePointer() {
      window.clearTimeout(pointerIdleTimer);
      mouse.x = Number.POSITIVE_INFINITY;
      mouse.y = Number.POSITIVE_INFINITY;
      mouse.isMoving = false;
    }

    function handleMotionPreference(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      releasePointer();
      startMotionLoop();
    }

    function initialize() {
      if (initialized || source.naturalWidth === 0 || source.naturalHeight === 0) {
        return;
      }

      initialized = true;
      sourceBounds = findSourceBounds();
      resizeAndResample();
      startMotionLoop();
    }

    source.addEventListener('load', initialize);
    window.addEventListener('resize', handleResize, { passive: true });
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', releasePointer, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', releasePointer, { passive: true });
    canvas.addEventListener('touchcancel', releasePointer, { passive: true });
    motionPreference.addEventListener('change', handleMotionPreference);

    if (source.complete) {
      initialize();
    }

    return () => {
      stopMotionLoop();
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(pointerIdleTimer);
      source.removeEventListener('load', initialize);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', releasePointer);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', releasePointer);
      canvas.removeEventListener('touchcancel', releasePointer);
      motionPreference.removeEventListener('change', handleMotionPreference);
    };
  }, []);

  return (
    <section className={`hero ${styles.hero}`} aria-label="Interactive MAIR ASCII logo">
      <canvas
        id="grid"
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Move the pointer across the MAIR logo to scatter its ASCII characters"
      >
        Interactive MAIR ASCII logo
      </canvas>
      <div className={`logo ${styles.logo}`} aria-hidden="true">
        <img
          id="source"
          ref={sourceRef}
          src="./MAIR_logo.png"
          alt=""
          draggable={false}
        />
      </div>
    </section>
  );
}
