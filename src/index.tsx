import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import './style.css';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper to format month toYYYY-MM string
const getMonthValue = (monthIndex: number, year: number): string => {
  const month = (monthIndex + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

// Helper to parseYYYY-MM string to Month and Year
const parseMonthValue = (monthValue: string | null) => {
  if (!monthValue) return { year: null, monthIndex: null };
  const [yearStr, monthStr] = monthValue.split('-');
  return { year: parseInt(yearStr), monthIndex: parseInt(monthStr) - 1 };
};

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

const MonthGrid = ({
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

export const MonthRangePicker = () => {
  const [startMonth, setStartMonth] = Retool.useStateString({ name: 'startMonth', initialValue: '' });
  const [endMonth, setEndMonth] = Retool.useStateString({ name: 'endMonth', initialValue: '' });

  const [isInitialDefaultSet, setIsInitialDefaultSet] = useState(false);

  useEffect(() => {
    if (!isInitialDefaultSet && startMonth === '' && endMonth === '') {
      const today = new Date();
      const currentMonthIndex = today.getMonth();
      const currentYear = today.getFullYear();

      const defaultMonthDate = new Date(currentYear, currentMonthIndex - 1, 1);
      const calculatedDefaultMonthValue = getMonthValue(defaultMonthDate.getMonth(), defaultMonthDate.getFullYear());

      setStartMonth(calculatedDefaultMonthValue);
      setEndMonth(calculatedDefaultMonthValue);
      setBaseYear(defaultMonthDate.getFullYear());
      setIsInitialDefaultSet(true);
    }
  }, [isInitialDefaultSet, startMonth, endMonth, setStartMonth, setEndMonth]);

  const [baseYear, setBaseYear] = useState(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [selectingState, setSelectingState] = useState<'start' | 'end'>('start');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showPicker) return;

      const clickedElement = event.target as Node;

      const clickedInsideInput = inputRef.current && inputRef.current.contains(clickedElement);
      const clickedInsidePanel = panelRef.current && panelRef.current.contains(clickedElement);

      if (!clickedInsideInput && !clickedInsidePanel) {
        setShowPicker(false);
        setHoveredMonth(null);
        if (startMonth !== '' && endMonth === null) {
            setSelectingState('start');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker, startMonth, endMonth]);

  // NEW LOGIC: Only update baseYear if startMonth changes,
  // or if explicitly navigated using arrows.
  // We remove the useEffect that automatically updated baseYear based on startMonth for all cases,
  // and manage it within handleMonthClick more precisely.
  // The initial useEffect for default setting handles the first baseYear.

  const formatMonthYear = (dateString: string | null): string => {
    if (!dateString || dateString === '') return '';
    const [year, month] = dateString.split('-');
    if (!year || !month) return '';
    const monthName = months[parseInt(month) - 1];
    return `${monthName} ${year}`;
  };

  const handleYearChange = useCallback((newYear: number) => {
    // This function is called when clicking the year navigation arrows
    setBaseYear(newYear);
  }, []);

  const handleMonthClick = useCallback((monthIdx: number, year: number) => {
    const clickedMonthValue = getMonthValue(monthIdx, year);
    setHoveredMonth(null);

    if (selectingState === 'start') {
      setStartMonth(clickedMonthValue);
      setEndMonth(null);
      setSelectingState('end');

      // IMPORANT: ONLY update baseYear if the clicked month is in the LEFT calendar's year
      // OR if the selected year is significantly different and needs to be the new baseYear.
      // If clicked on the right calendar, we generally DON'T want the baseYear to shift.
      if (year === baseYear) { // Clicked on the left calendar
        setBaseYear(year); // Keep baseYear as is
      } else if (year === baseYear + 1) { // Clicked on the right calendar
        // We do NOT change baseYear here. The displayed years (baseYear and baseYear + 1)
        // should remain stable after a selection from the right calendar.
        // The selection just updates startMonth/endMonth.
        // If we change baseYear here, the left calendar will become the old right one, causing the shift.
      } else {
        // Fallback for unexpected year clicks, or if you want to jump to a far-off year
        // This scenario might need re-evaluation based on desired UX for large jumps.
        // For now, let's keep it simple and assume selection mostly happens in visible years.
        setBaseYear(year); // Adjust baseYear if a very different year is clicked
      }

    } else { // selectingState === 'end'
      if (startMonth !== '') {
        if (clickedMonthValue < startMonth) {
          // If clicked month is earlier than the current start, reset the range
          setStartMonth(clickedMonthValue);
          setEndMonth(null);
          setSelectingState('end');

          // If the new start month is in a different year, adjust baseYear
          const { year: clickedYear } = parseMonthValue(clickedMonthValue);
          if (clickedYear !== null && clickedYear !== baseYear) {
            setBaseYear(clickedYear); // Only change baseYear if the new start dictates it
          }
        } else {
          // If clicked month is after or equal to the start month, set it as end.
          setEndMonth(clickedMonthValue);
          setShowPicker(false);
          setSelectingState('start'); // Reset for next selection
        }
      } else {
        // Fallback if startMonth somehow became null
        setStartMonth(clickedMonthValue);
        setEndMonth(null);
        setSelectingState('end');
      }
    }
  }, [selectingState, startMonth, baseYear, setStartMonth, setEndMonth, setBaseYear]);

  const handleMonthMouseEnter = useCallback((monthIdx: number, year: number) => {
    const hoveredValue = getMonthValue(monthIdx, year);
    setHoveredMonth(hoveredValue);
  }, []);

  const handleMonthMouseLeave = useCallback(() => {
    setHoveredMonth(null);
  }, []);

  const displayedValue = (startMonth !== '' && endMonth !== null && endMonth !== '')
    ? `${formatMonthYear(startMonth)} — ${formatMonthYear(endMonth)}`
    : '';

  return (
    <div className="month-picker-container">
      <input
        ref={inputRef}
        readOnly
        onClick={() => {
          setShowPicker(!showPicker);
          setHoveredMonth(null);

          if (startMonth !== '' && endMonth !== null && endMonth !== '') {
            setSelectingState('start');
          } else if (startMonth !== '' && (endMonth === null || endMonth === '')) {
            setSelectingState('end');
          } else {
            setSelectingState('start');
          }
        }}
        value={displayedValue}
        placeholder="Select month range"
        className="month-picker-input"
        aria-haspopup="dialog"
        aria-expanded={showPicker}
        aria-label="Month range selector"
      />

      {showPicker && (
        <div
          ref={panelRef}
          className="month-picker-panel"
          role="dialog"
          aria-modal="true"
          onMouseLeave={handleMonthMouseLeave}
        >
          <MonthGrid
            year={baseYear}
            onYearChange={handleYearChange}
            onMonthClick={handleMonthClick}
            selectedStartMonth={startMonth}
            selectedEndMonth={endMonth}
            hoveredMonth={hoveredMonth}
            showPrevYearArrow={true}
            showNextYearArrow={false}
            onMonthMouseEnter={handleMonthMouseEnter}
            onMonthMouseLeave={handleMonthMouseLeave}
            isPickingStart={selectingState === 'start'}
          />

          <MonthGrid
            year={baseYear + 1}
            onYearChange={handleYearChange}
            onMonthClick={handleMonthClick}
            selectedStartMonth={startMonth}
            selectedEndMonth={endMonth}
            hoveredMonth={hoveredMonth}
            showPrevYearArrow={false}
            showNextYearArrow={true}
            onMonthMouseEnter={handleMonthMouseEnter}
            onMonthMouseLeave={handleMonthMouseLeave}
            isPickingStart={selectingState === 'start'}
          />
        </div>
      )}
    </div>
  );
};

export default MonthRangePicker;