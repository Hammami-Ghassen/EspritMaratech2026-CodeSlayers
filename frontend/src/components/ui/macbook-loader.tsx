'use client';

import React from 'react';

interface MacbookLoaderProps {
  /** Optional message below the loader */
  message?: string;
}

export function MacbookLoader({ message }: MacbookLoaderProps) {
  return (
    <div className="macbook-overlay" role="status" aria-label="Loading">
      <div className="macbook-loader-container">
        <div className="macbook">
          <div className="macbook__topBord">
            <div className="macbook__display">
              <div className="macbook__load" />
            </div>
          </div>
          <div className="macbook__underBord">
            <div className="macbook__keybord">
              <div className="keybord">
                <div className="keybord__touchbar" />
                <ul className="keybord__keyBox">
                  {Array.from({ length: 13 }, (_, i) => (
                    <li key={i} className={`keybord__key key--${String(i + 1).padStart(2, '0')}`} />
                  ))}
                </ul>
                <ul className="keybord__keyBox--under">
                  {Array.from({ length: 11 }, (_, i) => (
                    <li key={i} className={`keybord__key key--${String(i + 14).padStart(2, '0')}`} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {message && (
          <p className="mt-6 text-sm font-medium text-white/80 animate-pulse">{message}</p>
        )}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
