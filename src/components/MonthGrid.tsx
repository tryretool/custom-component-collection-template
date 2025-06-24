import React from 'react';
import {months, getMonthValue, parseMonthValue} from '../utils/dateHelpers';
import "../style.css";

interface MonthGridProps {
  year: number;
  onYearChange: (newYear: number) => void;
  onMonthClick: (monthIdx: number, year: number) => void;
  selectedStartMonth: string | null;
  selectedEndMonth: string | null;
  hoveredMonth: string | null;
  showPrevYearArrow: boolean;
  showNextYearArrow: boolean;
  onMonthMouseEnter: (monthIdx: number, year: number) => void;
  onMonthMouseLeave: () => void;
  isPickingStart: boolean;
}

export const MonthGrid = ({
  year,
  onYearChange,
  onMonthClick,
  selectedStartMonth,
  selectedEndMonth,
  hoveredMonth,
  showPrevYearArrow,
  showNextYearArrow,
  onMonthMouseEnter,
  onMonthMouseLeave,
  isPickingStart
}: MonthGridProps) => {

  const getMonthClass = (monthIdx: number): string => {
    const monthValue = getMonthValue(monthIdx, year);
    let className = 'month-button';

    const hasFullSelection = selectedStartMonth !== '' && selectedEndMonth !== null && selectedEndMonth !== '';
    const isActivelyDragging = !isPickingStart && selectedStartMonth !== '' && hoveredMonth !== null && hoveredMonth !== '';

    // 1. Handle FULLY SELECTED RANGE
    if (hasFullSelection) {
      if (selectedStartMonth === selectedEndMonth && monthValue === selectedStartMonth) {
          className += ' month-single';
      }
      else if ((monthValue > selectedStartMonth && monthValue < selectedEndMonth) ||
               (monthValue < selectedStartMonth && monthValue > selectedEndMonth)) {
          className += ' month-in-range';
      }
      if (monthValue === selectedStartMonth) {
          className += ' month-start';
      }
      if (monthValue === selectedEndMonth) {
          className += ' month-end';
      }
    }

    // 2. Handle ACTIVE DRAGGING/HOVERING FOR END MONTH
    if (isActivelyDragging) {
        const [dragStart, dragEnd] = selectedStartMonth < hoveredMonth
                                        ? [selectedStartMonth, hoveredMonth]
                                        : [hoveredMonth, selectedStartMonth];

        if (monthValue > dragStart && monthValue < dragEnd) {
             className += ' month-hover-range';
        }
        if (monthValue === hoveredMonth) {
            className += ' month-hover-end';
        }
        if (monthValue === selectedStartMonth && monthValue === hoveredMonth) {
            className += ' month-start-hover-end';
        }
    } else if (isPickingStart && hoveredMonth === monthValue) {
        // 3. Handle simple hover when picking the START of a new range
        className += ' month-hover';
    }

    // Ensure selectedStartMonth is always visible as a start point if it exists and no full selection is active
    if (!hasFullSelection && selectedStartMonth !== '' && monthValue === selectedStartMonth) {
        className += ' month-start';
    }

    return className;
  };

  return (
    <div className="month-grid">
      <div className="month-grid-header">
        {showPrevYearArrow && (
          <button
            onClick={() => onYearChange(year - 1)}
            aria-label="Previous year"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        )}
        <div className="month-grid-title">{year}</div>
        {showNextYearArrow && (
          <button
            onClick={() => onYearChange(year + 1)}
            aria-label="Next year"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="month-buttons" onMouseLeave={onMonthMouseLeave}>
        {months.map((month, idx) => {
          return (
            <button
              key={month}
              className={`${getMonthClass(idx)}`}
              onClick={() => onMonthClick(idx, year)}
              onMouseEnter={() => onMonthMouseEnter(idx, year)}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
};