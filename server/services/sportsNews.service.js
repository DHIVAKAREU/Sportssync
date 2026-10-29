const axios = require('axios');
const crypto = require('crypto');

// Diverse, high-resolution sport-specific action photos (never all identical)
const DIVERSE_SPORT_POOLS = {
  all: [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80', // indoor arena
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', // runner track
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', // soccer stadium
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', // basketball dunk
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80', // cricket ground
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80', // tennis court
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', // motorsport
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=80', // olympic medal
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', // badminton
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80', // athletes
  ],
  football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', // soccer night
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', // stadium crowd
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80', // football pitch
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80', // football ball
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80', // players match
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80', // soccer game
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', // corner flag
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80', // cleats grass
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', // dunk
    'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80', // basketball court
    'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80', // basketball ball
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=1200&q=80', // hoop net
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=1200&q=80', // players action
    'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=1200&q=80', // indoor court
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80', // basketball night
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80', // arena lights
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80', // cricket ground
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80', // stadium pitch
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80', // cricket ball bat
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1200&q=80', // cricket match
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80', // floodlights
    'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=1200&q=80', // pavilion
  ],
  tennis: [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80', // tennis court
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80', // tennis racket
    'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=1200&q=80', // tennis player
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80', // court net
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80', // yellow tennis ball
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', // shuttlecock
    'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1200&q=80', // badminton court
    'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=1200&q=80', // racket net
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', // arena
  ],
  athletics: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', // running track
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80', // sprinter
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80', // running trail
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80', // track lane
  ],
  f1: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', // formula race
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', // racing car
    'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80', // speed track
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', // racing apex
  ],
  olympics: [
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=80', // gold medal
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', // track athlete
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80', // stadium arena
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', // ceremony crowd
  ],
};

/**
 * Return a deterministically unique image from the sport's pool based on article seed
 */
const getDiverseFallbackImage = (category = 'all', seed = '') => {
  const pool = DIVERSE_SPORT_POOLS[category] || DIVERSE_SPORT_POOLS.all;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
};

// Supported categories definition
const CATEGORIES = [
  { id: 'all', label: 'All Sports', icon: 'Globe', description: 'Global sports headlines from major tournaments and leagues' },
  { id: 'football', label: 'Football', icon: 'Trophy', description: 'International football, Premier League, Champions League & tournaments' },
  { id: 'cricket', label: 'Cricket', icon: 'Activity', description: 'International Test, ODI, T20 and major domestic leagues' },
  { id: 'basketball', label: 'Basketball', icon: 'Award', description: 'NBA, WNBA, and collegiate basketball tournaments' },
  { id: 'tennis', label: 'Tennis', icon: 'Target', description: 'Grand Slams, ATP, WTA, and international tours' },
  { id: 'badminton', label: 'Badminton', icon: 'Feather', description: 'BWF World Tour, Thomas & Uber Cups, and championships' },
  { id: 'athletics', label: 'Athletics', icon: 'Flame', description: 'Track & field, marathons, and World Athletics championships' },
  { id: 'f1', label: 'Formula 1', icon: 'Zap', description: 'Formula 1 Grand Prix races, driver standings & motorsport news' },
  { id: 'olympics', label: 'Olympics', icon: 'Medal', description: 'Olympic Games, Paralympic coverage, and qualifiers' },
];

// In-Memory cache map
const newsCache = new Map();
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

const DEFAULT_HTTP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, application/rss+xml, application/xml, text/xml, */*',
};

/**
 * Strip HTML tags and unescape XML entities
 */
const cleanText = (str) => {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
};

/**
 * Fetch news articles with rich photo assets directly from ESPN's public Site API
 */
