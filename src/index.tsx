import React, { useState, useEffect, useRef } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import './style.css'; 

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const getMonthValue = (monthIndex: number, year: number): string => {
  const month = (monthIndex + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

const MonthGrid = ({ year, onSelect, selected }: any) => {
  return (
    <div className="month-grid">
      {/* Header with year and navigation arrows < Year >*/}
      <div className="month-grid-header">
        {/* Previous year button */}
        <button
          onClick={() => onSelect('yearChange', year - 1)}
          aria-label="Previous year"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        {/* Current year display */}
        <div className="month-grid-title">{year}</div>
        {/* Next year button */}
        <button
          onClick={() => onSelect('yearChange', year + 1)}
          aria-label="Next year"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      {/* Grid of month buttons */}
      <div className="month-buttons">
        {months.map((month, idx) => {
          const val = getMonthValue(idx, year);
          const isSelected = selected === val;
          return (
            <button
              key={month}
              className={`month-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect('monthSelect', idx)}
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
  const [showPicker, setShowPicker] = useState(false);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear());


  const [startMonth, setStartMonth] = Retool.useStateString({ name: 'startMonth' });
  const [endMonth, setEndMonth] = Retool.useStateString({ name: 'endMonth' });

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelRef, inputRef]);

  const formatMonthYear = (dateString: string): string => {
    // will return Jan 2025 for example if dateString is '2025-01'
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    if (!year || !month) return '';
    const monthName = months[parseInt(month) - 1]; // month is 1-indexed in string
    return `${monthName} ${year}`;
  };

  const handleSelect = (type: 'start' | 'end') => (action: string, value: any) => {
    if (action === 'yearChange') {
      type === 'start' ? setStartYear(value) : setEndYear(value);
    } else if (action === 'monthSelect') {
      const selectedValue = getMonthValue(value, type === 'start' ? startYear : endYear);

      if (type === 'start') {
        setStartMonth(selectedValue);
        // If startMonth is selected, ensure endYear is at least startYear
        // and endMonth is not before startMonth if years are equal
        if (endMonth) {
          if (selectedValue > endMonth) { // If new start is after current end, clear end
            setEndMonth(''); // Clear endMonth if it's now before startMonth
          }
        }
        // Ensure end year doesn't fall behind start year
        if (parseInt(selectedValue.substring(0,4)) > endYear) { 
          // If new start year is greater than current end year
          setEndYear(parseInt(selectedValue.substring(0,4)));
        } else if (endYear === parseInt(selectedValue.substring(0,4))) { 
          // If years are same, but month might be an issue
            if (endMonth && selectedValue > endMonth) {
                setEndMonth(''); // Clear end if start becomes later in same year
            }
        }

      } else { // type === 'end'
        if (startMonth && selectedValue < startMonth) {
            setEndMonth(startMonth); 
            // Auto-correct to startMonth if an earlier month is clicked
        } else {
            setEndMonth(selectedValue);
        }
      }

      // Automatically close the picker if both start and end months are selected
      // Only close when setting the *second* part of the range and it's valid.
      const newStartMonth = type === 'start' ? selectedValue : startMonth;
      const newEndMonth = type === 'end' ? selectedValue : endMonth;

      if (newStartMonth && newEndMonth && newStartMonth <= newEndMonth) {
          setShowPicker(false);
      }
    }
  };

  const displayedValue = (startMonth && endMonth)
    ? `${formatMonthYear(startMonth)} — ${formatMonthYear(endMonth)}`
    : '';

  return (
    <div className="month-picker-container">
      <input
        ref={inputRef}
        readOnly
        onClick={() => setShowPicker(!showPicker)}
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
        >

          <MonthGrid
            year={startYear}
            selected={startMonth}
            onSelect={handleSelect('start')}
          />

          <MonthGrid
            year={endYear}
            selected={endMonth}
            onSelect={handleSelect('end')}
          />
        </div>
      )}
    </div>
  );
};


export default MonthRangePicker;
