import React, { useState } from 'react';
import { ExternalLink, Calendar, Flame, Globe, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';

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

const FeaturedNews = ({ article, isBookmarked = false, onToggleBookmark }) => {
  if (!article) return null;

  const [imgSrc, setImgSrc] = useState(
    article.imageUrl ||
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80'
  );

  React.useEffect(() => {
    if (article.imageUrl) {
      setImgSrc(article.imageUrl);
    }
  }, [article.imageUrl]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-dark-border shadow-xl mb-8 group">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Image Section */}
        <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden bg-slate-800">
          <img
            src={imgSrc}
            alt={article.title}
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80'
              )
            }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-500/90 text-white backdrop-blur-md shadow-md animate-pulse-slow">
              <Flame size={14} className="fill-current" />
              <span>Top Story</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-black/60 text-white backdrop-blur-md border border-white/20">
              {article.category || 'Featured'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-slate-950 text-white z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Globe size={13} className="text-brand-400" />
                <span className="font-semibold text-slate-300">{article.source || 'Sports Network'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-white leading-snug group-hover:text-brand-300 transition-colors">
              {article.title}
            </h2>

            <p className="text-sm text-slate-300 line-clamp-4 leading-relaxed font-normal">
              {article.description ||
                'Major international athletic tournament update. Read the comprehensive breaking report, match analysis, and highlights on the verified publisher site.'}
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Read Full Article</span>
              <ExternalLink size={15} />
            </a>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(article)}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
