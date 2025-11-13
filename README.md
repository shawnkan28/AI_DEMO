# My Library

A web application for tracking and managing your personal TV show collection.

## Overview

My Library is a Python Flask-based web application that allows users to maintain a personal library of TV shows they've watched. The application provides an intuitive interface to add new shows, view your collection, and filter through your watched content.

## Technology Stack

- **Backend**: Python with Flask framework
- **Frontend**: HTML, JavaScript, and Bootstrap
- **Database**: SQLite

## Features

### Landing Page
- **Gallery View**: Browse your TV show collection in an organized gallery layout
- **Show Information**: Each entry displays:
  - Cover image of the TV show
  - Title
  - Status indicator (ongoing or ended)
- **Filtering Options**: 
  - Filter by title
  - Filter by show status (ended/ongoing)

### Creation Page
Add new TV shows to your library with the following fields:
- **Title**: Text field for the show name
- **Cover Image URL**: Link to the show's cover image
- **Status**: Checkbox to indicate if the TV show has ended

## Project Purpose

This project serves as a demonstration of using GitHub Copilot to generate a full-stack web application from a specifications document. It showcases how AI-assisted development can accelerate the creation of functional web applications while maintaining code quality and best practices.

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shawnkan28/AI_DEMO.git
cd AI_DEMO
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

4. Install required packages:
```bash
pip install flask
```

5. Initialize the database:
```bash
python init_db.py
```

### Running the Application

1. Start the Flask development server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

3. To stop the server, press `Ctrl+C` in the terminal.

### Development Mode

For development with auto-reload enabled:
```bash
flask --app app run --debug
```

## Future Enhancements

- User authentication
- Rating system
- Episode tracking
- Genre categorization
- Search functionality with advanced filters
- Export/Import library data

## License

(To be determined)
