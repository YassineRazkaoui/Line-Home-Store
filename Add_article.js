document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const ADMIN_SECRET_KEY = 'admin-line-2025'; 
    let authorized = false; 

    // --- 1. ADMIN AUTHORIZATION CHECK (Restricts page access) ---
    const sessionKey = sessionStorage.getItem('adminAuthKey');
    
    if (sessionKey === ADMIN_SECRET_KEY) {
        authorized = true;
    } else {
        const enteredKey = prompt("🔒 This page is restricted. Please enter the Admin Authorization Key:");
        
        if (enteredKey === ADMIN_SECRET_KEY) {
            authorized = true;
            sessionStorage.setItem('adminAuthKey', ADMIN_SECRET_KEY);
        } else {
            alert("Authorization failed. Access denied.");
            window.location.href = 'catalogue.html';
            return; 
        }
    }

    // --- Element Selectors (Only executed if authorized) ---
    const form = document.getElementById('addArticleForm');
    const imageInput = document.getElementById('image');
    const message = document.getElementById('message');
    const adminKeyInput = document.getElementById('adminKey'); 
    
    // Pre-fill the hidden input with the key
    if (adminKeyInput) {
        adminKeyInput.value = ADMIN_SECRET_KEY;
    }


    // --- Helper Function: Convert File to Base64 String ---
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); 
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // --- Core Logic: Form Submission and Server Communication ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Display loading state
        message.textContent = 'Saving article...';
        message.style.color = '#252272';
        message.style.backgroundColor = '#f0f0f0';

        // 1. Image File Handling
        const file = imageInput.files[0];
        if (!file) {
            message.textContent = '❌ Error: Please select an image file.';
            message.style.color = 'red';
            message.style.backgroundColor = '#ffe0e0';
            return;
        }

        let base64ImageString;
        try {
            base64ImageString = await convertFileToBase64(file);
        } catch (e) {
            message.textContent = '❌ Error: Failed to read image file. Try a smaller image.';
            message.style.color = 'red';
            message.style.backgroundColor = '#ffe0e0';
            return;
        }

        // 2. Gather Data
        const newArticle = {
            name: document.getElementById('name').value,
            code: document.getElementById('code').value.trim(), 
            price: `${parseFloat(document.getElementById('price').value).toFixed(2)} DH`, 
            category: document.getElementById('category').value,
            image: base64ImageString, 
            adminKey: ADMIN_SECRET_KEY // Sent for server-side authorization
        };

        // 3. Send Data to Node.js API and Handle Response
        // NOTE: Uses relative URL '/api/articles' in deployment context, 
        // but explicit http://localhost:3000 is safer for local testing.
        const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/articles' : '/api/articles';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newArticle),
            });

            const result = await response.json();

            if (response.ok) {
                // SUCCESS
                message.textContent = `✅ SUCCESS: ${result.message}`;
                message.style.color = 'green';
                message.style.backgroundColor = '#e0ffe0';
                form.reset();

                setTimeout(() => {
                    window.location.href = 'catalogue.html';
                }, 1500);
            } else {
                // FAILURE
                message.textContent = `❌ PROBLEM: ${result.message || 'Server encountered an unknown error.'}`;
                message.style.color = 'red';
                message.backgroundColor = '#ffe0e0';
            }

        } catch (error) {
            // NETWORK FAILURE
            console.error('Network Error:', error);
            message.textContent = '⚠️ NETWORK PROBLEM: Could not connect to the server (Is Node.js running?).';
            message.style.color = 'orange';
            message.backgroundColor = '#fff3e0';
        }
    });


    // --- Search Bar Toggle Logic ---
    const searchIcon = document.getElementById('searchToggle');
    const searchBox = document.querySelector('.navbar .search-box');
    const searchInput = document.querySelector('.search-input');
    
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
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && searchBox.classList.contains('open')) {
                searchBox.classList.remove('open');
                searchInput.value = '';
                searchInput.blur();
            }
        });
    }
});