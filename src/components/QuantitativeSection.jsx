import React from 'react';
import { BarChart3, Users } from 'lucide-react';

function QuantitativeSection({ quantitativeConsensus, videos }) {
  if (!quantitativeConsensus || quantitativeConsensus.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            By The Numbers
          </h2>
          <p className="text-slate-600">
            Specific metrics and parameters mentioned across videos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quantitativeConsensus.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 hover:border-emerald-300 transition-colors"
          >
            {/* Metric Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {item.metric}
              </h3>
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                <Users className="w-3 h-3" />
                {item.support_count}/{videos.length}
              </span>
            </div>

            {/* Consensus Value */}
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-emerald-300">
                <span className="text-2xl font-bold text-emerald-700">
                  {item.consensus}
                </span>
              </div>
            </div>

            {/* All Values Mentioned */}
            {item.values && item.values.length > 1 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 mb-1">All values mentioned:</p>
                <div className="flex flex-wrap gap-1">
                  {item.values.map((value, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-white text-slate-700 rounded border border-emerald-200"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Context */}
            {item.context && (
              <p className="text-sm text-slate-600 italic">
                {item.context}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuantitativeSection;
