// Global variables
let currentShowId = null;
let showModal;
let deleteModal;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showModal = new bootstrap.Modal(document.getElementById('showModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Load shows
    loadShows();
    
    // Event listeners
    document.getElementById('addShowBtn').addEventListener('click', openAddModal);
    document.getElementById('saveShowBtn').addEventListener('click', saveShow);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    document.getElementById('titleFilter').addEventListener('input', debounce(loadShows, 300));
    document.getElementById('statusFilter').addEventListener('change', loadShows);
    
    // Reset form when modal is closed
    document.getElementById('showModal').addEventListener('hidden.bs.modal', resetForm);
});

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
        displayShows(shows);
    } catch (error) {
        console.error('Error loading shows:', error);
    }
}

// Display shows in gallery
function displayShows(shows) {
    const gallery = document.getElementById('showsGallery');
    const emptyState = document.getElementById('emptyState');
    
    if (shows.length === 0) {
        gallery.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    gallery.innerHTML = shows.map(show => `
        <div class="col">
            <div class="card h-100 show-card">
                <img src="${escapeHtml(show.cover_image_url)}" class="card-img-top" alt="${escapeHtml(show.title)}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(show.title)}</h5>
                    <div class="mb-2">
                        <span class="badge ${show.is_ended ? 'bg-secondary' : 'bg-success'}">
                            ${show.is_ended ? 'Ended' : 'In Progress'}
                        </span>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary flex-fill" onclick="openEditModal(${show.id}, '${escapeHtml(show.title)}', '${escapeHtml(show.cover_image_url)}', ${show.is_ended})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger flex-fill" onclick="openDeleteModal(${show.id}, '${escapeHtml(show.title)}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Open modal for adding new show
function openAddModal() {
    resetForm();
    document.getElementById('showModalLabel').textContent = 'Add TV Show';
    currentShowId = null;
}

// Open modal for editing show
function openEditModal(id, title, coverUrl, isEnded) {
    resetForm();
    document.getElementById('showModalLabel').textContent = 'Edit TV Show';
    document.getElementById('showId').value = id;
    document.getElementById('showTitle').value = title;
    document.getElementById('showCoverUrl').value = coverUrl;
    document.getElementById('showEnded').checked = isEnded === 1;
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
    
    // Validate required fields
    if (!title) {
        document.getElementById('showTitle').classList.add('is-invalid');
        return;
    }
    
    if (!coverUrl) {
        document.getElementById('showCoverUrl').classList.add('is-invalid');
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

// Open delete confirmation modal
function openDeleteModal(id, title) {
    currentShowId = id;
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
