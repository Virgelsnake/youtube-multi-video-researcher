import React, { useState } from 'react';
import { Search, Loader2, Download, ExternalLink, Clock, Eye, TrendingUp } from 'lucide-react';
import SearchForm from './components/SearchForm';
import ResultsView from './components/ResultsView';
import { researchVideos } from './services/api';

function App() {
  const [state, setState] = useState('idle'); // idle, loading, analyzing, results
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (query, criteria) => {
    setState('loading');
    setError(null);
    setResults(null);

    try {
      console.log('Starting research...', { query, criteria });
      const data = await researchVideos(query, criteria);
      
      setState('results');
      setResults(data);
    } catch (err) {
      console.error('Research error:', err);
      setError(err.message || 'An error occurred during research');
      setState('idle');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              YouTube Multi-Video Researcher
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Find the top YouTube videos on any topic and get AI-powered consensus insights across multiple sources
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Search Form */}
        {(state === 'idle' || state === 'loading') && (
          <SearchForm 
            onSearch={handleSearch} 
            isLoading={state === 'loading'}
          />
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="card max-w-2xl mx-auto mt-8">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Researching Videos...
                </h3>
                <p className="text-slate-600">
                  This may take a minute. We're crawling YouTube, fetching transcripts, and analyzing content with AI.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>Crawling YouTube search results...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>Scoring and ranking videos...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>Fetching transcripts...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>Analyzing with AI...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'results' && results && (
          <ResultsView 
            results={results} 
            onReset={handleReset}
          />
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>Built with React, Node.js, Playwright, and OpenAI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
