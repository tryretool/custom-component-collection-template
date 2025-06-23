// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Retool } from '@tryretool/custom-component-support';
// import './style.css';

// const months = [
//   'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
// ];

// // Helper to format month toYYYY-MM string
// const getMonthValue = (monthIndex: number, year: number): string => {
//   const month = (monthIndex + 1).toString().padStart(2, '0');
//   return `${year}-${month}`;
// };

// // Helper to parseYYYY-MM string to Month and Year
// const parseMonthValue = (monthValue: string | null) => {
//   if (!monthValue) return { year: null, monthIndex: null };
//   const [yearStr, monthStr] = monthValue.split('-');
//   return { year: parseInt(yearStr), monthIndex: parseInt(monthStr) - 1 };
// };

// interface MonthGridProps {
//   year: number;
//   onYearChange: (newYear: number) => void;
//   onMonthClick: (monthIdx: number, year: number) => void;
//   selectedStartMonth: string | null;
//   selectedEndMonth: string | null;
//   hoveredMonth: string | null;
//   showPrevYearArrow: boolean;
//   showNextYearArrow: boolean;
//   onMonthMouseEnter: (monthIdx: number, year: number) => void;
//   onMonthMouseLeave: () => void;
//   isPickingStart: boolean; // New prop to indicate if user is picking start of a new range
// }

// const MonthGrid = ({
//   year,
//   onYearChange,
//   onMonthClick,
//   selectedStartMonth,
//   selectedEndMonth,
//   hoveredMonth,
//   showPrevYearArrow,
//   showNextYearArrow,
//   onMonthMouseEnter,
//   onMonthMouseLeave,
//   isPickingStart // Use this prop to control hover behavior correctly
// }: MonthGridProps) => {

//   const getMonthClass = (monthIdx: number): string => {
//     const monthValue = getMonthValue(monthIdx, year);
//     let className = 'month-button';

//     // True if a start AND end month are selected (completed range)
//     const hasFullSelection = selectedStartMonth !== null && selectedEndMonth !== null;

//     // True if only startMonth is selected AND we are currently picking the end month (i.e., dragging/hovering)
//     // This state should ONLY be active when isPickingStart is false (meaning selectingState === 'end')
//     const isActivelyDragging = !isPickingStart && selectedStartMonth !== null && hoveredMonth !== null;

//     if (hasFullSelection) {
//       // Logic for a completed, persistent selection (shown when picker is open or closed)
//       if (selectedStartMonth === selectedEndMonth && monthValue === selectedStartMonth) {
//           className += ' month-single';
//       }
//       // Range fill (handles both forward and reverse selection across years)
//       else if ((monthValue > selectedStartMonth && monthValue < selectedEndMonth) ||
//                (monthValue < selectedStartMonth && monthValue > selectedEndMonth)) {
//           className += ' month-in-range';
//       }
//       // Start month
//       if (monthValue === selectedStartMonth) {
//           className += ' month-start';
//       }
//       // End month
//       if (monthValue === selectedEndMonth) {
//           className += ' month-end';
//       }
//     }

//     // Now, apply hover effects *on top* of existing selections OR for a fresh selection
//     if (isActivelyDragging) {
//         // If actively dragging, prioritize the hover range and hover-end
//         const [dragStart, dragEnd] = selectedStartMonth < hoveredMonth
//                                         ? [selectedStartMonth, hoveredMonth]
//                                         : [hoveredMonth, selectedStartMonth];

//         // Hover range fill
//         if (monthValue > dragStart && monthValue < dragEnd) {
//             // If it's part of an existing full selection, don't overwrite its in-range class,
//             // just add hover-range if it's not already start/end
//             if (!(monthValue === selectedStartMonth || monthValue === selectedEndMonth)) {
//                  className += ' month-hover-range';
//             }
//         }
//         // Hovered end month
//         if (monthValue === hoveredMonth) {
//             className += ' month-hover-end';
//         }
//         // If the hovered month is also the start month, it remains month-start, but also gets hover-end
//         if (monthValue === selectedStartMonth && monthValue === hoveredMonth) {
//             className += ' month-start-hover-end'; // Custom class for when start and hover-end are same
//         }
//     } else if (isPickingStart && hoveredMonth === monthValue) {
//         // When picking the *start* of a new range, only highlight the hovered month
//         className += ' month-hover'; // Generic hover for unselected months
//     }


