import React, { useState } from 'react';
import { ExternalLink, Calendar, Bookmark, BookmarkCheck, Globe, Trophy } from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';

const DIVERSE_FALLBACKS = {
  all: [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  ],
  football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=800&q=80',
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80',
  ],
  athletics: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
  ],
  f1: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
  ],
  olympics: [
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  ],
};

const getFallback = (category = 'all', seed = '') => {
  const pool = DIVERSE_FALLBACKS[category] || DIVERSE_FALLBACKS.all;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (!isValid(d)) return 'Recently';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (e) {
    return 'Recently';
  }
};

const NewsCard = ({ article, isBookmarked = false, onToggleBookmark }) => {
  const seed = (article.id || '') + (article.title || '');
  const [imgSrc, setImgSrc] = useState(article.imageUrl || getFallback(article.category, seed));

  // Sync state when article prop changes
  React.useEffect(() => {
    setImgSrc(article.imageUrl || getFallback(article.category, seed));
  }, [article.imageUrl, article.category, seed]);

  const handleImageError = () => {
    setImgSrc(getFallback(article.category, seed));
  };

  return (
    <article className="group bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={imgSrc}
            alt={article.title}
            onError={handleImageError}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
              {article.category || 'Sports'}
            </span>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(article)}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                  isBookmarked
                    ? 'bg-brand-500 text-white'
                    : 'bg-black/50 text-white hover:bg-black/75'
                }`}
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            )}
          </div>

          {/* Publisher Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-white/10">
            <Globe size={12} className="text-brand-400" />
            <span>{article.source || 'Sports Wire'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-2.5">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-muted font-medium">
            <Calendar size={13} />
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>

          {/* Headline */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {article.title}
          </h3>

          {/* Summary Excerpt */}
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {article.description || 'Click below to read full coverage and tournament details directly on the original publisher website.'}
          </p>
        </div>
      </div>

      {/* Footer / Read Full Article Link */}
      <div className="p-5 pt-0 mt-2 border-t border-slate-100 dark:border-dark-border/40">
        <div className="pt-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Official Source
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group/link"
          >
            <span>Read Full Article</span>
            <ExternalLink size={13} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
