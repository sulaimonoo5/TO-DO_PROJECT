export class CategoryModal {
  constructor(calendarService) {
    this.service = calendarService;
    this.setupModal();
  }

  setupModal() {
    const modal = document.createElement('div');
    modal.id = 'categoryModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <form id="categoryForm" class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Add New Category</h3>
            <button type="button" class="delete-btn hidden text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category Name</label>
            <input type="text" name="name" required
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Color</label>
            <select name="color" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="event-yellow">Yellow</option>
              <option value="event-purple">Purple</option>
              <option value="event-blue">Blue</option>
              <option value="event-green">Green</option>
              <option value="event-red">Red</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" class="cancel-btn px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Add Category
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.bindEvents();
  }

  bindEvents() {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => this.hide());
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    deleteBtn.addEventListener('click', () => this.handleDelete());
  }

  show(category = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = modal.querySelector('h3');
    const submitBtn = modal.querySelector('button[type="submit"]');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    if (category) {
      title.textContent = 'Edit Category';
      submitBtn.textContent = 'Update Category';
      deleteBtn.classList.remove('hidden');
      this.fillFormWithCategory(category);
      form.dataset.categoryId = category.id;
    } else {
      title.textContent = 'Add New Category';
      submitBtn.textContent = 'Add Category';
      deleteBtn.classList.add('hidden');
      form.reset();
      delete form.dataset.categoryId;
    }
    
    modal.classList.remove('hidden');
  }

  hide() {
    const modal = document.getElementById('categoryModal');
    modal.classList.add('hidden');
  }

  fillFormWithCategory(category) {
    const form = document.getElementById('categoryForm');
    form.elements.name.value = category.name;
    form.elements.color.value = category.color;
  }

  handleDelete() {
    const form = document.getElementById('categoryForm');
    const categoryId = form.dataset.categoryId;
    
    if (confirm('Are you sure you want to delete this category? All events in this category will be moved to default category.')) {
      this.service.deleteCategory(categoryId);
      this.hide();
      window.calendarApp.view.renderCategories();
      window.calendarApp.view.render();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const categoryData = {
      name: formData.get('name'),
      color: formData.get('color')
    };

    if (form.dataset.categoryId) {
      this.service.updateCategory(form.dataset.categoryId, categoryData);
    } else {
      this.service.addCategory(categoryData.name, categoryData.color);
    }

    this.hide();
    form.reset();
    window.calendarApp.view.renderCategories();
    window.calendarApp.view.render();
  }
}