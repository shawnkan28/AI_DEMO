// Global variables
let currentShowId = null;
let showModal;
let deleteModal;
let allShows = [];
let autocompleteIndex = -1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showModal = new bootstrap.Modal(document.getElementById('showModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Load shows
    loadShows();
    
    // Event listeners
    document.getElementById('addShowBtn').addEventListener('click', openAddModal);
    document.getElementById('saveShowBtn').addEventListener('click', saveShow);
    document.getElementById('deleteShowBtn').addEventListener('click', openDeleteModalFromEdit);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    document.getElementById('titleFilter').addEventListener('input', handleTitleInput);
    document.getElementById('statusFilter').addEventListener('change', loadShows);
    
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            
            // Create or remove overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                });
            }
            overlay.classList.toggle('show');
        });
    }
    
    // Autocomplete keyboard navigation
    document.getElementById('titleFilter').addEventListener('keydown', handleAutocompleteKeyboard);
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            hideAutocomplete();
        }
    });
    
    // Reset form when modal is closed
    document.getElementById('showModal').addEventListener('hidden.bs.modal', resetForm);
});

// Handle title input with autocomplete
function handleTitleInput() {
    const input = document.getElementById('titleFilter').value;
    
    if (input.length > 0) {
        showAutocomplete(input);
    } else {
        hideAutocomplete();
    }
    
    // Debounce the actual search
    debounce(loadShows, 300)();
}

// Show autocomplete suggestions
function showAutocomplete(query) {
    const autocompleteList = document.getElementById('autocompleteList');
    
    // Filter shows that match the query
    const matches = allShows.filter(show => 
        show.title.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matches.length === 0) {
        autocompleteList.innerHTML = '<div class="autocomplete-no-results">No matching shows found</div>';
        autocompleteList.classList.add('show');
        return;
    }
    
    // Create autocomplete items
    autocompleteList.innerHTML = matches.map((show, index) => {
        const title = show.title;
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        const highlightedTitle = title.replace(regex, '<strong>$1</strong>');
        
        return `<div class="autocomplete-item" data-index="${index}" data-title="${escapeHtml(title)}">${highlightedTitle}</div>`;
    }).join('');
    
    // Add click handlers
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', function() {
            selectAutocompleteItem(this.dataset.title);
        });
    });
    
    autocompleteList.classList.add('show');
    autocompleteIndex = -1;
}

// Hide autocomplete
function hideAutocomplete() {
    const autocompleteList = document.getElementById('autocompleteList');
    autocompleteList.classList.remove('show');
    autocompleteList.innerHTML = '';
    autocompleteIndex = -1;
}

// Select autocomplete item
function selectAutocompleteItem(title) {
    document.getElementById('titleFilter').value = title;
    hideAutocomplete();
    loadShows();
}

// Handle keyboard navigation in autocomplete
function handleAutocompleteKeyboard(e) {
    const autocompleteList = document.getElementById('autocompleteList');
    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    
    if (items.length === 0) return;
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        autocompleteIndex = Math.max(autocompleteIndex - 1, -1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (autocompleteIndex >= 0 && items[autocompleteIndex]) {
            selectAutocompleteItem(items[autocompleteIndex].dataset.title);
        }
    } else if (e.key === 'Escape') {
        hideAutocomplete();
    }
}

