document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const searchIcon = document.getElementById('searchToggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');
    const categorySelect = document.getElementById('category-select');
    const articlesGrid = document.querySelector('.articles-grid');
    
    let allCards; // Holds all article cards after fetching data

    // --- Dynamic Filtering Function (combines search and category) ---
    function applyFilter() {
        if (!allCards) return; 
        
        const selectedCategory = categorySelect.value;
        const searchTerm = searchInput.value.trim().toLowerCase();

        allCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            const cardCodeBarElement = card.querySelector('.article-code');
            const fullCodeText = cardCodeBarElement ? cardCodeBarElement.textContent.toLowerCase() : '';

            // Strip prefix for clean code search
            const cardCode = fullCodeText.replace(/code bar:\s*/, '').trim(); 

            const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
            const matchesSearch = cardCode.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // --- Core Function: Fetch Data from Node.js Server ---
    async function fetchAndDisplayArticles() {
        articlesGrid.innerHTML = '<h2>Loading products...</h2>'; 
        
        try {
            // Fetch data from the server's GET endpoint
            const response = await fetch('http://localhost:3000/api/articles');
            const customArticles = await response.json();

            if (customArticles.length === 0) {
                articlesGrid.innerHTML = '<h2>No articles found in the catalogue. Add one!</h2>';
                return;
            }

            // Clear loading message
            articlesGrid.innerHTML = ''; 

            customArticles.forEach(article => {
                const articleHTML = `
                    <div class="article-card" data-category="${article.category}">
                        <img src="${article.image}" alt="${article.name}" class="article-img"> 
                        <h3 class="article-name">${article.name}</h3>
                        <p class="article-code">Code Bar: ${article.code}</p>
                        <div class="article-price-section">
                            <span class="article-price">${article.price}</span> 
                            <a href="article-details-${article.id}.html" class="btn-see-more">See More</a>
                        </div>
                    </div>
                `;
                // Insert articles into the grid
                articlesGrid.insertAdjacentHTML('beforeend', articleHTML);
            });
            
        } catch (error) {
            console.error('Error fetching articles from server:', error);
            articlesGrid.innerHTML = '<h2 style="color: red; text-align: center;">❌ Failed to load products. Check if Node.js server is running.</h2>';
        }

        // --- IMPORTANT: Re-select all article cards after insertion ---
        allCards = document.querySelectorAll('.article-card');
        
        // Apply initial filter/display
        applyFilter();
    }

    // --- Search Bar Toggle Logic ---
    if (searchIcon && searchBox && searchInput) {
        searchIcon.addEventListener('click', () => {
            searchBox.classList.toggle('open');
            if (searchBox.classList.contains('open')) {
                setTimeout(() => {
                    searchInput.focus();
                }, 300);
            } else {
                searchInput.value = '';
                searchInput.blur();
                applyFilter(); 
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && searchBox.classList.contains('open')) {
                searchBox.classList.remove('open');
                searchInput.value = '';
                searchInput.blur();
                applyFilter();
            }
        });
    }

    // --- Event Listeners for Filtering ---
    searchInput.addEventListener('input', applyFilter);
    categorySelect.addEventListener('change', applyFilter);

    // --- Initial Call to start fetching data ---
    fetchAndDisplayArticles();
});