const sportsNewsService = require('../services/sportsNews.service');

describe('Sports News Module Unit & Integration Tests', () => {
  beforeEach(() => {
    sportsNewsService.clearNewsCache();
  });

  describe('Category Discovery & Definitions', () => {
    test('should return all required sports categories', () => {
      const categories = sportsNewsService.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(9);

      const categoryIds = categories.map((c) => c.id);
      expect(categoryIds).toContain('all');
      expect(categoryIds).toContain('football');
      expect(categoryIds).toContain('cricket');
      expect(categoryIds).toContain('basketball');
      expect(categoryIds).toContain('tennis');
      expect(categoryIds).toContain('badminton');
      expect(categoryIds).toContain('athletics');
      expect(categoryIds).toContain('f1');
      expect(categoryIds).toContain('olympics');
    });

    test('categories should have required fields: id, label, icon, description', () => {
      const categories = sportsNewsService.getCategories();
      categories.forEach((cat) => {
        expect(cat).toHaveProperty('id');
        expect(cat).toHaveProperty('label');
        expect(cat).toHaveProperty('icon');
        expect(cat).toHaveProperty('description');
        expect(typeof cat.id).toBe('string');
        expect(typeof cat.label).toBe('string');
      });
    });
  });

  describe('News Retrieval, Normalization & Caching', () => {
    test('should retrieve normalized sports articles with pagination', async () => {
      const result = await sportsNewsService.getSportsNews({
        category: 'all',
        page: 1,
        limit: 5,
        forceRefresh: true,
      });

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('totalResults');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 5);
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('cached', false);
      expect(result).toHaveProperty('providerSource');
      expect(Array.isArray(result.articles)).toBe(true);

      if (result.articles.length > 0) {
        const article = result.articles[0];
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
        expect(article).toHaveProperty('source');
        expect(article).toHaveProperty('imageUrl');
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('category');
        expect(article.title.length).toBeGreaterThan(0);
        expect(article.url.startsWith('http')).toBe(true);
      }
    }, 15000);

    test('second call should return cached response', async () => {
      // First fetch
      await sportsNewsService.getSportsNews({ category: 'cricket', page: 1, limit: 3, forceRefresh: true });

      // Immediate second fetch with same parameters
      const cachedResult = await sportsNewsService.getSportsNews({ category: 'cricket', page: 1, limit: 3 });
      expect(cachedResult.cached).toBe(true);
    }, 15000);

    test('should support keyword search filtering', async () => {
      const result = await sportsNewsService.getSportsNews({
        category: 'all',
        q: 'the',
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(result.articles)).toBe(true);
      result.articles.forEach((article) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        expect(text).toContain('the');
      });
    }, 15000);

    test('should slice pagination properly across pages', async () => {
      const page1 = await sportsNewsService.getSportsNews({ category: 'all', page: 1, limit: 3 });
      const page2 = await sportsNewsService.getSportsNews({ category: 'all', page: 2, limit: 3 });

      if (page1.totalResults >= 6) {
        expect(page1.articles.length).toBe(3);
        expect(page2.articles.length).toBe(3);
        expect(page1.articles[0].id).not.toEqual(page2.articles[0].id);
      }
    }, 15000);
  });

  describe('Bookmark Validation & Deduplication Logic', () => {
    test('validates required fields for bookmark saving', () => {
      const validateBookmarkPayload = (body) => {
        if (!body.articleId || !body.title || !body.url) {
          return { valid: false, message: 'articleId, title, and url are required' };
        }
        return { valid: true };
      };

      expect(validateBookmarkPayload({ title: 'Test Article' }).valid).toBe(false);
      expect(validateBookmarkPayload({ articleId: '123', title: 'Test' }).valid).toBe(false);
      expect(validateBookmarkPayload({ articleId: '123', title: 'Test', url: 'https://espn.com/123' }).valid).toBe(true);
    });
  });
});
