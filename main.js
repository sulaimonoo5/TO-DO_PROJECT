import './style.css';
import { CalendarService } from './js/CalendarService.js';
import { CalendarView } from './js/CalendarView.js';
import { MiniCalendar } from './js/components/MiniCalendar.js';

document.addEventListener('DOMContentLoaded', () => {
  const calendarService = new CalendarService();
  const calendarView = new CalendarView(calendarService);
  const miniCalendar = new MiniCalendar(calendarService);
  
  // Make the calendar app globally accessible
  window.calendarApp = {
    service: calendarService,
    view: calendarView
  };
  
  // Make miniCalendar globally accessible for event handling
  window.miniCalendar = miniCalendar;
});