// Update autocomplete selection highlight
function updateAutocompleteSelection(items) {
    items.forEach((item, index) => {
        if (index === autocompleteIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Load all shows with filters
async function loadShows() {
    const titleFilter = document.getElementById('titleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let url = '/api/shows?';
    if (titleFilter) url += `title=${encodeURIComponent(titleFilter)}&`;
    if (statusFilter) url += `status=${statusFilter}`;
    
    try {
        const response = await fetch(url);
        const shows = await response.json();
        
        // Store all shows for autocomplete (only when no filter is applied)
        if (!titleFilter && !statusFilter) {
            allShows = shows;
        }
        
        displayShows(shows);
    } catch (error) {
        console.error('Error loading shows:', error);
    }
}

// Display shows in gallery split by status
function displayShows(shows) {
    const inProgressGallery = document.getElementById('inProgressGallery');
    const endedGallery = document.getElementById('endedGallery');
    const inProgressSection = document.getElementById('inProgressSection');
    const endedSection = document.getElementById('endedSection');
    const emptyState = document.getElementById('emptyState');
    
    // Split shows by status
    const inProgressShows = shows.filter(show => !show.is_ended);
    const endedShows = shows.filter(show => show.is_ended);
    
    // Update counts
    document.getElementById('inProgressCount').textContent = inProgressShows.length;
    document.getElementById('endedCount').textContent = endedShows.length;
    
    if (shows.length === 0) {
        inProgressGallery.innerHTML = '';
        endedGallery.innerHTML = '';
        inProgressSection.style.display = 'none';
        endedSection.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render In Progress shows
    if (inProgressShows.length > 0) {
        inProgressSection.style.display = 'block';
        inProgressGallery.innerHTML = inProgressShows.map(show => createShowCard(show)).join('');
    } else {
        inProgressSection.style.display = 'none';
    }
    
    // Render Ended shows
    if (endedShows.length > 0) {
        endedSection.style.display = 'block';
        endedGallery.innerHTML = endedShows.map(show => createShowCard(show)).join('');
    } else {
        endedSection.style.display = 'none';
    }
}

// Get genre icon based on genre name
function getGenreIcon(genre) {
    const icons = {
        'Action': 'bi-lightning-charge-fill',
        'Comedy': 'bi-emoji-laughing-fill',
        'Drama': 'bi-hearts',
        'Fantasy': 'bi-stars',
        'Horror': 'bi-moon-stars-fill',
        'Mystery': 'bi-question-circle-fill',
        'Romance': 'bi-heart-fill',
        'Sci-Fi': 'bi-rocket-takeoff-fill',
        'Thriller': 'bi-exclamation-triangle-fill',
        'Documentary': 'bi-camera-reels-fill',
        'Animation': 'bi-palette-fill',
        'Crime': 'bi-shield-fill-exclamation',
        'Adventure': 'bi-compass-fill'
    };
    return icons[genre] || 'bi-film';
}

// Create show card HTML
function createShowCard(show) {
    return `
        <div class="show-card">
            <img src="${escapeHtml(show.cover_image_url)}" 
                 class="card-image" 
                 alt="${escapeHtml(show.title)}" 
                 onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'">
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(show.title)}</h3>
                    <span class="genre-tag genre-${escapeHtml(show.genre).toLowerCase().replace(/\s+/g, '-')}">
                        <i class="bi ${getGenreIcon(show.genre)}"></i>
                        ${escapeHtml(show.genre)}
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <div class="card-meta-item">
                            <i class="bi bi-calendar3"></i>
                            <span>${formatDate(show.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="openEditModal(${show.id}, '${escapeHtml(show.title)}', '${escapeHtml(show.cover_image_url)}', '${escapeHtml(show.genre)}', ${show.is_ended})" title="Edit">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open modal for adding new show
function openAddModal() {
    resetForm();
    document.getElementById('showModalLabel').textContent = 'Add TV Show';
    document.getElementById('deleteShowBtn').style.display = 'none';
    currentShowId = null;
}

// Open modal for editing show
function openEditModal(id, title, coverUrl, genre, isEnded) {
    resetForm();
    document.getElementById('showModalLabel').textContent = 'Edit TV Show';
    document.getElementById('showId').value = id;
    document.getElementById('showTitle').value = title;
    document.getElementById('showCoverUrl').value = coverUrl;
    document.getElementById('showGenre').value = genre;
    document.getElementById('showEnded').checked = isEnded === 1;
    document.getElementById('deleteShowBtn').style.display = 'block';
    currentShowId = id;
    showModal.show();
}

// Save show (create or update)
async function saveShow() {
    const title = document.getElementById('showTitle').value.trim();
    const coverUrl = document.getElementById('showCoverUrl').value.trim();
    const isEnded = document.getElementById('showEnded').checked;
    const formError = document.getElementById('formError');
    
    // Clear previous errors
    formError.style.display = 'none';
    document.getElementById('showTitle').classList.remove('is-invalid');
    document.getElementById('showCoverUrl').classList.remove('is-invalid');
    document.getElementById('showGenre').classList.remove('is-invalid');
    
    const genre = document.getElementById('showGenre').value.trim();
    
    // Validate required fields
    if (!title) {
        document.getElementById('showTitle').classList.add('is-invalid');
        return;
    }
    
    if (!coverUrl) {
        document.getElementById('showCoverUrl').classList.add('is-invalid');
        return;
    }
    
    if (!genre) {
        document.getElementById('showGenre').classList.add('is-invalid');
        return;
    }
    
    // Validate HTTPS URL
    const httpsPattern = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!httpsPattern.test(coverUrl)) {
        document.getElementById('showCoverUrl').classList.add('is-invalid');
        formError.textContent = 'Cover image URL must be a valid HTTPS URL';
        formError.style.display = 'block';
        return;
    }
    
    const showData = {
        title: title,
        cover_image_url: coverUrl,
        genre: genre,
        is_ended: isEnded
    };
    
    try {
        let response;
        if (currentShowId) {
            // Update existing show
            response = await fetch(`/api/shows/${currentShowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showData)
            });
        } else {
            // Create new show
            response = await fetch('/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showData)
            });
        }
        
        if (response.ok) {
            showModal.hide();
            loadShows();
        } else {
            const error = await response.json();
            formError.textContent = error.error || 'An error occurred';
            formError.style.display = 'block';
        }
    } catch (error) {
        console.error('Error saving show:', error);
        formError.textContent = 'An error occurred while saving';
        formError.style.display = 'block';
    }
}

// Open delete confirmation modal from edit modal
function openDeleteModalFromEdit() {
    if (!currentShowId) return;
    const title = document.getElementById('showTitle').value;
    showModal.hide();
    document.getElementById('deleteShowTitle').textContent = title;
    deleteModal.show();
}

// Confirm delete
async function confirmDelete() {
    if (!currentShowId) return;
    
    try {
        const response = await fetch(`/api/shows/${currentShowId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            deleteModal.hide();
            currentShowId = null;
            loadShows();
        }
    } catch (error) {
        console.error('Error deleting show:', error);
    }
}

// Reset form
function resetForm() {
    document.getElementById('showForm').reset();
    document.getElementById('showId').value = '';
    document.getElementById('showTitle').classList.remove('is-invalid');
    document.getElementById('showCoverUrl').classList.remove('is-invalid');
    document.getElementById('showGenre').classList.remove('is-invalid');
    document.getElementById('formError').style.display = 'none';
    currentShowId = null;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Escape regex special characters
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
}
