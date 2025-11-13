import sqlite3

DATABASE = 'library.db'

def migrate_add_genre():
    """Add genre column to existing tv_shows table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Check if genre column already exists
    cursor.execute("PRAGMA table_info(tv_shows)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'genre' not in columns:
        print("Adding genre column to tv_shows table...")
        # Add genre column with default value
        cursor.execute('ALTER TABLE tv_shows ADD COLUMN genre TEXT NOT NULL DEFAULT "Drama"')
        conn.commit()
        print("Genre column added successfully!")
    else:
        print("Genre column already exists.")
    
    conn.close()

if __name__ == '__main__':
    migrate_add_genre()
