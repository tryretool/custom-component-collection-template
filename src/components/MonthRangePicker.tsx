import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import "../style.css";
import { MonthGrid } from './MonthGrid';
import { getMonthValue, parseMonthValue, formatMonthYear } from '../utils/dateHelpers';

export const MonthRangePicker = () => {
  const [startMonth, setStartMonth] = Retool.useStateString({ name: 'startMonth', initialValue: '' });
  const [endMonth, setEndMonth] = Retool.useStateString({ name: 'endMonth', initialValue: '' });

  const [isInitialDefaultSet, setIsInitialDefaultSet] = useState(false);
    Retool.useComponentSettings({
    defaultHeight: 35,
    defaultWidth: 7,
  })

  useEffect(() => {
    if (!isInitialDefaultSet && startMonth === '' && endMonth === '') {
      setIsInitialDefaultSet(true);
    }
  }, [isInitialDefaultSet, startMonth, endMonth]);

  const [baseYear, setBaseYear] = useState(new Date().getFullYear());
  const [selectingState, setSelectingState] = useState<'start' | 'end'>('start');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Define an event callback for month selection
  const onMonthSelect = Retool.useEventCallback({ name: "monthSelect" });

  const handleYearChange = useCallback((newYear: number) => {
    // This function is called when clicking the year navigation arrows
    setBaseYear(newYear);
  }, []);

  const handleMonthClick = useCallback((monthIdx: number, year: number) => {
    const clickedMonthValue = getMonthValue(monthIdx, year);
    setHoveredMonth(null);

    if (selectingState === 'start') {
      setStartMonth(clickedMonthValue);
      setEndMonth('');
      setSelectingState('end');

      // IMPORTANT: ONLY update baseYear if the clicked month is in the LEFT calendar's year
      // OR if the selected year is significantly different and needs to be the new baseYear.
      if (year === baseYear) { // Clicked on the left calendar
        setBaseYear(year); // Keep baseYear as is
      } else if (year === baseYear + 1) { // Clicked on the right calendar
        // We do NOT change baseYear here. The displayed years (baseYear and baseYear + 1)
        // should remain stable after a selection from the right calendar.
      } else {
        setBaseYear(year); 
      }

    } else { // selectingState === 'end'
      if (startMonth !== '') {
        if (clickedMonthValue < startMonth) {
          // If clicked month is earlier than the current start, reset the range
          setStartMonth(clickedMonthValue);
          setEndMonth('');
          setSelectingState('end');

          // If the new start month is in a different year, adjust baseYear
          const { year: clickedYear } = parseMonthValue(clickedMonthValue);
          if (clickedYear !== null && clickedYear !== baseYear) {
            setBaseYear(clickedYear); // Only change baseYear if the new start dictates it
          }
        } else {
          // If clicked month is after or equal to the start month, set it as end.
          setEndMonth(clickedMonthValue);
          setSelectingState('start'); // Reset for next selection
        }
      } else {
        // Fallback if startMonth somehow became null
        setStartMonth(clickedMonthValue);
        setEndMonth('');
        setSelectingState('end');
      }
    }

    // Trigger the event callback to notify Retool of the selection
    onMonthSelect();
  }, [selectingState, startMonth, baseYear, setStartMonth, setEndMonth, setBaseYear, onMonthSelect]);

  const handleMonthMouseEnter = useCallback((monthIdx: number, year: number) => {
    const hoveredValue = getMonthValue(monthIdx, year);
    setHoveredMonth(hoveredValue);
  }, []);

  const handleMonthMouseLeave = useCallback(() => {
    setHoveredMonth(null);
  }, []);

  const displayedValue = startMonth !== ''
    ? `${formatMonthYear(startMonth)} —${endMonth !== '' ? ` ${formatMonthYear(endMonth)}` : ''}`
    : '';

  const clearSelection = () => {
    setStartMonth('');
    setEndMonth('');
    setSelectingState('start');
  };

  return (
    <div className="month-picker-container">
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
    </div>
  );
};