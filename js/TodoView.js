export class TodoView {
  constructor(todoService) {
    this.todoService = todoService;
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.form = document.getElementById('todoForm');
    this.input = document.getElementById('todoInput');
    this.categorySelect = document.getElementById('todoCategory');
    this.dueDateInput = document.getElementById('todoDueDate');
    this.filterSelect = document.getElementById('categoryFilter');
    this.todoList = document.getElementById('todoList');
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.filterSelect.addEventListener('change', () => {
      this.render();
    });
  }

  handleSubmit() {
    const text = this.input.value.trim();
    const category = this.categorySelect.value;
    const dueDate = this.dueDateInput.value || null;

    if (text) {
      this.todoService.add(text, category, dueDate);
      this.input.value = '';
      this.dueDateInput.value = '';
      this.render();
      this.updateCategoryFilter();
    }
  }

  updateCategoryFilter() {
    const categories = this.todoService.getCategories();
    const currentFilter = this.filterSelect.value;
    
    this.filterSelect.innerHTML = `
      <option value="all">All Categories</option>
      ${categories.map(category => `
        <option value="${category}" ${currentFilter === category ? 'selected' : ''}>
          ${category}
        </option>
      `).join('')}
    `;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  render() {
    const selectedCategory = this.filterSelect.value;
    const todos = this.todoService.filterByCategory(selectedCategory);
    
    this.todoList.innerHTML = todos
      .map(todo => `
        <li class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            ${todo.completed ? 'checked' : ''}
            onchange="todoApp.view.handleToggle(${todo.id})"
            class="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
          />
          <div class="flex-1">
            <span class="${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}">
              ${todo.text}
            </span>
            <div class="flex gap-2 mt-1 text-sm text-gray-500">
              <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                ${todo.category}
              </span>
              ${todo.dueDate ? `
                <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Due: ${this.formatDate(todo.dueDate)}
                </span>
              ` : ''}
            </div>
          </div>
          <button
            onclick="todoApp.view.handleDelete(${todo.id})"
            class="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete todo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </li>
      `)
      .join('');
  }

  handleToggle(id) {
    this.todoService.toggle(id);
    this.render();
  }

  handleDelete(id) {
    this.todoService.delete(id);
    this.render();
    this.updateCategoryFilter();
  }
}