const fs = require('fs');
const path = require('path');
const { inspect } = require('util');


// YouTube playlist ID for Podman Community Meetings
const PLAYLIST_ID = 'PLdYKU4HjyLFRk0SdDWvkZlGMI5OnVfTM-';
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;
const OUTPUT_FILE = path.join(__dirname, '../static/data/youtube.ts');

function parseDateFromTitle(title) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const regex = new RegExp(`(${monthNames.join('|')})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i');
  const match = title.match(regex);
  if (match) {
    const month = match[1];
    const day = match[2];
    const year = match[3];
    const dateStr = `${month} ${day}, ${year}`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return null;
}

function parseRelativeDate(relativeStr) {
  if (!relativeStr) return null;
  const match = relativeStr.match(/(\d+)\s+(day|week|month|year)s?\s+ago/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const date = new Date();
    if (unit === 'day') {
      date.setDate(date.getDate() - value);
    } else if (unit === 'week') {
      date.setDate(date.getDate() - value * 7);
    } else if (unit === 'month') {
      date.setMonth(date.getMonth() - value);
    } else if (unit === 'year') {
      date.setFullYear(date.getFullYear() - value);
    }
    return date.toISOString();
  }
  return null;
}

function findVideos(obj, videos = []) {
  if (!obj || typeof obj !== 'object') {
    return videos;
  }
  if (obj.lockupViewModel) {
    const vm = obj.lockupViewModel;
    let videoId = null;
    try {
      videoId = vm.rendererContext.commandContext.onTap.innertubeCommand.watchEndpoint.videoId;
    } catch (e) {}

    let title = null;
    try {
      title = vm.metadata.lockupMetadataViewModel.title.content;
    } catch (e) {}

    let relativePublishTime = null;
    try {
      const rows = vm.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows;
      for (const row of rows) {
        if (row.metadataParts) {
          for (const part of row.metadataParts) {
            if (part.text && part.text.content && part.text.content.includes('ago')) {
              relativePublishTime = part.text.content;
              break;
            }
          }
        }
        if (relativePublishTime) break;
      }
    } catch (e) {}

    if (videoId && title) {
      videos.push({ videoId, title, relativePublishTime });
    }
  } else {
    for (const key of Object.keys(obj)) {
      findVideos(obj[key], videos);
    }
  }
  return videos;
}

async function fetchLatestVideo() {
  console.log(`Fetching YouTube playlist from: ${PLAYLIST_URL}`);
  
  try {
    const response = await fetch(PLAYLIST_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist page: ${response.statusText}`);
    }
    
    const htmlText = await response.text();
    
    // Find ytInitialData script contents
    const startPattern = 'ytInitialData = ';
    const startIdx = htmlText.indexOf(startPattern);
    if (startIdx === -1) {
      throw new Error('Could not find ytInitialData in HTML');
    }
    
    const startJson = htmlText.indexOf('{', startIdx);
    if (startJson === -1) {
      throw new Error('Could not find JSON start in ytInitialData');
    }
    
    let braceCount = 0;
    let endJson = -1;
    for (let i = startJson; i < htmlText.length; i++) {
      const char = htmlText[i];
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endJson = i + 1;
          break;
        }
      }
    }
    
    if (endJson === -1) {
      throw new Error('Could not find matching end brace for ytInitialData JSON');
    }
    
    const jsonStr = htmlText.substring(startJson, endJson);
    const data = JSON.parse(jsonStr);
    
    const videos = findVideos(data);
    if (videos.length === 0) {
      throw new Error('No videos found in the parsed playlist data');
    }
    
    // Since the playlist is oldest-to-newest, the latest video is the last one in the list.
    const latestVideo = videos[videos.length - 1];
    
    let publishedDate = parseDateFromTitle(latestVideo.title);
    if (!publishedDate) {
      publishedDate = parseRelativeDate(latestVideo.relativePublishTime);
    }
    if (!publishedDate) {
      publishedDate = new Date().toISOString();
    }
    
    const videoData = {
      latestVideoId: latestVideo.videoId,
      title: latestVideo.title,
      published: publishedDate,
      updatedAt: new Date().toISOString()
    };
    
    // Ensure parent dir exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const fileContent = `export const youtubeData = ${inspect(videoData, { depth: null, compact: false })};\n`;
    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    console.log(`Successfully updated latest YouTube video data (TS format):`);
    console.log(`- Title: ${videoData.title}`);
    console.log(`- ID: ${videoData.latestVideoId}`);
    console.log(`- Saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error fetching/parsing YouTube data:', error);
    // Write fallback structure to prevent Docusaurus build crash if fetch fails
    const fallback = {
      latestVideoId: 'wm8IB0GcAso',
      title: 'Podman Tutorials',
      published: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!fs.existsSync(OUTPUT_FILE)) {
      const fileContent = `export const youtubeData = ${inspect(fallback, { depth: null, compact: false })};\n`;
      fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    }
    process.exit(1);
  }
}

fetchLatestVideo();