const fetchEspnSiteApi = async (endpoint, category) => {
  try {
    const res = await axios.get(endpoint, {
      timeout: 10000,
      headers: DEFAULT_HTTP_HEADERS,
    });

    if (!res.data || !Array.isArray(res.data.articles)) {
      return [];
    }

    return res.data.articles.map((item) => {
      const title = item.headline || item.title || '';
      const description = item.description || '';
      const url = item.links?.web?.href || item.links?.mobile?.href || 'https://www.espn.com';
      const id = String(item.id || crypto.createHash('md5').update(url || title).digest('hex'));

      // Extract high resolution real game photo
      let imageUrl = '';
      if (Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0].url || '';
      }

      if (!imageUrl) {
        imageUrl = getDiverseFallbackImage(category, id + title);
      }

      let publishedAt = new Date().toISOString();
      if (item.published) {
        const parsed = new Date(item.published);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed.toISOString();
        }
      }

      return {
        id,
        title,
        description,
        url,
        imageUrl,
        source: 'ESPN',
        publishedAt,
        category,
      };
    }).filter((a) => a.title && a.url);
  } catch (err) {
    console.warn(`[SportsNewsService] ESPN Site API fetch failed (${endpoint}): ${err.message}`);
    return [];
  }
};

/**
 * Parse an XML RSS feed into normalized article objects with images
 */
const parseRssXml = (xml, sourceName, category) => {
  const articles = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[0];

    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    // Image extractors: media:thumbnail, enclosure, media:content, img
    const thumbMatch = itemXml.match(/<media:thumbnail[^>]*\burl=["']([^"']+)["']/i);
    const enclosureMatch = itemXml.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i);
    const mediaContentMatch = itemXml.match(/<media:content[^>]*\burl=["']([^"']+)["']/i);
    const imgTagMatch = itemXml.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);

    const title = cleanText(titleMatch ? titleMatch[1] : '');
    const description = cleanText(descMatch ? descMatch[1] : '');
    let link = cleanText(linkMatch ? linkMatch[1] : '');

    if (!title || !link) continue;

    let publishedAt = new Date().toISOString();
    if (pubDateMatch && pubDateMatch[1]) {
      const parsedDate = new Date(pubDateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    let imageUrl = '';
    if (thumbMatch && thumbMatch[1]) {
      imageUrl = thumbMatch[1];
    } else if (enclosureMatch && enclosureMatch[1]) {
      imageUrl = enclosureMatch[1];
    } else if (mediaContentMatch && mediaContentMatch[1]) {
      imageUrl = mediaContentMatch[1];
    } else if (imgTagMatch && imgTagMatch[1]) {
      imageUrl = imgTagMatch[1];
    }

    // Upgrade low-res BBC thumbnail to standard 800px resolution
    if (imageUrl && imageUrl.includes('/240/')) {
      imageUrl = imageUrl.replace('/240/', '/800/');
    }

    const id = crypto.createHash('md5').update(link || title).digest('hex');

    // If still no image, pick deterministically from the sport's diverse photo pool
    if (!imageUrl || imageUrl.includes('spacer.gif')) {
      imageUrl = getDiverseFallbackImage(category, id + title);
    }

    articles.push({
      id,
      title,
      description,
      url: link,
      imageUrl,
      source: sourceName,
      publishedAt,
      category,
    });
  }

  return articles;
};

/**
 * Fetch articles using real-time sports providers tailored by category
 */
