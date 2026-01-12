/**
 * Formats a date into a professional string like "12th January 2026"
 * @param {Date|string} dateInput - The date to format
 * @returns {string} - Formatted date string
 */
export const formatProfessionalDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const suffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${suffix(day)} ${month} ${year}`;
};

/**
 * Formats time into a professional string like "6:30 PM"
 * @param {Date|string} dateInput - The date to format
 * @returns {string} - Formatted time string
 */
export const formatProfessionalTime = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).toLowerCase();
};

/**
 * Combines date and time into "12th January 2026, 6:30 PM"
 */
export const formatProfessionalDateTime = (dateInput) => {
    const datePart = formatProfessionalDate(dateInput);
    const timePart = formatProfessionalTime(dateInput);
    return timePart ? `${datePart} ${timePart}` : datePart;
};
