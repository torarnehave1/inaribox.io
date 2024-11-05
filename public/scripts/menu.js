function loadMenu() {
    fetch('./menu.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('menu-container').innerHTML = data;
            initializeLanguageSelector();
            checkAuthStatus();
        })
        .catch(error => console.error('Error loading menu:', error));
}

loadMenu();