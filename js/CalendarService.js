export class CalendarService {
  constructor() {
    this.events = this.loadEvents();
    this.categories = this.loadCategories();
  }

  loadEvents() {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents).map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    })) : [];
  }

  loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      { id: 'personal', name: 'Personal', color: 'event-yellow' },
      { id: 'work', name: 'Work', color: 'event-purple' },
      { id: 'meeting', name: 'Meeting', color: 'event-blue' }
    ];
  }

  saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  }

  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  getEvents() {
    return this.events;
  }

  getEventById(id) {
    return this.events.find(event => event.id === id);
  }

  getEventsForDay(date) {
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  getEventsByCategory(categoryId) {
    return this.events.filter(event => event.category === categoryId);
  }

  addEvent(eventData) {
    const newEvent = {
      id: Date.now(),
      ...eventData,
      color: this.getCategoryColor(eventData.category)
    };
    
    this.events.push(newEvent);
    this.saveEvents();
    return newEvent;
  }

  updateEvent(id, eventData) {
    this.events = this.events.map(event => {
      if (event.id === id) {
        return {
          ...event,
          ...eventData,
          color: this.getCategoryColor(eventData.category)
        };
      }
      return event;
    });
    
    this.saveEvents();
  }

  deleteEvent(id) {
    this.events = this.events.filter(event => event.id !== id);
    this.saveEvents();
  }

  getCategories() {
    return this.categories;
  }

  getCategoryColor(categoryId) {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'event-gray';
  }

  addCategory(name, color) {
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color
    };
    
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  updateCategory(id, data) {
    this.categories = this.categories.map(category => {
      if (category.id === id) {
        return { ...category, ...data };
      }
      return category;
    });
    
    this.saveCategories();
  }

  deleteCategory(id) {
    // Move events from deleted category to default category
    this.events = this.events.map(event => {
      if (event.category === id) {
        return {
          ...event,
          category: 'personal',
          color: this.getCategoryColor('personal')
        };
      }
      return event;
    });
    
    this.categories = this.categories.filter(category => category.id !== id);
    this.saveCategories();
    this.saveEvents();
  }

  searchEvents(query) {
    if (!query) return this.events;
    
    const searchTerm = query.toLowerCase();
    return this.events.filter(event => {
      const category = this.categories.find(cat => cat.id === event.category);
      return (
        event.title.toLowerCase().includes(searchTerm) ||
        (category && category.name.toLowerCase().includes(searchTerm))
      );
    });
  }
}