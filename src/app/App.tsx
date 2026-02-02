import React, { useState, useEffect } from 'react';
import { TransparentOverlay } from '@/app/components/TransparentOverlay';
import { SettingsControl } from '@/app/components/SettingsControl';
import { MinimizedButton } from '@/app/components/MinimizedButton';

declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
    };
  }
}

export default function App() {
  // UI State
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Engine State
  const [engineStatus, setEngineStatus] = useState<'idle' | 'analyzing' | 'ready'>('analyzing');
  const [currentScore, setCurrentScore] = useState(45); // centipawns
  const [aiDepth, setAiDepth] = useState(20);

  // Settings
  const [autoMoveEnabled, setAutoMoveEnabled] = useState(false);
  const [humanDelay, setHumanDelay] = useState(1000);

  // Mock data for demonstration
  const bestMove = 'Nf3';
  const topMoves = [
    { notation: 'Nf3', evaluation: 45, isBest: true },
    { notation: 'e4', evaluation: 32, centipawnLoss: 13 },
    { notation: 'd4', evaluation: 28, centipawnLoss: 17 },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+H: Toggle HUD visibility
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setIsHudVisible((prev) => !prev);
      }

      // Ctrl+S: Toggle settings
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    // Transparent background for Electron
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-transparent">

      {/* Board Calibration Frame - Helps user align with chess.com */}
      <div className="absolute w-[640px] h-[640px] border-4 border-dashed border-cyan-500/30 pointer-events-none rounded-lg"></div>

      {/* Transparent Overlay UI */}
      {isHudVisible && (
        <TransparentOverlay
          engineStatus={engineStatus}
          depth={aiDepth}
          nodesPerSecond={1250000}
          score={currentScore}
          bestMove={bestMove}
          topMoves={topMoves}
          autoMoveEnabled={autoMoveEnabled}
          onAutoMoveChange={setAutoMoveEnabled}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onMinimizeClick={() => setIsHudVisible(false)}
        />
      )}

      {/* Minimized Button */}
      {!isHudVisible && (
        <MinimizedButton
          onClick={() => setIsHudVisible(true)}
          onSettingsClick={() => {
            setIsSettingsOpen(true);
            setIsHudVisible(true);
          }}
        />
      )}

      {/* Settings Modal (outside main container) */}
      <SettingsControl
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoMoveEnabled={autoMoveEnabled}
        onAutoMoveChange={setAutoMoveEnabled}
        aiDepth={aiDepth}
        onAiDepthChange={setAiDepth}
        humanDelay={humanDelay}
        onHumanDelayChange={setHumanDelay}
      />
    </div>
  );
}