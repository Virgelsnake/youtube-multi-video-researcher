export function downloadMarkdown(results) {
  const { query, criteria, top5, analysis } = results;

  let markdown = `# YouTube Research Report: ${query}\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  // Criteria
  markdown += `## Search Criteria\n\n`;
  markdown += `- **Duration Range:** ${criteria.min_duration_sec}s - ${criteria.max_duration_sec}s\n`;
  markdown += `- **Recency:** Within ${criteria.recency_years} years\n`;
  markdown += `- **Exclude Shorts:** ${criteria.exclude_shorts ? 'Yes' : 'No'}\n`;
  markdown += `- **Require Transcript:** ${criteria.require_transcript ? 'Yes' : 'No'}\n\n`;

  // Consensus Points
  if (analysis?.consensus_points && analysis.consensus_points.length > 0) {
    markdown += `## Consensus Insights\n\n`;
    markdown += `Key points that appear across multiple videos:\n\n`;

    analysis.consensus_points.forEach((point, index) => {
      markdown += `### ${index + 1}. ${point.summary}\n\n`;
      markdown += `**Support:** ${point.support_count}/${top5.length} videos\n\n`;

      if (point.supporting_videos && point.supporting_videos.length > 0) {
        markdown += `**Sources:**\n`;
        point.supporting_videos.forEach(support => {
          const timestamps = support.ts && support.ts.length > 0 ? ` (@ ${support.ts.join(', ')})` : '';
          markdown += `- ${support.url || 'Video'}${timestamps}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  // Top Videos
  markdown += `## Top 5 Videos\n\n`;
  top5.forEach((video, index) => {
    markdown += `### ${index + 1}. ${video.title}\n\n`;
    markdown += `- **Channel:** ${video.channel}\n`;
    markdown += `- **URL:** ${video.url}\n`;
    markdown += `- **Views:** ${video.views.toLocaleString()}\n`;
    markdown += `- **Duration:** ${formatDuration(video.duration_sec)}\n`;
    markdown += `- **Published:** ${video.published_at_text}\n`;
    markdown += `- **Score:** ${video.score?.toFixed(1) || 'N/A'}\n\n`;

    // Highlights
    const highlights = analysis?.per_video?.[index]?.highlights || [];
    if (highlights.length > 0) {
      markdown += `**Key Highlights:**\n\n`;
      highlights.forEach(highlight => {
        const timestamps = highlight.timestamps && highlight.timestamps.length > 0 
          ? ` (@ ${highlight.timestamps.join(', ')})` 
          : '';
        markdown += `- ${highlight.point}${timestamps}\n`;
      });
      markdown += `\n`;
    }
  });

  // Download
  downloadFile(markdown, `youtube-research-${sanitizeFilename(query)}.md`, 'text/markdown');
}

export function downloadCSV(results) {
  const { query, top5, analysis } = results;

  if (!analysis?.consensus_points || analysis.consensus_points.length === 0) {
    alert('No consensus points to export');
    return;
  }

  // Build CSV header
  let csv = 'Consensus Point,';
  csv += top5.map((v, i) => `Video ${i + 1}`).join(',');
  csv += '\n';

  // Build rows
  analysis.consensus_points.forEach(point => {
    csv += `"${point.summary.replace(/"/g, '""')}",`;

    // Check which videos support this point
    const supportMap = new Array(top5.length).fill(0);
    if (point.supporting_videos) {
      point.supporting_videos.forEach(support => {
        const videoIndex = support.index || 0;
        if (videoIndex < supportMap.length) {
          supportMap[videoIndex] = 1;
        }
      });
    }

    csv += supportMap.join(',');
    csv += '\n';
  });

  downloadFile(csv, `youtube-research-matrix-${sanitizeFilename(query)}.csv`, 'text/csv');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
