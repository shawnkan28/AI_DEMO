App Name: My Library
Framework: Python-Flask
Front-end: HTML + Javascript + Bootstrap
Database: SQLite

# Details
This application will keep a library of TV Shows that the user have watched. Users are required to key in the details of the TV Show and there is a user interface to show all the added TV Shows.

## Application Structure
- Single page application with modal popup for adding TV shows
- No separate navigation pages - all functionality on the landing page

# Landing Page
The landing page should contain a gallery of TV Shows along with the title and if the tv show has ended. There should be a cover image for each TV Show and users are allowed to filter using the title and if they tv has ended. 

There should be a button to open a modal popup for adding new TV Shows.

## UI/UX Design
- Use Bootstrap styling for all components
- Gallery should use Bootstrap card components in a responsive grid layout
- Modal should use Bootstrap modal component
- Forms should use Bootstrap form controls and validation styles
- Buttons should use Bootstrap button styles
- Filters should use Bootstrap input groups and form controls
- Show status should be indicated by Bootstrap badge tags:
  - "Ended" tag for completed shows
  - "In Progress" tag for ongoing shows

# Creation Modal
The creation modal should be a popup on the landing page with the following fields:
- Title Text Field
- Cover Image url
- checkbox to determine if the TV Show has ended.

## Data Validation
- All fields are required
- Cover Image URL must be a valid HTTPS URL (must start with https:// and follow standard URL format)
- TV Show titles must be unique - check if title already exists before creation
- Display an error message if user attempts to add a duplicate title

# Data Management
## Edit Functionality
- Users can edit existing TV shows after adding them
- Editing should open the same modal with pre-filled data
- Apply the same validation rules when updating

## Delete Functionality
- Users can delete TV shows from their library
- Should include confirmation before deleting to prevent accidental removal

# Form Behavior
- Modal should close automatically after successful submission (create or edit)
- Gallery should refresh to display the latest data after any changes
- No success or error messages required
- "Ended" checkbox state:
  - Checked = "Ended" status
  - Unchecked = "In Progress" status
- Default state of "Ended" checkbox should be unchecked (In Progress)

# Database Schema
- Track creation timestamp for each TV show entry
- Timestamp should be automatically generated when entry is created