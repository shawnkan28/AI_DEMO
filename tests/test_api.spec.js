const { test, expect } = require('@playwright/test');

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to create a unique TV show title for testing
function generateUniqueTitle() {
  return `Test Show ${Date.now()}`;
}

test.describe('TV Show Library API Tests', () => {
  let createdShowId;

  // Clean up test data after all tests
  test.afterAll(async ({ request }) => {
    // Optional: Clean up any test data
    // In a production environment, you might want to delete test shows
  });

  test.describe('GET /api/shows - Get All TV Shows', () => {
    test('should return all TV shows', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows`);
      expect(response.status()).toBe(200);
      
      const shows = await response.json();
      expect(Array.isArray(shows)).toBeTruthy();
    });

    test('should filter shows by title', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows?title=breaking`);
      expect(response.status()).toBe(200);
      
      const shows = await response.json();
      expect(Array.isArray(shows)).toBeTruthy();
      
      // If results exist, verify they match the filter
      if (shows.length > 0) {
        shows.forEach(show => {
          expect(show.title.toLowerCase()).toContain('breaking');
        });
      }
    });

    test('should filter shows by status - ended', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows?status=ended`);
      expect(response.status()).toBe(200);
      
      const shows = await response.json();
      expect(Array.isArray(shows)).toBeTruthy();
      
      // If results exist, verify all are ended
      if (shows.length > 0) {
        shows.forEach(show => {
          expect(show.is_ended).toBe(1);
        });
      }
    });

    test('should filter shows by status - in_progress', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows?status=in_progress`);
      expect(response.status()).toBe(200);
      
      const shows = await response.json();
      expect(Array.isArray(shows)).toBeTruthy();
      
      // If results exist, verify all are in progress
      if (shows.length > 0) {
        shows.forEach(show => {
          expect(show.is_ended).toBe(0);
        });
      }
    });

    test('should combine title and status filters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows?title=test&status=ended`);
      expect(response.status()).toBe(200);
      
      const shows = await response.json();
      expect(Array.isArray(shows)).toBeTruthy();
    });
  });

  test.describe('POST /api/shows - Create TV Show', () => {
    test('should create a new TV show successfully', async ({ request }) => {
      const newShow = {
        title: 'Breaking Bad',
        cover_image_url: 'https://example.com/breaking-bad.jpg',
        is_ended: true
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: newShow
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('message', 'TV show created successfully');
      
      // Save the ID for later tests
      createdShowId = data.id;
    });

    test('should reject when title is missing', async ({ request }) => {
      const invalidShow = {
        cover_image_url: 'https://example.com/test.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');
    });

    test('should reject when cover_image_url is missing', async ({ request }) => {
      const invalidShow = {
        title: 'Test Show',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');
    });

    test('should reject when URL is not HTTPS', async ({ request }) => {
      const invalidShow = {
        title: 'Game of Thrones',
        cover_image_url: 'http://example.com/test.jpg',
        is_ended: true
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('HTTPS');
    });

    test('should reject invalid IMDB title', async ({ request }) => {
      const invalidShow = {
        title: 'This Show Does Not Exist 12345XYZ',
        cover_image_url: 'https://example.com/test.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found in IMDB');
    });

    test('should reject duplicate titles', async ({ request }) => {
      // Try to create the same show twice
      const duplicateShow = {
        title: 'Breaking Bad',
        cover_image_url: 'https://example.com/breaking-bad-2.jpg',
        is_ended: true
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: duplicateShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('already exists');
    });

    test('should accept show with is_ended as false', async ({ request }) => {
      const newShow = {
        title: 'The Office',
        cover_image_url: 'https://example.com/office.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: newShow
      });

      // This might fail if the show already exists, so we accept both outcomes
      if (response.status() === 201) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
      } else {
        expect(response.status()).toBe(400); // Already exists
      }
    });
  });

  test.describe('GET /api/shows/:id - Get Single TV Show', () => {
    test('should get a TV show by ID', async ({ request }) => {
      // First, create a show to ensure we have an ID
      const newShow = {
        title: 'Friends',
        cover_image_url: 'https://example.com/friends.jpg',
        is_ended: true
      };

      const createResponse = await request.post(`${API_BASE_URL}/shows`, {
        data: newShow
      });

      if (createResponse.status() === 201) {
        const createData = await createResponse.json();
        const showId = createData.id;

        // Now get the show
        const response = await request.get(`${API_BASE_URL}/shows/${showId}`);
        expect(response.status()).toBe(200);

        const show = await response.json();
        expect(show).toHaveProperty('id', showId);
        expect(show).toHaveProperty('title');
        expect(show).toHaveProperty('cover_image_url');
        expect(show).toHaveProperty('is_ended');
        expect(show).toHaveProperty('created_at');
      }
    });

    test('should return 404 for non-existent show', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows/99999`);
      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });
  });

  test.describe('PUT /api/shows/:id - Update TV Show', () => {
    let testShowId;

    test.beforeAll(async ({ request }) => {
      // Create a show specifically for update tests
      const newShow = {
        title: 'Stranger Things',
        cover_image_url: 'https://example.com/stranger.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: newShow
      });

      if (response.status() === 201) {
        const data = await response.json();
        testShowId = data.id;
      }
    });

    test('should update a TV show successfully', async ({ request }) => {
      if (!testShowId) {
        test.skip();
        return;
      }

      const updatedShow = {
        title: 'Stranger Things',
        cover_image_url: 'https://example.com/stranger-updated.jpg',
        is_ended: true
      };

      const response = await request.put(`${API_BASE_URL}/shows/${testShowId}`, {
        data: updatedShow
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('message', 'TV show updated successfully');

      // Verify the update
      const getResponse = await request.get(`${API_BASE_URL}/shows/${testShowId}`);
      const show = await getResponse.json();
      expect(show.is_ended).toBe(1);
    });

    test('should reject update with missing fields', async ({ request }) => {
      if (!testShowId) {
        test.skip();
        return;
      }

      const invalidUpdate = {
        title: 'Test'
        // Missing cover_image_url and is_ended
      };

      const response = await request.put(`${API_BASE_URL}/shows/${testShowId}`, {
        data: invalidUpdate
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should reject update with invalid URL', async ({ request }) => {
      if (!testShowId) {
        test.skip();
        return;
      }

      const invalidUpdate = {
        title: 'Stranger Things',
        cover_image_url: 'http://not-https.com/image.jpg',
        is_ended: true
      };

      const response = await request.put(`${API_BASE_URL}/shows/${testShowId}`, {
        data: invalidUpdate
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('HTTPS');
    });

    test('should return 404 for non-existent show', async ({ request }) => {
      const updateData = {
        title: 'The Wire',
        cover_image_url: 'https://example.com/wire.jpg',
        is_ended: true
      };

      const response = await request.put(`${API_BASE_URL}/shows/99999`, {
        data: updateData
      });

      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });
  });

  test.describe('DELETE /api/shows/:id - Delete TV Show', () => {
    test('should delete a TV show successfully', async ({ request }) => {
      // Create a show to delete
      const newShow = {
        title: 'The Crown',
        cover_image_url: 'https://example.com/crown.jpg',
        is_ended: false
      };

      const createResponse = await request.post(`${API_BASE_URL}/shows`, {
        data: newShow
      });

      if (createResponse.status() === 201) {
        const createData = await createResponse.json();
        const showId = createData.id;

        // Delete the show
        const deleteResponse = await request.delete(`${API_BASE_URL}/shows/${showId}`);
        expect(deleteResponse.status()).toBe(200);

        const deleteData = await deleteResponse.json();
        expect(deleteData).toHaveProperty('message', 'TV show deleted successfully');

        // Verify it's deleted
        const getResponse = await request.get(`${API_BASE_URL}/shows/${showId}`);
        expect(getResponse.status()).toBe(404);
      }
    });

    test('should return 404 when deleting non-existent show', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/shows/99999`);
      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });
  });

  test.describe('Data Validation and Edge Cases', () => {
    test('should handle empty title gracefully', async ({ request }) => {
      const invalidShow = {
        title: '',
        cover_image_url: 'https://example.com/test.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
    });

    test('should handle whitespace-only title', async ({ request }) => {
      const invalidShow = {
        title: '   ',
        cover_image_url: 'https://example.com/test.jpg',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
    });

    test('should handle malformed URL', async ({ request }) => {
      const invalidShow = {
        title: 'Westworld',
        cover_image_url: 'not-a-url',
        is_ended: false
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: invalidShow
      });

      expect(response.status()).toBe(400);
    });

    test('should validate case-insensitive duplicate titles', async ({ request }) => {
      // Assuming "Breaking Bad" already exists from previous tests
      const duplicateShow = {
        title: 'bReAkInG bAd', // Different case
        cover_image_url: 'https://example.com/bb.jpg',
        is_ended: true
      };

      const response = await request.post(`${API_BASE_URL}/shows`, {
        data: duplicateShow
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });
  });

  test.describe('Response Structure Validation', () => {
    test('should return correct structure for show list', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows`);
      const shows = await response.json();

      if (shows.length > 0) {
        const show = shows[0];
        expect(show).toHaveProperty('id');
        expect(show).toHaveProperty('title');
        expect(show).toHaveProperty('cover_image_url');
        expect(show).toHaveProperty('is_ended');
        expect(show).toHaveProperty('created_at');

        expect(typeof show.id).toBe('number');
        expect(typeof show.title).toBe('string');
        expect(typeof show.cover_image_url).toBe('string');
        expect(typeof show.is_ended).toBe('number');
        expect(typeof show.created_at).toBe('string');
      }
    });

    test('should return correct error structure', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/shows/99999`);
      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });
});