const fetchSyndicatedSportsNews = async (category = 'all') => {
  const fetchPromises = [];

  // Helper to fetch and parse an RSS feed
  const addRssFeed = (url, source, cat) => {
    fetchPromises.push(
      axios
        .get(url, { timeout: 10000, headers: DEFAULT_HTTP_HEADERS })
        .then((res) => parseRssXml(res.data, source, cat))
        .catch((err) => {
          console.warn(`[SportsNewsService] RSS feed failed for ${source} (${url}): ${err.message}`);
          return [];
        })
    );
  };

  // Helper to fetch ESPN Site API with real player/match images
  const addEspnApi = (endpoint, cat) => {
    fetchPromises.push(fetchEspnSiteApi(endpoint, cat));
  };

  if (category === 'all') {
    // Multi-sport coverage with high-res real action photos
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=15', 'all');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?limit=15', 'all');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/racing/f1/news?limit=10', 'all');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=10', 'all');
    addRssFeed('https://feeds.bbci.co.uk/sport/rss.xml', 'BBC Sport', 'all');
    addRssFeed('https://www.espncricinfo.com/rss/content/story/feeds/0.xml', 'ESPN Cricinfo', 'all');
  } else if (category === 'basketball') {
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=25', 'basketball');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/news?limit=15', 'basketball');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news?limit=15', 'basketball');
  } else if (category === 'football') {
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?limit=25', 'football');
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/news?limit=20', 'football');
    addRssFeed('https://feeds.bbci.co.uk/sport/football/rss.xml', 'BBC Sport', 'football');
  } else if (category === 'cricket') {
    addRssFeed('https://feeds.bbci.co.uk/sport/cricket/rss.xml', 'BBC Sport', 'cricket');
    addRssFeed('https://www.espncricinfo.com/rss/content/story/feeds/0.xml', 'ESPN Cricinfo', 'cricket');
  } else if (category === 'tennis') {
    addRssFeed('https://feeds.bbci.co.uk/sport/tennis/rss.xml', 'BBC Sport', 'tennis');
    addRssFeed('https://www.skysports.com/rss/12040', 'Sky Sports', 'tennis');
  } else if (category === 'badminton') {
    addRssFeed('https://feeds.bbci.co.uk/sport/other-sports/rss.xml', 'BBC Sport', 'badminton');
    addRssFeed('https://www.skysports.com/rss/12040', 'Sky Sports', 'badminton');
  } else if (category === 'athletics') {
    addRssFeed('https://feeds.bbci.co.uk/sport/athletics/rss.xml', 'BBC Sport', 'athletics');
  } else if (category === 'f1') {
    addEspnApi('https://site.api.espn.com/apis/site/v2/sports/racing/f1/news?limit=25', 'f1');
    addRssFeed('https://feeds.bbci.co.uk/sport/formula1/rss.xml', 'BBC Sport', 'f1');
  } else if (category === 'olympics') {
    addRssFeed('https://feeds.bbci.co.uk/sport/olympics/rss.xml', 'BBC Sport', 'olympics');
  }

  const results = await Promise.all(fetchPromises);
  const combined = results.flat();

  // Deduplicate articles by title and URL
  const seen = new Set();
  const deduped = [];
  for (const item of combined) {
    const key = item.title.toLowerCase().substring(0, 40);
    if (!seen.has(key) && !seen.has(item.url)) {
      seen.add(key);
      seen.add(item.url);
      deduped.push(item);
    }
  }

  // Sort descending by publication date
  deduped.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return deduped;
};

/**
 * Fetch articles from external API provider (e.g. NewsAPI / GNews / TheNewsAPI)
 * when SPORTS_NEWS_API_KEY is configured.
 */
const fetchExternalApiNews = async (category = 'all', searchQuery = '') => {
  const apiKey = process.env.SPORTS_NEWS_API_KEY;
  const baseUrl = process.env.SPORTS_NEWS_API_BASE_URL || 'https://newsapi.org/v2';
  const provider = (process.env.SPORTS_NEWS_PROVIDER || 'newsapi').toLowerCase();

  if (!apiKey) return null;

  try {
    if (provider === 'gnews') {
      const gnewsCategory = category === 'all' ? 'sports' : category;
      const gnewsUrl = `${baseUrl}/top-headlines?category=sports&q=${encodeURIComponent(category !== 'all' ? category : searchQuery)}&token=${apiKey}&lang=en`;
      const res = await axios.get(gnewsUrl, { timeout: 8000 });
      if (res.data && res.data.articles) {
        return res.data.articles.map((item) => {
          const id = crypto.createHash('md5').update(item.url || item.title).digest('hex');
          return {
            id,
            title: item.title,
            description: item.description || '',
            url: item.url,
            imageUrl: item.image || getDiverseFallbackImage(category, id + item.title),
            source: item.source?.name || 'GNews Sports',
            publishedAt: item.publishedAt || new Date().toISOString(),
            category,
          };
        });
      }
    } else {
      // Default: NewsAPI-compatible schema
      const params = {
        apiKey,
        language: 'en',
        pageSize: 40,
      };

      let endpoint = `${baseUrl}/top-headlines`;
      if (searchQuery) {
        endpoint = `${baseUrl}/everything`;
        params.q = category !== 'all' ? `${category} ${searchQuery}` : searchQuery;
      } else if (category === 'all') {
        params.category = 'sports';
      } else {
        params.category = 'sports';
        params.q = category;
      }

      const res = await axios.get(endpoint, { params, timeout: 8000 });
      if (res.data && res.data.articles) {
        return res.data.articles
          .filter((item) => item.title && item.title !== '[Removed]')
          .map((item) => {
            const id = crypto.createHash('md5').update(item.url || item.title).digest('hex');
            return {
              id,
              title: item.title,
              description: item.description || '',
              url: item.url,
              imageUrl: item.urlToImage || getDiverseFallbackImage(category, id + item.title),
              source: item.source?.name || 'Sports Wire',
              publishedAt: item.publishedAt || new Date().toISOString(),
              category,
            };
          });
      }
    }
  } catch (err) {
    console.warn(`[SportsNewsService] External API failed (${err.response?.status || err.message}). Falling back to syndicated feeds.`);
    return null;
  }

  return null;
};

