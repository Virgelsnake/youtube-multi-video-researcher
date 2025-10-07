import React from 'react';
import { TrendingUp, Users, ExternalLink, Target, Zap, AlertTriangle } from 'lucide-react';

function ConsensusSection({ consensusPoints, themes, videos }) {
  // Use hierarchical themes if available, otherwise fall back to flat consensus points
  const useHierarchical = themes && themes.length > 0;

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {useHierarchical ? 'Strategic Insights' : 'Consensus Insights'}
          </h2>
          <p className="text-slate-600">
            {useHierarchical 
              ? 'Key themes with tactical implementations and common pitfalls'
              : 'Key points that appear across multiple videos'}
          </p>
        </div>
      </div>

      {useHierarchical ? (
        // NEW: Hierarchical Theme Display
        <div className="space-y-8">
          {themes.map((theme, index) => (
            <div
              key={index}
              className="border-2 border-primary-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Strategic Principle Header */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Target className="w-6 h-6 text-white shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {theme.strategic_principle}
                      </h3>
                      <div className="flex items-center gap-3 text-white/90 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {theme.support_count}/{videos.length} videos
                        </span>
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                          {theme.importance || 'high'} importance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Tactical Implementations */}
                {theme.tactical_implementations && theme.tactical_implementations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-slate-800">Tactical Implementations</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                      {theme.tactical_implementations.map((tactical, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-slate-800 flex-1">
                              {tactical.action}
                            </p>
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                              {tactical.support_count}/{videos.length}
                            </span>
                          </div>
                          {tactical.specifics && (
                            <p className="text-sm text-slate-600 mt-2 italic">
                              💡 {tactical.specifics}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Pitfalls */}
                {theme.common_pitfalls && theme.common_pitfalls.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-slate-800">Common Pitfalls</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                      {theme.common_pitfalls.map((pitfall, idx) => (
                        <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-slate-800 flex-1">
                              ⚠️ {pitfall.warning}
                            </p>
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full shrink-0">
                              {pitfall.support_count}/{videos.length}
                            </span>
                          </div>
                          {pitfall.consequence && (
                            <p className="text-sm text-slate-600 mt-2">
                              <span className="font-medium">Consequence:</span> {pitfall.consequence}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // LEGACY: Flat Consensus Points Display
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
      )}

      {!useHierarchical && consensusPoints.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No strong consensus points found across videos.</p>
          <p className="text-sm mt-2">Check individual video highlights below.</p>
        </div>
      )}

      {useHierarchical && themes.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No strategic themes identified across videos.</p>
          <p className="text-sm mt-2">Check individual video insights below.</p>
        </div>
      )}
    </div>
  );
}

export default ConsensusSection;
