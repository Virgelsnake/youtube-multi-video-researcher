import React from 'react';
import { ExternalLink, Eye, Clock, TrendingUp, Calendar } from 'lucide-react';

function VideoCard({ video, index, highlights }) {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4">
        {/* Video Number Badge */}
        <div className="shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Link */}
          <div className="mb-3">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-slate-800 hover:text-primary-600 transition-colors inline-flex items-center gap-2 group"
            >
              <span className="line-clamp-2">{video.title}</span>
              <ExternalLink className="w-5 h-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Channel */}
          <p className="text-slate-600 mb-3">{video.channel}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(video.views)} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.duration_sec)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{video.published_at_text}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-primary-600">
                Score: {video.score?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-3">Key Highlights</h4>
              <ul className="space-y-2">
                {highlights.slice(0, 5).map((highlight, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-primary-600 font-bold shrink-0">•</span>
                    <div className="flex-1">
                      <p className="text-slate-700">{highlight.point}</p>
                      {highlight.timestamps && highlight.timestamps.length > 0 && (
                        <span className="text-slate-500 text-xs">
                          @ {highlight.timestamps.join(', ')}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
