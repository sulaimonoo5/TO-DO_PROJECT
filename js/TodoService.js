export class TodoService {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  getAll() {
    return this.todos;
  }

  add(text, category = 'default', dueDate = null) {
    const todo = {
      id: Date.now(),
      text,
      category,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.todos.push(todo);
    this.save();
    return todo;
  }

  toggle(id) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.save();
  }

  delete(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.save();
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getCategories() {
    return [...new Set(this.todos.map(todo => todo.category))];
  }

  filterByCategory(category) {
    return category === 'all' 
      ? this.todos 
      : this.todos.filter(todo => todo.category === category);
  }
}