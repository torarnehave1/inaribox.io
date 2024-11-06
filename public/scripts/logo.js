document.addEventListener("DOMContentLoaded", function () {
    // Fetch the config data from the server and set the logo URL
    fetch('/config')
      .then(response => response.json())
      .then(data => {
        document.getElementById('logo').src = data.APPLICATION_LOGO;
      })
      .catch(error => console.error('Error fetching logo URL:', error));
  });
  