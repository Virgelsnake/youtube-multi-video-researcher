import React, { useState } from 'react';
import { Search, Settings } from 'lucide-react';

function SearchForm({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [criteria, setCriteria] = useState({
    language: 'en',
    min_duration_sec: 360,
    max_duration_sec: 2400,
    recency_years: 3,
    exclude_shorts: true,
    require_transcript: true,
    pages_to_crawl: 2
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), criteria);
    }
  };

  const updateCriteria = (key, value) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Research Topic
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., covered calls for beginners"
              className="input-field pr-12"
              disabled={isLoading}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Min Duration (seconds)
              </label>
              <input
                type="number"
                value={criteria.min_duration_sec}
                onChange={(e) => updateCriteria('min_duration_sec', parseInt(e.target.value))}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Duration (seconds)
              </label>
              <input
                type="number"
                value={criteria.max_duration_sec}
                onChange={(e) => updateCriteria('max_duration_sec', parseInt(e.target.value))}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Recency (years)
              </label>
              <input
                type="number"
                value={criteria.recency_years}
                onChange={(e) => updateCriteria('recency_years', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pages to Crawl
              </label>
              <input
                type="number"
                value={criteria.pages_to_crawl}
                onChange={(e) => updateCriteria('pages_to_crawl', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="5"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="exclude_shorts"
                checked={criteria.exclude_shorts}
                onChange={(e) => updateCriteria('exclude_shorts', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="exclude_shorts" className="text-sm font-medium text-slate-700">
                Exclude YouTube Shorts
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="require_transcript"
                checked={criteria.require_transcript}
                onChange={(e) => updateCriteria('require_transcript', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="require_transcript" className="text-sm font-medium text-slate-700">
                Require Transcript
              </label>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Start Research
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default SearchForm;
