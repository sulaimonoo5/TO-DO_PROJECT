import { format } from 'date-fns';
import { getWeekDays } from '../utils/dateUtils.js';

export class CalendarHeader {
  constructor(container, currentDate) {
    this.container = container;
    this.currentDate = currentDate;
    this.setupHeaderDays();
  }

  setupHeaderDays() {
    if (!this.container) return;

    const weekDays = getWeekDays();
    const weekStart = new Date(this.currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    this.container.innerHTML = weekDays.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      
      return `
        <div class="text-center p-4">
          <div class="text-sm font-medium text-gray-500">${day}</div>
          <div class="text-2xl font-semibold ${this.isToday(date) ? 'text-blue-600' : ''}">${format(date, 'd')}</div>
        </div>
      `;
    }).join('');
  }

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  update(newDate) {
    this.currentDate = newDate;
    this.setupHeaderDays();
  }
}