//     return className;
//   };

//   return (
//     <div className="month-grid">
//       <div className="month-grid-header">
//         {showPrevYearArrow && (
//           <button
//             onClick={() => onYearChange(year - 1)}
//             aria-label="Previous year"
//           >
//             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
//             </svg>
//           </button>
//         )}
//         <div className="month-grid-title">{year}</div>
//         {showNextYearArrow && (
//           <button
//             onClick={() => onYearChange(year + 1)}
//             aria-label="Next year"
//           >
//             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//             </svg>
//           </button>
//         )}
//       </div>

//       <div className="month-buttons" onMouseLeave={onMonthMouseLeave}>
//         {months.map((month, idx) => {
//           return (
//             <button
//               key={month}
//               className={`${getMonthClass(idx)}`}
//               onClick={() => onMonthClick(idx, year)}
//               onMouseEnter={() => onMonthMouseEnter(idx, year)}
//             >
//               {month}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export const MonthRangePicker = () => {
//   // Fix: Use an empty string '' as the initialValue to satisfy Retool's literal requirement.
//   // We will set the actual default dynamically in useEffect.
//   const [startMonth, setStartMonth] = Retool.useStateString({ name: 'startMonth', initialValue: '' });
//   const [endMonth, setEndMonth] = Retool.useStateString({ name: 'endMonth', initialValue: '' });

//   const [isInitialDefaultSet, setIsInitialDefaultSet] = useState(false);

//   // Effect to set the "current month - 1" default ONCE after initial mount.
//   useEffect(() => {
//     // Check if the Retool states are still their initial empty string values.
//     // If they are, it means no external value has been set and we should apply our default.
//     if (!isInitialDefaultSet && startMonth === '' && endMonth === '') {
//       const today = new Date();
//       const currentMonthIndex = today.getMonth(); // 0-11
//       const currentYear = today.getFullYear();

//       const defaultMonthDate = new Date(currentYear, currentMonthIndex - 1, 1);
//       const calculatedDefaultMonthValue = getMonthValue(defaultMonthDate.getMonth(), defaultMonthDate.getFullYear());

//       setStartMonth(calculatedDefaultMonthValue);
//       setEndMonth(calculatedDefaultMonthValue);
//       setBaseYear(defaultMonthDate.getFullYear()); // Also set baseYear to match initial selection
//       setIsInitialDefaultSet(true); // Mark that default has been set
//     }
//   }, [isInitialDefaultSet, startMonth, endMonth, setStartMonth, setEndMonth]);


//   const [baseYear, setBaseYear] = useState(new Date().getFullYear()); // Temporarily initialize to current year
//   const [showPicker, setShowPicker] = useState(false);
//   const [selectingState, setSelectingState] = useState<'start' | 'end'>('start');
//   const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

//   const panelRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Handle clicks outside the picker to close it and manage selection state
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
//           inputRef.current && !inputRef.current.contains(event.target as Node)) {
//         setShowPicker(false);
//         setHoveredMonth(null); // Clear hovered month when closing
//         // If a partial selection was in progress (startMonth selected, endMonth is null),
//         // reset selectingState to 'start' so next open starts fresh.
//         // Important: Compare to `null` here, as `setEndMonth(null)` is used when selecting
//         if (startMonth !== '' && endMonth === null) {
//             setSelectingState('start');
//         }
//         // If a full selection exists, the selectingState naturally remains 'start' for next interaction
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [panelRef, inputRef, startMonth, endMonth]);

//   // Adjust baseYear when startMonth changes (e.g., from Retool or new selection)
//   // This useEffect will now run *after* the initial default is set by the first useEffect.
//   useEffect(() => {
//     if (startMonth !== '') { // Check against empty string now
//       const { year } = parseMonthValue(startMonth);
//       if (year !== null) {
//         setBaseYear(year);
//       }
//     } else {
//       // If startMonth becomes empty (e.g., component reset), default baseYear to current year
//       setBaseYear(new Date().getFullYear());
//     }
//   }, [startMonth]);

