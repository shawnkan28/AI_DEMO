import sqlite3

DATABASE = 'library.db'

def init_database():
    """Initialize the database with the tv_shows table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Create tv_shows table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tv_shows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            cover_image_url TEXT NOT NULL,
            is_ended INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_database()
