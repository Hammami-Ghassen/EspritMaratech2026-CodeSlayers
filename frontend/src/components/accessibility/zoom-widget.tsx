'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useZoom } from '@/hooks/use-zoom';

/* ────────────────────────────────────────────
 *  Zoom Accessibility Widget
 *  ──────────────────────────────────────────
 *  • Floating magnifying-glass button (above the TTS button)
 *  • Expands into a glassmorphism control panel with:
 *      – zoom level arc / percentage
 *      – +/- buttons, reset, preset tabs
 *      – "Lens Mode" toggle (magnifying glass follows cursor)
 *  • Applies real CSS zoom via html font-size
 *  • Persists preference in localStorage
 * ──────────────────────────────────────────── */

export function ZoomAccessibilityWidget() {
  const {
    zoom,
    isOpen,
    isLensActive,
    lensPower,
    mousePos,
    levels,
    toggle,
    close,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleLens,
    setLensPower,
  } = useZoom();

  const panelRef = useRef<HTMLDivElement>(null);

  /* Close panel on click outside */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  /* ── Arc progress for the gauge ── */
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const minZoom = 80;
  const maxZoom = 200;
  const progress = (zoom - minZoom) / (maxZoom - minZoom);
  const dashOffset = circumference * (1 - progress * 0.75); // 270° arc

  return (
    <>
      {/* ═══════════════════ MAIN BUTTON ═══════════════════ */}
      <button
        data-zoom-widget
        onClick={toggle}
        aria-label={isOpen ? 'Fermer le contrôle de zoom' : 'Ouvrir le contrôle de zoom'}
        aria-expanded={isOpen}
        title="Zoom accessibilité"
        className={`
          fixed bottom-24 left-6 z-[9998] flex h-14 w-14 items-center justify-center
          rounded-full shadow-xl transition-all duration-300
          hover:scale-110 focus:outline-none focus-visible:ring-4
          focus-visible:ring-sky-400 focus-visible:ring-offset-2
          ${isOpen ? 'rotate-45 scale-110' : ''}
          ${isLensActive ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
        `}
        style={{
          background: isLensActive
            ? 'linear-gradient(135deg, #f5820b, #e06b00)'
            : 'linear-gradient(135deg, #135bec, #0d47d1)',
        }}
      >
        {/* Magnifying glass icon */}
        <svg
          className="h-6 w-6 text-white transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
          {/* + inside lens when closed, × lines when open */}
          {!isOpen && (
            <>
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1.8" />
              <line x1="11" y1="8" x2="11" y2="14" strokeWidth="1.8" />
            </>
          )}
        </svg>

        {/* Zoom % badge */}
        {zoom !== 125 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow">
            {zoom}%
          </span>
        )}
      </button>

      {/* ═══════════════════ CONTROL PANEL ═══════════════════ */}
      <div
        ref={panelRef}
        data-zoom-widget
        className={`
          fixed bottom-[10.5rem] left-6 z-[9998]
          transition-all duration-300 ease-out origin-bottom-left
          ${isOpen
            ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
            : 'pointer-events-none scale-75 opacity-0 translate-y-4'
          }
        `}
        role="dialog"
        aria-label="Contrôle de zoom"
      >
        <div className="relative w-64 overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
          {/* ── Header ── */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Zoom
            </h3>
            <button
              onClick={close}
              className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Fermer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Circular Gauge ── */}
          

          {/* ── +/- Controls ── */}
          <div className="mb-3 flex items-center justify-center gap-3">
            <button
              onClick={zoomOut}
              disabled={zoom <= 80}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600 transition hover:bg-blue-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-400"
              aria-label="Réduire le zoom"
            >
              −
            </button>

            <button
              onClick={resetZoom}
              className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 text-xs font-bold text-white shadow-md transition hover:shadow-lg active:scale-95 dark:from-blue-600 dark:to-blue-700"
              aria-label="Réinitialiser le zoom"
            >
              125%
            </button>

            <button
              onClick={zoomIn}
              disabled={zoom >= 200}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600 transition hover:bg-blue-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-400"
              aria-label="Augmenter le zoom"
            >
              +
            </button>
          </div>

          {/* ── Preset Pills ── */}
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setZoom(level)}
                className={`
                  rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200
                  ${zoom === level
                    ? 'bg-gradient-to-r from-[#135bec] to-[#2563eb] text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }
                `}
                aria-label={`Zoom ${level}%`}
                aria-pressed={zoom === level}
              >
                {level}%
              </button>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="mb-3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />

          {/* ── Lens Mode Toggle ── */}
          <button
            onClick={toggleLens}
            className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
              ${isLensActive
                ? 'bg-orange-50 ring-1 ring-orange-300 dark:bg-orange-900/20 dark:ring-orange-700'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800'
              }
            `}
            aria-pressed={isLensActive}
          >
            <div className={`
              flex h-8 w-8 items-center justify-center rounded-lg transition-colors
              ${isLensActive
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }
            `}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className={`text-xs font-bold ${isLensActive ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                Loupe magique
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Survoler pour agrandir
              </p>
            </div>
            {/* Toggle pill */}
            <div className={`
              relative h-5 w-9 rounded-full transition-colors duration-200
              ${isLensActive ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}
            `}>
              <div className={`
                absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
                ${isLensActive ? 'translate-x-4' : 'translate-x-0.5'}
              `} />
            </div>
          </button>

          {/* Lens power slider – only when lens is active */}
          {isLensActive && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 dark:bg-orange-900/20">
              <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">×{lensPower.toFixed(1)}</span>
              <input
                type="range"
                min="1.5"
                max="4"
                step="0.5"
                value={lensPower}
                onChange={(e) => setLensPower(Number(e.target.value))}
                className="zoom-range-slider h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-orange-200 accent-orange-500 dark:bg-orange-800"
                aria-label="Puissance de la loupe"
              />
              <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">×4</span>
            </div>
          )}

          {/* ── Footer hint ── */}
          <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-300 px-1 py-0.5 text-[9px] dark:border-gray-600">Échap</kbd> pour fermer
          </p>
        </div>
      </div>

      {/* ═══════════════════ MAGNIFYING LENS ═══════════════════ */}
      {isLensActive && <MagnifyingLens mousePos={mousePos} power={lensPower} />}
    </>
  );
}

