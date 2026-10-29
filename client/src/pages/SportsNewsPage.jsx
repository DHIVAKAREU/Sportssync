import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import {
  Newspaper,
  RefreshCw,
  Clock,
  Bookmark,
  Sparkles,
  Inbox,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import FeaturedNews from '../components/news/FeaturedNews';
import NewsCard from '../components/news/NewsCard';
import SportsCategoryFilter from '../components/news/SportsCategoryFilter';
import NewsSearchBar from '../components/news/NewsSearchBar';
import NewsPagination from '../components/news/NewsPagination';
import NewsLoadingSkeleton from '../components/news/NewsLoadingSkeleton';
import NewsErrorState from '../components/news/NewsErrorState';

const SportsNewsPage = () => {
  // Navigation & View tabs: 'live' or 'bookmarks'
  const [activeTab, setActiveTab] = useState('live');

  // Categories & Filters
  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Sports' },
    { id: 'football', label: 'Football' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'athletics', label: 'Athletics' },
    { id: 'f1', label: 'Formula 1' },
    { id: 'olympics', label: 'Olympics' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [newsData, setNewsData] = useState({
    articles: [],
    featuredArticle: null,
    totalResults: 0,
    totalPages: 1,
    page: 1,
    lastUpdated: null,
    cached: false,
    providerSource: 'Live Sports Syndication',
  });
  const [bookmarks, setBookmarks] = useState([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await API.get('/sports-news/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load dynamic categories, using defaults:', err.message);
    }
  };

  // Fetch Bookmarks
  const fetchBookmarks = async () => {
    try {
      const res = await API.get('/sports-news/bookmarks');
      if (res.data?.data) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching bookmarks:', err.message);
    }
  };

  // Fetch Live Sports News
  const fetchNews = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError('');

        const params = {
          category: selectedCategory,
          page: currentPage,
          limit: 9,
        };

        if (searchQuery) {
          params.q = searchQuery;
        }

        if (isManualRefresh) {
          params.refresh = true;
        }

        const res = await API.get('/sports-news', { params });
        if (res.data?.data) {
          setNewsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch sports news:', err);
        setError(
          err.response?.data?.message ||
            'Unable to fetch live sports news. Please verify network connectivity and try refreshing.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, searchQuery, currentPage]
  );

  useEffect(() => {
    fetchCategories();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  // Handle Category selection
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  // Handle Search
  const handleSearch = (term) => {
    setSearchQuery(term);
    setCurrentPage(1);
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (article) => {
    const existing = bookmarks.find(
      (b) => b.articleId === article.id || b.url === article.url
    );

    if (existing) {
      // Remove bookmark
      try {
        await API.delete(`/sports-news/bookmarks/${existing._id || existing.articleId}`);
        setBookmarks((prev) => prev.filter((b) => b._id !== existing._id && b.articleId !== existing.articleId));
        showToast('Article removed from saved bookmarks');
      } catch (err) {
        console.error('Failed to remove bookmark:', err);
      }
    } else {
      // Add bookmark
      try {
        const payload = {
          articleId: article.id,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          source: article.source,
          publishedAt: article.publishedAt,
          category: article.category || selectedCategory,
        };
        const res = await API.post('/sports-news/bookmarks', payload);
        if (res.data?.data) {
          setBookmarks((prev) => [res.data.data, ...prev]);
          showToast('Article saved to your bookmarks!');
        }
      } catch (err) {
        console.error('Failed to save bookmark:', err);
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Format last updated timestamp
  const formatUpdatedTime = (isoString) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isArticleBookmarked = (article) => {
    return bookmarks.some(
      (b) => b.articleId === article.id || b.url === article.url
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-sm animate-bounce-subtle">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-brand-50/30 dark:from-dark-card dark:via-dark-card dark:to-slate-900 border border-slate-200/80 dark:border-dark-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Newspaper size={22} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Global Sports News
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Live international sports headlines, tournament updates, and coverage aggregated from verified global sports publishers.
          </p>
        </div>

        {/* Live Status Badges & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          {newsData.lastUpdated && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300 font-medium shadow-sm">
              <Clock size={13} className="text-brand-500" />
              <span>Updated {formatUpdatedTime(newsData.lastUpdated)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300 font-medium shadow-sm">
            <Radio size={12} className="text-emerald-500 animate-pulse" />
            <span>{newsData.cached ? 'Cached' : 'Live Feed'}</span>
          </div>

          <button
            type="button"
            disabled={refreshing || loading}
            onClick={() => fetchNews(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
            title="Refresh latest news from providers"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Live Headlines vs Bookmarks) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border/80">
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'live'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>Live Headlines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark size={16} />
            <span>Saved Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE HEADLINES */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Controls: Search Bar & Sport Category Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <NewsSearchBar
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search headlines, matches, players, teams..."
            />
          </div>

          {/* Sport Categories Filter */}
          <SportsCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            disabled={loading}
          />

          {/* Active Filter Pill indicator if searching */}
          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Showing search results for:</span>
              <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
                "{searchQuery}"
              </span>
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="text-xs text-slate-400 hover:text-rose-500 underline ml-2"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Main Content Areas */}
          {loading ? (
            <NewsLoadingSkeleton count={6} showFeatured={currentPage === 1 && !searchQuery} />
          ) : error ? (
            <NewsErrorState
              message={error}
              onRetry={() => fetchNews(true)}
              isRetrying={refreshing}
            />
          ) : newsData.articles.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border max-w-lg mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Inbox size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Articles Found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We couldn't find any news articles matching your current filter or search criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured News Hero Card (Shown only on Page 1 when not searching) */}
              {currentPage === 1 && !searchQuery && newsData.featuredArticle && (
                <FeaturedNews
                  article={newsData.featuredArticle}
                  isBookmarked={isArticleBookmarked(newsData.featuredArticle)}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {/* News Articles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData.articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isBookmarked={isArticleBookmarked(article)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <NewsPagination
                currentPage={newsData.page}
                totalPages={newsData.totalPages}
                totalResults={newsData.totalResults}
                pageSize={newsData.limit}
                onPageChange={(p) => setCurrentPage(p)}
                disabled={loading}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 2: SAVED BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {bookmarks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border max-w-lg mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Bookmark size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Bookmarks Saved Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                When you find an interesting sports article or tournament update, tap the bookmark icon on the card to save it for easy access later.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-md"
              >
                Browse Live Headlines
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((article) => (
                <NewsCard
                  key={article.articleId || article._id}
                  article={article}
                  isBookmarked={true}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SportsNewsPage;
