// loadMenuAndLogo.js

// Define the function
function loadMenuAndLogo() {
    fetch('./menu.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('menu-container').innerHTML = data;
        loadLogo(); // Call loadLogo after inserting menu.html
      })
      .catch(error => console.error('Error loading menu:', error));
  }
  
  // Define loadLogo function to be called within loadMenuAndLogo
  function loadLogo() {
    fetch('/cnf/application-logo')
      .then(response => response.json())
      .then(data => {
        const logoElement = document.getElementById('logo');
        if (logoElement) {
          logoElement.src = data.applicationLogo;
        } else {
          console.error("Logo element not found in the DOM.");
        }
      })
      .catch(error => console.error('Error fetching logo URL:', error));
  }
  
  // Add event listener to run the function after DOM content loads
  document.addEventListener("DOMContentLoaded", loadMenuAndLogo);
  