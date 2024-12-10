import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { isToday } from '../utils/dateUtils.js';

export class MiniCalendar {
  constructor(calendarService) {
    this.service = calendarService;
    this.currentDate = new Date();
    this.setupCalendar();
  }

  setupCalendar() {
    const calendar = document.createElement('div');
    calendar.id = 'miniCalendar';
    calendar.className = 'bg-white rounded-lg shadow-lg p-4 absolute z-50 hidden';
    document.body.appendChild(calendar);
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const calendar = document.getElementById('miniCalendar');
      const monthSelector = document.getElementById('monthSelector');
      
      if (!calendar.contains(e.target) && !monthSelector.contains(e.target)) {
        this.hide();
      }
    });
  }

  show(anchorElement) {
    const calendar = document.getElementById('miniCalendar');
    const rect = anchorElement.getBoundingClientRect();
    
    calendar.style.top = `${rect.bottom + 5}px`;
    calendar.style.left = `${rect.left}px`;
    calendar.classList.remove('hidden');
    
    this.render();
  }

  hide() {
    const calendar = document.getElementById('miniCalendar');
    calendar.classList.add('hidden');
  }

  navigateMonth(direction) {
    this.currentDate = addMonths(this.currentDate, direction);
    this.render();
  }

  selectDate(date) {
    window.calendarApp.view.selectDate(date);
    this.hide();
  }

  render() {
    const calendar = document.getElementById('miniCalendar');
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();

    calendar.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <button class="text-gray-600 hover:text-gray-800" onclick="miniCalendar.navigateMonth(-1)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="font-semibold">${format(this.currentDate, 'MMMM yyyy')}</span>
        <button class="text-gray-600 hover:text-gray-800" onclick="miniCalendar.navigateMonth(1)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1">
        ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
          .map(day => `<div class="text-center text-sm font-medium text-gray-600">${day}</div>`)
          .join('')}
        ${Array(firstDayOfWeek).fill(0)
          .map(() => `<div class="h-8"></div>`)
          .join('')}
        ${days.map(date => {
          const hasEvents = this.service.getEventsForDay(date).length > 0;
          return `
            <div class="h-8 flex items-center justify-center">
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full
                       ${isToday(date) ? 'bg-blue-600 text-white' : ''}
                       ${hasEvents ? 'font-bold' : ''}
                       hover:bg-gray-100"
                onclick="miniCalendar.selectDate(new Date('${date.toISOString()}'))"
              >
                ${format(date, 'd')}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}