/* ────────────────────────────────────────────
 *  Magnifying Lens Component
 *  ──────────────────────────────────────────
 *  A circular spotlight + magnifier that follows the cursor.
 *  • Darkens the page around the cursor (focus effect)
 *  • Shows the cursor area magnified inside a glass lens
 *  • Uses a live-cloned snapshot of the page body (cloned once,
 *    re-cloned on scroll/resize, translated every frame)
 * ──────────────────────────────────────────── */
function MagnifyingLens({
  mousePos,
  power,
}: {
  mousePos: { x: number; y: number };
  power: number;
}) {
  const LENS_SIZE = 200;
  const HALF = LENS_SIZE / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  /* ── Clone body into the lens once, re-clone on scroll ── */
  useEffect(() => {
    const target = cloneRef.current;
    if (!target) return;

    const cloneBody = () => {
      setScrollY(window.scrollY);
      const body = document.body;
      const clone = body.cloneNode(true) as HTMLElement;
      clone.style.cssText =
        'position:absolute;top:0;left:0;width:100%;margin:0;padding:0;min-height:auto;pointer-events:none;';
      // Remove our own zoom widget + lens to avoid recursion
      clone.querySelectorAll('[data-zoom-widget],[data-zoom-lens]').forEach((n) => n.remove());
      clone.querySelectorAll('script').forEach((n) => n.remove());
      target.innerHTML = '';
      target.appendChild(clone);
    };

    cloneBody();

    // Refresh clone on scroll or resize (debounced)
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(cloneBody, 200);
    };

    window.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, []);

  const isVisible = mousePos.x > 0 && mousePos.y > 0;

  /* Compute the translation so the mouse position appears at center of the lens */
  const pageX = mousePos.x;
  const pageY = mousePos.y + (typeof window !== 'undefined' ? window.scrollY : 0);
  const tx = -(pageX * power) + HALF;
  const ty = -(pageY * power) + HALF + scrollY * power;

  return (
    <>
      {/* ── Spotlight overlay (dims everything except cursor area) ── */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 120px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.35) 100%)`,
          opacity: isVisible ? 1 : 0,
        }}
        aria-hidden
      />

      {/* ── Lens circle ── */}
      <div
        ref={containerRef}
        data-zoom-lens
        className="pointer-events-none fixed z-[10000]"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          left: mousePos.x - HALF,
          top: mousePos.y - HALF,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
        aria-hidden
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              '0 0 30px 8px rgba(19,91,236,0.3), 0 0 60px 15px rgba(19,91,236,0.1), inset 0 0 0 3px rgba(19,91,236,0.5)',
            borderRadius: '50%',
          }}
        />

        {/* Clipped magnified view */}
        <div className="absolute inset-[3px] overflow-hidden rounded-full" style={{ background: 'var(--background)' }}>
          <div
            ref={cloneRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100vw',
              transform: `scale(${power}) translate(${tx / power}px, ${(ty - scrollY * power) / power}px)`,
              transformOrigin: '0 0',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Glass reflection highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 45%, rgba(255,255,255,0.06) 100%)',
          }}
        />

        {/* Crosshair */}
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="20" height="20" viewBox="0 0 20 20">
          <line x1="10" y1="3" x2="10" y2="8" stroke="#135bec" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <line x1="10" y1="12" x2="10" y2="17" stroke="#135bec" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <line x1="3" y1="10" x2="8" y2="10" stroke="#135bec" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <line x1="12" y1="10" x2="17" y2="10" stroke="#135bec" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <circle cx="10" cy="10" r="1.5" fill="#135bec" opacity="0.3" />
        </svg>

        {/* Power badge */}
       
      </div>
    </>
  );
}
