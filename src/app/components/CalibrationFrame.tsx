import React, { useState, useRef, useEffect } from 'react';

declare global {
    interface Window {
        electronAPI?: {
            setIgnoreMouseEvents: (ignore: boolean) => void;
        };
    }
}

interface CalibrationFrameProps {
    onBoundsChange?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

export function CalibrationFrame({ onBoundsChange }: CalibrationFrameProps) {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 640, height: 640 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const frameRef = useRef<HTMLDivElement>(null);

    const setIgnore = (ignore: boolean) => {
        if (window.electronAPI) {
            // console.log('CalibrationFrame: setIgnore', ignore);
            window.electronAPI.setIgnoreMouseEvents(ignore);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking the border/header area, not resize handles
        const target = e.target as HTMLElement;
        if (target.classList.contains('resize-handle')) return;

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        setIgnore(false); // Enable mouse events for dragging
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setIgnore(false); // Enable mouse events for resizing
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isResizing) {
                const newWidth = Math.max(200, e.clientX - position.x);
                const newHeight = Math.max(200, e.clientY - position.y);
                setSize({ width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            if (isDragging || isResizing) {
                setIsDragging(false);
                setIsResizing(false);
                // Important: When we stop interacting, we don't necessarily want to ignore immediately
                // if we are still hovering. But for safety/click-through behavior:
                // Let component's onMouseEnter/Leave handle it.
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, position]);

    return (
        <div
            ref={frameRef}
            className="absolute border-4 border-dashed border-cyan-500/50 rounded-lg group"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                cursor: isDragging ? 'grabbing' : 'move',
                pointerEvents: 'auto'
            }}
            onMouseEnter={() => setIgnore(false)}
            onMouseLeave={() => {
                if (!isDragging && !isResizing) setIgnore(true);
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Label */}
            <div className="absolute -top-8 left-0 text-cyan-500/80 text-xs font-mono bg-slate-900/80 px-2 py-1 rounded">
                Drag to Align ({Math.round(size.width)}x{Math.round(size.height)})
            </div>

            {/* Resize Handle (Bottom Right) */}
            <div
                className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-cyan-500/50 cursor-se-resize rounded-tl-lg hover:bg-cyan-400"
                onMouseDown={handleResizeStart}
            />
        </div>
    );
}