/**
 * Get cached or fresh sports articles
 */
const getSportsNews = async ({ category = 'all', q = '', page = 1, limit = 9, forceRefresh = false } = {}) => {
  const normCategory = (category || 'all').toLowerCase().trim();
  const normSearch = (q || '').toLowerCase().trim();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));

  const cacheKey = `${normCategory}:${normSearch}`;
  const now = Date.now();
  const ttl = parseInt(process.env.NEWS_CACHE_TTL, 10) || DEFAULT_TTL_MS;

  let cachedItem = newsCache.get(cacheKey);

  if (forceRefresh || !cachedItem || now > cachedItem.expiresAt) {
    let articles = null;
    let providerSource = 'Syndicated Real-time Sports Feeds';

    // 1. Try external API if configured
    if (process.env.SPORTS_NEWS_API_KEY) {
      articles = await fetchExternalApiNews(normCategory, normSearch);
      if (articles && articles.length > 0) {
        providerSource = `${process.env.SPORTS_NEWS_PROVIDER || 'NewsAPI'} (Official API)`;
      }
    }

    // 2. Fallback to live multi-source feeds (ESPN Site API + BBC Sport + ESPN Cricinfo)
    if (!articles || articles.length === 0) {
      articles = await fetchSyndicatedSportsNews(normCategory);
    }

    // 3. Apply keyword search filter if provided
    if (normSearch && articles.length > 0) {
      articles = articles.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(normSearch);
        const descMatch = item.description.toLowerCase().includes(normSearch);
        return titleMatch || descMatch;
      });
    }

    cachedItem = {
      articles,
      timestamp: new Date().toISOString(),
      expiresAt: now + ttl,
      providerSource,
    };

    newsCache.set(cacheKey, cachedItem);
  }

  const allArticles = cachedItem.articles || [];
  const totalResults = allArticles.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const startIndex = (pageNum - 1) * pageSize;
  const paginatedArticles = allArticles.slice(startIndex, startIndex + pageSize);

  // Pick top featured article (first article of full list)
  const featuredArticle = allArticles.length > 0 ? allArticles[0] : null;

  return {
    articles: paginatedArticles,
    featuredArticle: pageNum === 1 ? featuredArticle : null,
    totalResults,
    totalPages,
    page: pageNum,
    limit: pageSize,
    category: normCategory,
    searchQuery: normSearch,
    lastUpdated: cachedItem.timestamp,
    cached: !forceRefresh && now <= cachedItem.expiresAt,
    providerSource: cachedItem.providerSource,
  };
};

/**
 * Clear or invalidate cache
 */
const clearNewsCache = () => {
  newsCache.clear();
};

/**
 * Return supported categories
 */
const getCategories = () => {
  return CATEGORIES;
};

module.exports = {
  getSportsNews,
  getCategories,
  clearNewsCache,
  CATEGORIES,
};
