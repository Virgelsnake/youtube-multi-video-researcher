import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import ConsensusSection from './ConsensusSection';
import QuantitativeSection from './QuantitativeSection';
import ContradictionsSection from './ContradictionsSection';
import ChatInterface from './ChatInterface';
import VideoCard from './VideoCard';
import { downloadMarkdown, downloadCSV } from '../utils/downloads';

function ResultsView({ results, onReset }) {
  const { query, top5, analysis } = results;

  const handleDownloadMarkdown = () => {
    downloadMarkdown(results);
  };

  const handleDownloadCSV = () => {
    downloadCSV(results);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          New Search
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report (MD)
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Matrix (CSV)
          </button>
        </div>
      </div>

      {/* Query Display */}
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Research Results for: <span className="text-primary-600">"{query}"</span>
        </h2>
        <p className="text-slate-600">
          Analyzed {top5.length} videos to extract consensus insights
        </p>
      </div>

      {/* Consensus Section */}
      {(analysis?.themes?.length > 0 || analysis?.consensus_points?.length > 0) && (
        <ConsensusSection 
          themes={analysis.themes}
          consensusPoints={analysis.consensus_points || []}
          videos={top5}
        />
      )}

      {/* Quantitative Section */}
      {analysis?.quantitative_consensus && analysis.quantitative_consensus.length > 0 && (
        <QuantitativeSection 
          quantitativeConsensus={analysis.quantitative_consensus}
          videos={top5}
        />
      )}

      {/* Contradictions Section */}
      {analysis?.contradictions && analysis.contradictions.length > 0 && (
        <ContradictionsSection 
          contradictions={analysis.contradictions}
          videos={top5}
        />
      )}

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Top 5 Videos
        </h2>
        <div className="space-y-4">
          {top5.map((video, index) => (
            <VideoCard
              key={video.url}
              video={video}
              index={index}
              highlights={analysis?.per_video?.[index]?.highlights || []}
            />
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface results={results} />
    </div>
  );
}

export default ResultsView;
