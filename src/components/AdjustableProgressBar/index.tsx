import React, { useState, useRef, useEffect, type FC } from 'react';
import { Retool } from '@tryretool/custom-component-support';

export const AdjustableProgressBar: FC = () => {
    const [value, setValue] = Retool.useStateNumber({
        name: 'value',
        initialValue: 0.30
    });

    const [isDragging, setIsDragging] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const normalizedValue = value > 1 ? value / 100 : value;

    const getProgressColor = (val: number) => {
        if (val <= 25) return '#ef4444';
        if (val <= 75) return '#3b82f6';
        return '#22c55e';
    };

    const updateValue = (clientX: number) => {
        if (!progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();

        let newValue = (clientX - rect.left) / rect.width;

        newValue = Math.min(1, Math.max(0, newValue));

        setValue(Number(newValue.toFixed(2)));
    };

    const handleStart = (
        e: React.MouseEvent | React.TouchEvent
    ) => {
        setIsDragging(true);

        if ('clientX' in e) {
            updateValue(e.clientX);
        } else {
            updateValue(e.touches[0].clientX);
        }
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;

            if ('touches' in e) {
                updateValue(e.touches[0].clientX);
            } else {
                updateValue(e.clientX);
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);

            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    return (
        <div
            style={{
                width: '100%',
                padding: '16px',
                fontFamily: 'Inter, sans-serif',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}
            >
                <div
                    style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: '#f3f4f6',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: getProgressColor(normalizedValue * 100)
                    }}
                >
                    {Math.round(normalizedValue * 100)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div
                ref={progressBarRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                style={{
                    width: '100%',
                    height: '12px',
                    background: '#e5e7eb',
                    borderRadius: '999px',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'visible'
                }}
            >
                {/* Filled area */}
                <div
                    style={{
                        width: `${normalizedValue * 100}%`,
                        height: '100%',
                        background: getProgressColor(normalizedValue * 100),
                        borderRadius: '999px',
                        transition: isDragging
                            ? 'none'
                            : 'all .25s ease'
                    }}
                />

                {/* Thumb */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${normalizedValue * 100}%`,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: `3px solid ${getProgressColor(normalizedValue * 100)}`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                        transition: isDragging
                            ? 'none'
                            : 'all .25s ease',
                        cursor: 'grab',
                        zIndex: 2
                    }}
                />
            </div>
        </div>
    );
};