//   const formatMonthYear = (dateString: string | null): string => {
//     // Updated to handle empty string as initial value
//     if (!dateString || dateString === '') return '';
//     const [year, month] = dateString.split('-');
//     if (!year || !month) return '';
//     const monthName = months[parseInt(month) - 1];
//     return `${monthName} ${year}`;
//   };

//   const handleYearChange = useCallback((newYear: number) => {
//     setBaseYear(newYear);
//   }, []);

//   const handleMonthClick = useCallback((monthIdx: number, year: number) => {
//     const clickedMonthValue = getMonthValue(monthIdx, year);
//     setHoveredMonth(null); // Clear hover state immediately on click

//     if (selectingState === 'start') {
//       setStartMonth(clickedMonthValue);
//       setEndMonth(null); // Crucial: clear previous endMonth for a fresh range (can be null here)
//       setSelectingState('end'); // Now we're looking for the end month

//       const { year: clickedYear } = parseMonthValue(clickedMonthValue);
//       if (clickedYear !== null && clickedYear !== baseYear) {
//         setBaseYear(clickedYear);
//       }

//     } else { // selectingState === 'end'
//       if (startMonth !== '') { // Ensure startMonth is not empty for comparison
//         if (clickedMonthValue < startMonth) {
//           setStartMonth(clickedMonthValue);
//           setEndMonth(null); // Clear endMonth as the start has changed
//           setSelectingState('end'); // Remain in 'end' state, waiting for the *new* end month

//           const { year: clickedYear } = parseMonthValue(clickedMonthValue);
//           if (clickedYear !== null && clickedYear !== baseYear) {
//             setBaseYear(clickedYear);
//           }
//         } else {
//           setEndMonth(clickedMonthValue);
//           setShowPicker(false); // Close the picker after completing the range
//           setSelectingState('start'); // Reset for the next range selection
//         }
//       } else {
//         // Fallback: If for some reason startMonth is empty when selectingState is 'end',
//         // treat this as setting a new start.
//         setStartMonth(clickedMonthValue);
//         setEndMonth(null);
//         setSelectingState('end');
//       }
//     }
//   }, [selectingState, startMonth, baseYear, setStartMonth, setEndMonth, setBaseYear]);

//   const handleMonthMouseEnter = useCallback((monthIdx: number, year: number) => {
//     const hoveredValue = getMonthValue(monthIdx, year);
//     setHoveredMonth(hoveredValue);
//   }, []);

//   const handleMonthMouseLeave = useCallback(() => {
//     setHoveredMonth(null);
//   }, []);

//   // Display the selected range in the input field
//   const displayedValue = (startMonth !== '' && endMonth !== null) // Check against empty string for startMonth
//     ? `${formatMonthYear(startMonth)} — ${formatMonthYear(endMonth)}`
//     : '';

//   return (
//     <div className="month-picker-container">
//       <input
//         ref={inputRef}
//         readOnly
//         onClick={() => {
//           setShowPicker(!showPicker);
//           setHoveredMonth(null); // Clear hovered state

//           // When opening, manage selectingState
//           if (startMonth !== '' && endMonth !== null) { // If a full range is present
//             setSelectingState('start'); // Next click will be a new start
//           } else if (startMonth !== '' && endMonth === null) { // If only start is selected
//             setSelectingState('end'); // Continue picking end
//           } else { // No selection at all
//             setSelectingState('start');
//           }
//         }}
//         value={displayedValue}
//         placeholder="Select month range"
//         className="month-picker-input"
//         aria-haspopup="dialog"
//         aria-expanded={showPicker}
//         aria-label="Month range selector"
//       />

//       {showPicker && (
//         <div
//           ref={panelRef}
//           className="month-picker-panel"
//           role="dialog"
//           aria-modal="true"
//           onMouseLeave={handleMonthMouseLeave}
//         >
//           {/* Left Month Grid (Year Y) */}
//           <MonthGrid
//             year={baseYear}
//             onYearChange={handleYearChange}
//             onMonthClick={handleMonthClick}
//             selectedStartMonth={startMonth}
//             selectedEndMonth={endMonth}
//             hoveredMonth={hoveredMonth}
//             showPrevYearArrow={true}
//             showNextYearArrow={false}
//             onMonthMouseEnter={handleMonthMouseEnter}
//             onMonthMouseLeave={handleMonthMouseLeave}
//             isPickingStart={selectingState === 'start'}
//           />

