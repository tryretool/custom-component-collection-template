import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import "../style.css";
import { MonthGrid } from './MonthGrid';
import { getMonthValue, parseMonthValue, formatMonthYear } from '../utils/dateHelpers';

export const MonthRangePicker = () => {
//   Retool.useComponentSettings({
//     defaultHeight: 100, 
//     defaultWidth: 100, 
//   })
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
        setBaseYear(year); 
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