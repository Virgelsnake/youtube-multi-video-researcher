#!/usr/bin/env python3
"""
YouTube Transcript Web Server (simple)
Save as: transcript_server.py

Install:
  pip install flask yt-dlp

Run:
  python transcript_server.py
Open:
  http://localhost:8082
"""

from flask import Flask, render_template_string, request, jsonify
import subprocess
import re
import os
import tempfile

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>YouTube Transcript Downloader</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:#fff;padding:40px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);max-width:600px;width:100%}
h1{color:#333;margin-bottom:10px;font-size:28px}
.subtitle{color:#666;margin-bottom:30px;font-size:14px}
.input-group{margin-bottom:20px}
label{display:block;margin-bottom:8px;color:#555;font-weight:500}
input[type="text"]{width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;transition:border-color .3s}
input[type="text"]:focus{outline:none;border-color:#667eea}
button{width:100%;padding:14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s}
button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 20px rgba(102,126,234,.4)}
button:active{transform:translateY(0)}
button:disabled{background:#ccc;cursor:not-allowed;transform:none}
.status{margin-top:20px;padding:12px;border-radius:8px;font-size:14px;display:none}
.status.success{background:#d4edda;color:#155724;border:1px solid #c3e6cb;display:block}
.status.error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;display:block}
.status.info{background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb;display:block}
.loader{border:3px solid #f3f3f3;border-top:3px solid #667eea;border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block;margin-right:10px}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.transcript-preview{margin-top:20px;padding:15px;background:#f8f9fa;border-radius:8px;max-height:300px;overflow-y:auto;display:none;font-size:14px;line-height:1.6;color:#333}
.download-btn{margin-top:10px;background:linear-gradient(135deg,#28a745 0%,#20c997 100%)}
.server-status{position:fixed;bottom:20px;right:20px;background:#28a745;color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,.2)}
</style>
</head>
<body>
  <div class="container">
    <h1>🎬 YouTube Transcript Downloader</h1>
    <p class="subtitle">Paste a YouTube URL to download its transcript</p>

    <div class="input-group">
      <label for="youtubeUrl">YouTube URL</label>
      <input type="text" id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>

    <button id="downloadBtn" onclick="getTranscript()">Get Transcript</button>

    <div id="status" class="status"></div>
    <div id="transcriptPreview" class="transcript-preview"></div>

    <button id="downloadFileBtn" class="download-btn" onclick="downloadFile()" style="display:none;">
      📥 Download as Text File
    </button>
  </div>

  <div class="server-status">🟢 Server Running</div>

  <script>
    let currentTranscript = null;
    let currentVideoId = null;

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = `status ${type}`;
    }

    async function getTranscript() {
      const urlInput = document.getElementById('youtubeUrl');
      const downloadBtn = document.getElementById('downloadBtn');
      const preview = document.getElementById('transcriptPreview');
      const downloadFileBtn = document.getElementById('downloadFileBtn');
      const url = urlInput.value.trim();

      if (!url) {
        showStatus('Please enter a YouTube URL', 'error');
        return;
      }

      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<span class="loader"></span>Fetching transcript...';
      preview.style.display = 'none';
      downloadFileBtn.style.display = 'none';
      showStatus('Fetching transcript from YouTube...', 'info');

      try {
        const response = await fetch('/get-transcript', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
          currentTranscript = data.transcript;
          currentVideoId = data.video_id;
          showStatus(`✅ Success! Word count: ${data.word_count}`, 'success');

          const previewText = data.transcript.substring(0, 500) + (data.transcript.length > 500 ? '...' : '');
          preview.textContent = previewText;
          preview.style.display = 'block';
          downloadFileBtn.style.display = 'block';
        } else {
          const detail = data.detail ? `\nDetails: ${data.detail}` : '';
          showStatus(`❌ ${data.error}${detail}`, 'error');
        }
      } catch (error) {
        showStatus(`❌ Error: ${error.message}`, 'error');
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = 'Get Transcript';
      }
    }

    function downloadFile() {
      if (!currentTranscript || !currentVideoId) return;
      const blob = new Blob([currentTranscript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${currentVideoId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    document.getElementById('youtubeUrl').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') getTranscript();
    });
  </script>
</body>
</html>
"""

def extract_video_id(url: str):
    """Extract video ID from various YouTube URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'^([a-zA-Z0-9_-]{11})$'
    ]
    for pattern in patterns:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    return None

def parse_srt_with_timestamps(srt: str):
    """Parse SRT and return structured data with timestamps"""
    lines = srt.splitlines()
    segments = []
    current_segment = {}
    prev_text = ""
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
        
        # Check if this is a sequence number
        if line.isdigit():
            current_segment = {'index': int(line)}
            i += 1
            
            # Next line should be timestamp
            if i < len(lines) and '-->' in lines[i]:
                timestamp_line = lines[i].strip()
                # Parse timestamp: 00:00:10,500 --> 00:00:13,000
                match = re.match(r'(\d{2}:\d{2}:\d{2}),\d+ --> (\d{2}:\d{2}:\d{2}),\d+', timestamp_line)
                if match:
                    current_segment['start'] = match.group(1)
                    current_segment['end'] = match.group(2)
                i += 1
                
                # Collect text lines until next empty line or sequence number
                text_lines = []
                while i < len(lines) and lines[i].strip() and not lines[i].strip().isdigit():
                    text_lines.append(lines[i].strip())
                    i += 1
                
                text = ' '.join(text_lines)
                # Remove consecutive duplicates
                norm = re.sub(r'\s+', ' ', text).strip()
                if norm and norm != prev_text:
                    current_segment['text'] = text
                    segments.append(current_segment)
                    prev_text = norm
        else:
            i += 1
    
    return segments

def srt_to_text_dedupe(srt: str) -> str:
    """Convert SRT to plain text and remove consecutive duplicates (legacy)"""
    segments = parse_srt_with_timestamps(srt)
    return "\n".join(seg['text'] for seg in segments if 'text' in seg)

def get_transcript(url: str):
    """Download transcript from YouTube video using yt-dlp (English + variants)"""
    video_id = extract_video_id(url)
    if not video_id:
        return {'success': False, 'error': 'Invalid YouTube URL'}

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            out_template = os.path.join(temp_dir, f"{video_id}.%(ext)s")

            # Request VTT and convert to SRT (keeps content intact but easier to parse)
            result = subprocess.run(
                [
                    'yt-dlp',
                    '--write-auto-subs',
                    '--write-subs',
                    '--sub-langs', 'en.*',
                    '--skip-download',
                    '--sub-format', 'vtt',
                    '--convert-subs', 'srt',
                    '-o', out_template,
                    url
                ],
                capture_output=True,
                text=True,
                cwd=temp_dir
            )

            if result.returncode != 0:
                return {
                    'success': False,
                    'error': 'yt-dlp failed to fetch subtitles',
                    'detail': (result.stderr or result.stdout).strip()
                }

            # Use converted SRT
            srt_candidates = [f for f in os.listdir(temp_dir) if f.endswith('.srt')]
            srt_candidates.sort()
            english_srts = [f for f in srt_candidates if f.startswith(video_id) and ('.en.' in f or '.en-' in f or f.endswith('.en.srt'))]
            srt_file = os.path.join(temp_dir, english_srts[0]) if english_srts else (os.path.join(temp_dir, srt_candidates[0]) if srt_candidates else None)

            if not srt_file:
                return {
                    'success': False,
                    'error': 'No transcripts/subtitles found for this video',
                    'detail': (result.stderr or result.stdout).strip()
                }

            with open(srt_file, 'r', encoding='utf-8') as f:
                srt_content = f.read()

            # Parse SRT with timestamps
            segments = parse_srt_with_timestamps(srt_content)
            
            # Also create plain text version for backward compatibility
            full_transcript = "\n".join(seg['text'] for seg in segments if 'text' in seg)
            word_count = len(full_transcript.split()) if full_transcript else 0

            if not full_transcript:
                return {'success': False, 'error': 'Transcript text was empty after de-dupe'}

            return {
                'success': True,
                'transcript': full_transcript,
                'segments': segments,  # NEW: Include timestamped segments
                'video_id': video_id,
                'word_count': word_count
            }

    except FileNotFoundError:
        return {'success': False, 'error': 'yt-dlp is not installed. Run: pip install yt-dlp'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/get-transcript', methods=['POST'])
def get_transcript_endpoint():
    data = request.json or {}
    url = data.get('url', '')
    result = get_transcript(url)
    return jsonify(result)

if __name__ == '__main__':
    # Default to port 8082 (overridable via PORT env var)
    port = int(os.environ.get('PORT', '8082'))
    print("=" * 60)
    print("🚀 YouTube Transcript Downloader Server")
    print("=" * 60)
    print(f"\n✅ Server starting on http://localhost:{port}")
    print("\n⏹️  Press CTRL+C to stop the server\n")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=port)
