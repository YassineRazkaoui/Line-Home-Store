document.addEventListener('DOMContentLoaded', (event) => {
    const searchIcon = document.getElementById('searchToggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');
    
    searchIcon.addEventListener('click', () => {
        // Toggle the 'open' class on the search box
        searchBox.classList.toggle('open');
        
        // If the box is open, focus on the input field
        if (searchBox.classList.contains('open')) {
            // Set a small delay before focusing to let the CSS transition start
            setTimeout(() => {
                searchInput.focus();
            }, 300); 
        } else {
            // Clear and blur the input when closed
            searchInput.value = '';
            searchInput.blur();
        }
    });

    // Optional: Close the search box if the user clicks anywhere else
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && searchBox.classList.contains('open')) {
            searchBox.classList.remove('open');
            searchInput.value = '';
        }
    });
});