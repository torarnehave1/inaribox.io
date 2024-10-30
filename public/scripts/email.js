const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results-container");
const pagination = document.getElementById("pagination");
const progressBarContainer = document.getElementById("progress-bar-container");
const resultsPerPage = 6;
let currentPage = 1;

async function fetchEmails(searchTerm, page = 1) {
  showProgressBar();
  const offset = (page - 1) * resultsPerPage;
  const response = await fetch(`/emr/search-emails?term=${encodeURIComponent(searchTerm)}&limit=${resultsPerPage}&offset=${offset}`);
  const data = await response.json();
  hideProgressBar();
  renderResults(data.emails);
  renderPagination(data.totalResults);
}

function renderResults(emails) {
  resultsContainer.innerHTML = "";
  if (emails.length === 0) {
    resultsContainer.innerHTML = "<p class='text-center'>No emails found.</p>";
    return;
  }

  emails.forEach(email => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${email.subject}</h5>
          <p class="card-text"><strong>From:</strong> ${email.from[0].name} (${email.from[0].address})</p>
          <p class="card-text"><strong>Date:</strong> ${new Date(email.date).toLocaleDateString()}</p>
          <p class="card-text"><strong>Info:</strong></p>
          <ul>
            <li><strong>Navn:</strong> ${email.extractedInfo.Navn || "N/A"}</li>
            <li><strong>Email:</strong> ${email.extractedInfo.Epostadresse || "N/A"}</li>
            <li><strong>Phone:</strong> ${email.extractedInfo.Telefonnummer || "N/A"}</li>
            <li><strong>Start Date:</strong> ${email.extractedInfo.Startdato || "N/A"}</li>
            <li><strong>End Date:</strong> ${email.extractedInfo.Sluttdato || "N/A"}</li>
          </ul>
        </div>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

function renderPagination(totalResults) {
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = "page-item" + (i === currentPage ? " active" : "");
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      fetchEmails(searchInput.value, currentPage);
    });
    pagination.appendChild(pageItem);
  }
}

// Show and hide progress bar
function showProgressBar() {
  progressBarContainer.style.display = "block";
}

function hideProgressBar() {
  progressBarContainer.style.display = "none";
}

// Search Event Listeners
searchButton.addEventListener("click", () => {
  currentPage = 1;
  fetchEmails(searchInput.value);
});

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchEmails(searchInput.value);
  }
});
