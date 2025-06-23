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
  onMonthClick: (monthIdx: number, year: number) => void;
  selectedStartMonth: string | null;
  selectedEndMonth: string | null;
  hoveredMonth: string | null;
  onMonthMouseEnter: (monthIdx: number, year: number) => void;
  onMonthMouseLeave: () => void;
  isPickingStart: boolean;
}

const MonthGrid = ({
  year,
  onMonthClick,
  selectedStartMonth,
  selectedEndMonth,
  hoveredMonth,
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
      {/* Removed arrows from here */}
      <div className="month-grid-header">
        {/* Only display the year here */}
        <div className="month-grid-title">{year}</div>
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
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
  }, [panelRef, inputRef, startMonth, endMonth]);

  useEffect(() => {
    if (startMonth !== '') {
      const { year } = parseMonthValue(startMonth);
      if (year !== null) {
        setBaseYear(year);
      }
    } else {
      setBaseYear(new Date().getFullYear());
    }
  }, [startMonth]);

  const formatMonthYear = (dateString: string | null): string => {
    if (!dateString || dateString === '') return '';
    const [year, month] = dateString.split('-');
    if (!year || !month) return '';
    const monthName = months[parseInt(month) - 1];
    return `${monthName} ${year}`;
  };

  const handleYearChange = useCallback((newYear: number) => {
    setBaseYear(newYear);
  }, []);

  const handleMonthClick = useCallback((monthIdx: number, year: number) => {
    const clickedMonthValue = getMonthValue(monthIdx, year);
    setHoveredMonth(null);

    if (selectingState === 'start') {
      setStartMonth(clickedMonthValue);
      setEndMonth(null);
      setSelectingState('end');

      const { year: clickedYear } = parseMonthValue(clickedMonthValue);
      if (clickedYear !== null && clickedYear !== baseYear) {
        setBaseYear(clickedYear);
      }

    } else { // selectingState === 'end'
      if (startMonth !== '') {
        if (clickedMonthValue < startMonth) {
          setStartMonth(clickedMonthValue);
          setEndMonth(null);
          setSelectingState('end');

          const { year: clickedYear } = parseMonthValue(clickedMonthValue);
          if (clickedYear !== null && clickedYear !== baseYear) {
            setBaseYear(clickedYear);
          }
        } else {
          setEndMonth(clickedMonthValue);
          setShowPicker(false);
          setSelectingState('start');
        }
      } else {
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
          {/* Outer container for arrows and grids */}
          <div className="picker-content-wrapper">
            <button
              onClick={() => handleYearChange(baseYear - 1)}
              aria-label="Previous year"
              className="arrow-button prev-arrow"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            {/* Month Grids */}
            <div className="month-grids-wrapper">
              <MonthGrid
                year={baseYear}
                onMonthClick={handleMonthClick}
                selectedStartMonth={startMonth}
                selectedEndMonth={endMonth}
                hoveredMonth={hoveredMonth}
                onMonthMouseEnter={handleMonthMouseEnter}
                onMonthMouseLeave={handleMonthMouseLeave}
                isPickingStart={selectingState === 'start'}
              />

              <MonthGrid
                year={baseYear + 1}
                onMonthClick={handleMonthClick}
                selectedStartMonth={startMonth}
                selectedEndMonth={endMonth}
                hoveredMonth={hoveredMonth}
                onMonthMouseEnter={handleMonthMouseEnter}
                onMonthMouseLeave={handleMonthMouseLeave}
                isPickingStart={selectingState === 'start'}
              />
            </div>

            <button
              onClick={() => handleYearChange(baseYear + 1)}
              aria-label="Next year"
              className="arrow-button next-arrow"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthRangePicker;