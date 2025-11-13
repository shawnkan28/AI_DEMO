from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import re
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DATABASE = 'library.db'
OMDB_API_KEY = 'trilogy'  # Free API key for testing (or get your own at http://www.omdbapi.com/apikey.aspx)

def get_db():
    """Connect to the database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def validate_https_url(url):
    """Validate that URL starts with https:// and follows standard URL format"""
    pattern = r'^https://[^\s/$.?#].[^\s]*$'
    return re.match(pattern, url) is not None

def verify_show_in_imdb(title):
    """Verify if a TV show exists in IMDB via OMDb API"""
    try:
        # Search for the TV show in OMDb
        url = f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={title}&type=series'
        response = requests.get(url, timeout=5)
        data = response.json()
        
        # Check if the show was found
        if data.get('Response') == 'True' and data.get('Type') == 'series':
            return True, None
        else:
            error_msg = f"TV show '{title}' not found in IMDB. Please verify the title is correct."
            return False, error_msg
    except requests.exceptions.Timeout:
        # If API times out, allow the creation (don't block user)
        return True, None
    except Exception as e:
        # If any other error occurs, allow the creation
        print(f"IMDB verification error: {e}")
        return True, None

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/shows', methods=['GET'])
def get_shows():
    """Get all TV shows with optional filters"""
    title_filter = request.args.get('title', '').strip()
    status_filter = request.args.get('status', '')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM tv_shows WHERE 1=1'
    params = []
    
    if title_filter:
        query += ' AND LOWER(title) LIKE LOWER(?)'
        params.append(f'%{title_filter}%')
    
    if status_filter:
        if status_filter == 'ended':
            query += ' AND is_ended = 1'
        elif status_filter == 'in_progress':
            query += ' AND is_ended = 0'
    
    query += ' ORDER BY created_at DESC'
    
    cursor.execute(query, params)
    shows = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in shows])

@app.route('/api/shows/<int:show_id>', methods=['GET'])
def get_show(show_id):
    """Get a single TV show by ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tv_shows WHERE id = ?', (show_id,))
    show = cursor.fetchone()
    conn.close()
    
    if show:
        return jsonify(dict(show))
    else:
        return jsonify({'error': 'TV show not found'}), 404

@app.route('/api/shows', methods=['POST'])
def create_show():
    """Create a new TV show"""
    data = request.get_json()
    
    title = data.get('title', '').strip()
    cover_image_url = data.get('cover_image_url', '').strip()
    genre = data.get('genre', '').strip()
    is_ended = data.get('is_ended', False)
    
    # Validation
    if not title or not cover_image_url or not genre:
        return jsonify({'error': 'All fields are required'}), 400
    
    if not validate_https_url(cover_image_url):
        return jsonify({'error': 'Cover image URL must be a valid HTTPS URL'}), 400
    
    # Verify show exists in IMDB
    is_valid, error_msg = verify_show_in_imdb(title)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check for duplicate title
    cursor.execute('SELECT id FROM tv_shows WHERE LOWER(title) = LOWER(?)', (title,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'A TV show with this title already exists'}), 400
    
    # Insert new show
    cursor.execute(
        'INSERT INTO tv_shows (title, cover_image_url, genre, is_ended, created_at) VALUES (?, ?, ?, ?, ?)',
        (title, cover_image_url, genre, 1 if is_ended else 0, datetime.now().isoformat())
    )
    conn.commit()
    show_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': show_id, 'message': 'TV show created successfully'}), 201

@app.route('/api/shows/<int:show_id>', methods=['PUT'])
def update_show(show_id):
    """Update an existing TV show"""
    data = request.get_json()
    
    title = data.get('title', '').strip()
    cover_image_url = data.get('cover_image_url', '').strip()
    genre = data.get('genre', '').strip()
    is_ended = data.get('is_ended', False)
    
    # Validation
    if not title or not cover_image_url or not genre:
        return jsonify({'error': 'All fields are required'}), 400
    
    if not validate_https_url(cover_image_url):
        return jsonify({'error': 'Cover image URL must be a valid HTTPS URL'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get the current title to see if it's being changed
    cursor.execute('SELECT title FROM tv_shows WHERE id = ?', (show_id,))
    result = cursor.fetchone()
    if result:
        current_title = result['title']
        # Only verify IMDB if title is being changed
        if current_title.lower() != title.lower():
            is_valid, error_msg = verify_show_in_imdb(title)
            if not is_valid:
                conn.close()
                return jsonify({'error': error_msg}), 400
    
    # Check for duplicate title (excluding current show)
    cursor.execute('SELECT id FROM tv_shows WHERE LOWER(title) = LOWER(?) AND id != ?', (title, show_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'A TV show with this title already exists'}), 400
    
    # Update show
    cursor.execute(
        'UPDATE tv_shows SET title = ?, cover_image_url = ?, genre = ?, is_ended = ? WHERE id = ?',
        (title, cover_image_url, genre, 1 if is_ended else 0, show_id)
    )
    
    # Check if any row was updated
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'TV show not found'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'TV show updated successfully'})

@app.route('/api/shows/<int:show_id>', methods=['DELETE'])
def delete_show(show_id):
    """Delete a TV show"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if show exists
    cursor.execute('SELECT id FROM tv_shows WHERE id = ?', (show_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'TV show not found'}), 404
    
    # Delete the show
    cursor.execute('DELETE FROM tv_shows WHERE id = ?', (show_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'TV show deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
