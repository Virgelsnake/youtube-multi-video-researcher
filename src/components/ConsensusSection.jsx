import React from 'react';
import { TrendingUp, Users, ExternalLink } from 'lucide-react';

function ConsensusSection({ consensusPoints, videos }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Consensus Insights
          </h2>
          <p className="text-slate-600">
            Key points that appear across multiple videos
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {consensusPoints.map((point, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-100"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {point.summary}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="badge-primary">
                  {point.support_count}/{videos.length} videos
                </span>
              </div>
            </div>

            {/* Supporting Videos */}
            {point.supporting_videos && point.supporting_videos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {point.supporting_videos.map((support, idx) => {
                  const videoIndex = support.index || idx;
                  const video = videos[videoIndex];
                  
                  return (
                    <a
                      key={idx}
                      href={support.url || video?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                    >
                      <span className="font-medium">
                        Video {videoIndex + 1}
                      </span>
                      {support.ts && support.ts.length > 0 && (
                        <span className="text-slate-500">
                          @ {support.ts[0]}
                        </span>
                      )}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {consensusPoints.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No strong consensus points found across videos.</p>
          <p className="text-sm mt-2">Check individual video highlights below.</p>
        </div>
      )}
    </div>
  );
}

export default ConsensusSection;