//           {/* Right Month Grid (Year Y+1) */}
//           <MonthGrid
//             year={baseYear + 1}
//             onYearChange={handleYearChange}
//             onMonthClick={handleMonthClick}
//             selectedStartMonth={startMonth}
//             selectedEndMonth={endMonth}
//             hoveredMonth={hoveredMonth}
//             showPrevYearArrow={false}
//             showNextYearArrow={true}
//             onMonthMouseEnter={handleMonthMouseEnter}
//             onMonthMouseLeave={handleMonthMouseLeave}
//             isPickingStart={selectingState === 'start'}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default MonthRangePicker;





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
  isPickingStart: boolean; // New prop to indicate if user is picking start of a new range
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
  isPickingStart // Use this prop to control hover behavior correctly
}: MonthGridProps) => {

  const getMonthClass = (monthIdx: number): string => {
    const monthValue = getMonthValue(monthIdx, year);
    let className = 'month-button';

    // IMPORTANT: Redefined `hasFullSelection` to ensure both start and end are NON-NULL strings
    const hasFullSelection = selectedStartMonth !== '' && selectedEndMonth !== null && selectedEndMonth !== '';

    // `isActivelyDragging` means a start month is picked, end is NOT, and user is hovering for end month
    const isActivelyDragging = !isPickingStart && selectedStartMonth !== '' && hoveredMonth !== null && hoveredMonth !== '';

    // 1. Handle FULLY SELECTED RANGE
    if (hasFullSelection) {
      // Single month selection (start and end are the same)
      if (selectedStartMonth === selectedEndMonth && monthValue === selectedStartMonth) {
          className += ' month-single';
      }
      // Months *strictly between* selectedStartMonth and selectedEndMonth
      else if ((monthValue > selectedStartMonth && monthValue < selectedEndMonth) ||
               (monthValue < selectedStartMonth && monthValue > selectedEndMonth)) {
          className += ' month-in-range';
      }
      // Start month of a full range
      if (monthValue === selectedStartMonth) {
          className += ' month-start';
      }
      // End month of a full range
      if (monthValue === selectedEndMonth) {
          className += ' month-end';
      }
    }

    // 2. Handle ACTIVE DRAGGING/HOVERING FOR END MONTH (only if isPickingStart is false, i.e., selectingState === 'end')
    // This logic runs independently or on top of 'hasFullSelection' if it exists.
    if (isActivelyDragging) {
        // Determine the two points for the hover range: selected start and current hovered month
        const [dragStart, dragEnd] = selectedStartMonth < hoveredMonth
                                        ? [selectedStartMonth, hoveredMonth]
                                        : [hoveredMonth, selectedStartMonth];

        // Apply hover-range class only if monthValue is *strictly between* dragStart and dragEnd
        if (monthValue > dragStart && monthValue < dragEnd) {
             className += ' month-hover-range';
        }
        // Apply month-hover-end to the current hovered month
        if (monthValue === hoveredMonth) {
            className += ' month-hover-end';
        }
        // Special case: if the hovered month is the same as the selected start month
        if (monthValue === selectedStartMonth && monthValue === hoveredMonth) {
            className += ' month-start-hover-end';
        }
    } else if (isPickingStart && hoveredMonth === monthValue) {
        // 3. Handle simple hover when picking the START of a new range
        // This applies when no start/end is picked yet, or a full range is done and starting over.
        className += ' month-hover';
    }


    // Ensure selectedStartMonth is always visible as a start point if it exists and no full selection is active
    // This handles the case where only startMonth is selected and user hasn't hovered for end.
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
      setEndMonth(null); // Ensure endMonth is explicitly null
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
          {/* Left Month Grid (Year Y) */}
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

          {/* Right Month Grid (Year Y+1) */}
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