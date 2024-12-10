import { format } from 'date-fns';

export class EventModal {
  constructor(calendarService) {
    this.service = calendarService;
    this.setupModal();
  }

  setupModal() {
    const modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <form id="eventForm" class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Add New Event</h3>
            <button type="button" class="delete-btn hidden text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" required
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" required
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" name="startTime" required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" name="endTime" required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </select>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" class="cancel-btn px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Save Event
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.bindEvents();
  }

  bindEvents() {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => this.hide());
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    deleteBtn.addEventListener('click', () => this.handleDelete());
  }

  show(event = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = modal.querySelector('h3');
    const submitBtn = modal.querySelector('button[type="submit"]');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    this.updateCategorySelect();
    
    if (event) {
      title.textContent = 'Edit Event';
      submitBtn.textContent = 'Update Event';
      deleteBtn.classList.remove('hidden');
      this.fillFormWithEvent(event);
      form.dataset.eventId = event.id;
    } else {
      title.textContent = 'Add New Event';
      submitBtn.textContent = 'Save Event';
      deleteBtn.classList.add('hidden');
      form.reset();
      delete form.dataset.eventId;
    }
    
    modal.classList.remove('hidden');
  }

  hide() {
    const modal = document.getElementById('eventModal');
    modal.classList.add('hidden');
  }

  updateCategorySelect() {
    const select = document.querySelector('select[name="category"]');
    const categories = this.service.getCategories();
    
    select.innerHTML = categories.map(category => `
      <option value="${category.id}" class="${category.color}">
        ${category.name}
      </option>
    `).join('');
  }

  fillFormWithEvent(event) {
    const form = document.getElementById('eventForm');
    form.elements.title.value = event.title;
    form.elements.date.value = format(new Date(event.start), 'yyyy-MM-dd');
    form.elements.startTime.value = format(new Date(event.start), 'HH:mm');
    form.elements.endTime.value = format(new Date(event.end), 'HH:mm');
    form.elements.category.value = event.category;
  }

  handleDelete() {
    const form = document.getElementById('eventForm');
    const eventId = parseInt(form.dataset.eventId);
    
    if (confirm('Are you sure you want to delete this event?')) {
      this.service.deleteEvent(eventId);
      this.hide();
      window.calendarApp.view.render();
      window.calendarApp.view.updateInboxCount();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const eventData = {
      title: formData.get('title'),
      start: new Date(`${formData.get('date')}T${formData.get('startTime')}`),
      end: new Date(`${formData.get('date')}T${formData.get('endTime')}`),
      category: formData.get('category')
    };

    if (form.dataset.eventId) {
      this.service.updateEvent(parseInt(form.dataset.eventId), eventData);
    } else {
      this.service.addEvent(eventData);
    }

    this.hide();
    form.reset();
    window.calendarApp.view.render();
    window.calendarApp.view.updateInboxCount();
  }
}