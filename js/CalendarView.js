import { CalendarHeader } from './components/CalendarHeader.js';
import { EventModal } from './components/EventModal.js';
import { CategoryModal } from './components/CategoryModal.js';
import { SearchBar } from './components/SearchBar.js';
import { getTimeSlots } from './utils/dateUtils.js';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, differenceInMinutes } from 'date-fns';

export class CalendarView {
  constructor(calendarService) {
    this.service = calendarService;
    this.currentDate = new Date();
    this.searchBar = new SearchBar(calendarService, (results) => {
      this.renderFilteredEvents(results);
    });
    this.initializeUI();
    this.render();
  }

  initializeUI() {
    this.container = document.getElementById('calendar-grid');
    this.headerContainer = document.getElementById('calendar-header');
    
    if (this.headerContainer) {
      this.header = new CalendarHeader(this.headerContainer, this.currentDate);
    }
    
    this.eventModal = new EventModal(this.service);
    this.categoryModal = new CategoryModal(this.service);
    this.setupTimeGrid();
    this.bindEvents();
    this.updateMonthDisplay();
    this.renderCategories();
    this.updateInboxCount();
  }

  updateInboxCount() {
    const inboxCount = document.getElementById('inboxCount');
    if (!inboxCount) return;
    
    const events = this.service.getEvents();
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      const today = new Date();
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    });
    
    inboxCount.textContent = todayEvents.length;
  }

  setupTimeGrid() {
    const timeGrid = document.getElementById('time-grid');
    if (!timeGrid) return;

    const timeSlots = getTimeSlots(5, 23);
    timeGrid.innerHTML = timeSlots.map(slot => `
      <div class="h-[60px] text-xs text-gray-500 text-right pr-2">
        ${slot.label}
      </div>
    `).join('');
  }

  bindEvents() {
    document.querySelector('.new-event-btn')?.addEventListener('click', () => {
      this.eventModal.show();
    });

    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
      this.categoryModal.show();
    });

    document.getElementById('prevWeek')?.addEventListener('click', () => {
      this.navigateWeek(-1);
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
      this.navigateWeek(1);
    });

    document.getElementById('monthSelector')?.addEventListener('click', (e) => {
      window.miniCalendar.show(e.target);
    });
  }

  updateMonthDisplay() {
    const monthSelector = document.getElementById('monthSelector');
    if (!monthSelector) return;
    
    monthSelector.textContent = format(this.currentDate, 'MMMM yyyy');
  }

  selectDate(date) {
    this.currentDate = date;
    this.header.update(this.currentDate);
    this.updateMonthDisplay();
    this.render();
  }

  navigateWeek(direction) {
    this.currentDate = addWeeks(this.currentDate, direction);
    this.header.update(this.currentDate);
    this.updateMonthDisplay();
    this.render();
  }

  renderCategories() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;

    const categories = this.service.getCategories();
    categoryList.innerHTML = categories.map(category => `
      <div class="flex items-center justify-between text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100">
        <a href="#" class="flex items-center flex-1" onclick="calendarApp.view.filterByCategory('${category.id}')">
          <span class="w-2 h-2 ${category.color} rounded-full mr-2"></span>
          ${category.name}
        </a>
        ${category.id !== 'default' ? `
          <button onclick="calendarApp.view.editCategory('${category.id}')" class="text-gray-500 hover:text-gray-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        ` : ''}
      </div>
    `).join('');
  }

  editCategory(categoryId) {
    const category = this.service.getCategories().find(cat => cat.id === categoryId);
    if (category) {
      this.categoryModal.show(category);
    }
  }

  filterByCategory(categoryId) {
    const events = categoryId === 'all' 
      ? this.service.getEvents()
      : this.service.getEventsByCategory(categoryId);
    this.renderFilteredEvents(events);
  }

  renderFilteredEvents(events) {
    if (!this.container) return;

    const weekStart = startOfWeek(this.currentDate);
    const weekEnd = endOfWeek(this.currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    this.container.innerHTML = days.map(day => {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      });

      return this.renderDayColumn(day, dayEvents);
    }).join('');

    this.setupDragAndDrop();
  }

  render() {
    const events = this.service.getEvents();
    this.renderFilteredEvents(events);
  }

  renderDayColumn(date, events) {
    const timeSlots = getTimeSlots(5, 23);
    
    return `
      <div class="calendar-column bg-white" data-date="${format(date, 'yyyy-MM-dd')}">
        ${timeSlots.map(slot => `
          <div class="calendar-cell hover:bg-gray-50" data-hour="${slot.hour}">
            ${events
              .filter(event => new Date(event.start).getHours() === slot.hour)
              .map(event => this.renderEvent(event))
              .join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderEvent(event) {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    const durationInMinutes = differenceInMinutes(endTime, startTime);
    const height = (durationInMinutes / 60) * 60; // 60px per hour
    const topOffset = (startTime.getMinutes() / 60) * 60; // Position based on minutes

    return `
      <div class="calendar-event ${event.color} cursor-move"
           data-event-id="${event.id}"
           style="height: ${height}px; top: ${topOffset}px;"
           draggable="true"
           onclick="calendarApp.view.editEvent(${event.id})">
        <div class="text-sm font-semibold">${event.title}</div>
        <div class="text-xs">
          ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}
        </div>
      </div>
    `;
  }

  editEvent(eventId) {
    const event = this.service.getEventById(eventId);
    if (event) {
      this.eventModal.show(event);
    }
  }

  setupDragAndDrop() {
    const events = document.querySelectorAll('.calendar-event');
    const cells = document.querySelectorAll('.calendar-cell');

    events.forEach(event => {
      event.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', event.dataset.eventId);
        e.dataTransfer.effectAllowed = 'move';
      });
    });

    cells.forEach(cell => {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('bg-gray-100');
      });

      cell.addEventListener('dragleave', () => {
        cell.classList.remove('bg-gray-100');
      });

      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('bg-gray-100');
        const eventId = parseInt(e.dataTransfer.getData('text/plain'));
        const event = this.service.getEventById(eventId);
        
        if (event) {
          const newDate = new Date(cell.closest('.calendar-column').dataset.date);
          const newHour = parseInt(cell.dataset.hour);
          
          const startTime = new Date(event.start);
          const duration = differenceInMinutes(new Date(event.end), startTime);
          
          newDate.setHours(newHour);
          newDate.setMinutes(startTime.getMinutes());
          
          const newEndDate = new Date(newDate);
          newEndDate.setMinutes(newDate.getMinutes() + duration);
          
          this.service.updateEvent(eventId, {
            ...event,
            start: newDate,
            end: newEndDate
          });
          
          this.render();
        }
      });
    });
  }
}