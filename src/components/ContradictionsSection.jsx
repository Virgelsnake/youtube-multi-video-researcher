import React from 'react';
import { GitBranch, Users, Lightbulb } from 'lucide-react';

function ContradictionsSection({ contradictions, videos }) {
  if (!contradictions || contradictions.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="w-8 h-8 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Points of Debate
          </h2>
          <p className="text-slate-600">
            Where experts disagree - understanding different viewpoints
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {contradictions.map((debate, index) => (
          <div
            key={index}
            className="border-2 border-amber-200 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50"
          >
            {/* Debate Topic Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <h3 className="text-xl font-bold text-white mb-1">
                {debate.topic}
              </h3>
              {debate.debate_type && (
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  {debate.debate_type}
                </span>
              )}
            </div>

            {/* Viewpoints */}
            <div className="p-5 space-y-4">
              {debate.viewpoints && debate.viewpoints.map((viewpoint, vIdx) => (
                <div
                  key={vIdx}
                  className="p-4 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-300 transition-colors"
                >
                  {/* Position Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full font-bold text-sm">
                          {String.fromCharCode(65 + vIdx)}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-lg">
                          Viewpoint {String.fromCharCode(65 + vIdx)}
                        </h4>
                      </div>
                      <p className="text-slate-700 font-medium">
                        {viewpoint.position}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full shrink-0">
                      <Users className="w-3 h-3" />
                      {viewpoint.supporting_videos?.length || 0}/{videos.length}
                    </span>
                  </div>

                  {/* Reasoning */}
                  {viewpoint.reasoning && (
                    <div className="mt-3 pl-10">
                      <p className="text-sm text-slate-600 italic">
                        <span className="font-semibold not-italic">Reasoning:</span> {viewpoint.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Supporting Videos */}
                  {viewpoint.supporting_videos && viewpoint.supporting_videos.length > 0 && (
                    <div className="mt-3 pl-10">
                      <div className="flex flex-wrap gap-2">
                        {viewpoint.supporting_videos.map((videoIdx, idx) => {
                          const video = videos[videoIdx];
                          return (
                            <a
                              key={idx}
                              href={video?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 border border-amber-200 transition-colors"
                            >
                              Video {videoIdx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Insight */}
              {debate.insight && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-1">
                        Key Insight
                      </h5>
                      <p className="text-sm text-blue-800">
                        {debate.insight}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContradictionsSection;
