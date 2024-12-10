import { debounce } from '../utils/helpers.js';

export class SearchBar {
  constructor(calendarService, onSearch) {
    this.service = calendarService;
    this.onSearch = onSearch;
    this.initializeSearch();
  }

  initializeSearch() {
    const searchInput = document.querySelector('input[type="text"][placeholder="Search"]');
    if (!searchInput) return;

    const debouncedSearch = debounce((query) => {
      const results = this.service.searchEvents(query);
      this.onSearch(results);
    }, 300);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      debouncedSearch(query);
    });

    // Clear search when input is cleared
    searchInput.addEventListener('keyup', (e) => {
      if (e.target.value === '') {
        this.onSearch(this.service.getEvents());
      }
    });
  }
}