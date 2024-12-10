import { format, addMonths } from 'date-fns';

export function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getWeekDays() {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}

export function getMonthOptions(currentDate, range = 6) {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const options = [];

  for (let i = -range; i <= range; i++) {
    const date = addMonths(new Date(currentYear, currentMonth), i);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
      selected: i === 0
    });
  }

  return options;
}

export function getTimeSlots(startHour = 5, endHour = 23) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      hour,
      label: format(new Date().setHours(hour, 0), 'ha')
    });
  }
  return slots;
}