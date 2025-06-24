export const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];


export const getMonthValue = (monthIndex: number, year: number): string => {
  const month = (monthIndex + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const parseMonthValue = (monthValue: string | null) => {
  if (!monthValue) return { year: null, monthIndex: null };
  const [yearStr, monthStr] = monthValue.split('-');
  return { year: parseInt(yearStr), monthIndex: parseInt(monthStr) - 1 };
};

export const formatMonthYear = (dateString: string | null): string => {
    if (!dateString || dateString === '') return '';
    const [year, month] = dateString.split('-');
    if (!year || !month) return '';
    const monthName = months[parseInt(month) - 1];
    return `${monthName} ${year}`;
  };
