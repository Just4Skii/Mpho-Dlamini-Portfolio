/** The shelf of applications the launcher presents, mirroring the set-top box. */

export interface ShelfApp {
  id: string;
  name: string;
  kind: string;
  pinned?: boolean;
  glyph?: string;
  accent?: string;
  art?: string;
}

export const PINNED: ShelfApp[] = [
  { id: 'aerial', name: 'Aerial Views', kind: 'Streaming & Video', pinned: true, glyph: 'AV', accent: '#f59e0b' },
  { id: 'brave', name: 'Browser', kind: 'Browsers & Tools', pinned: true, glyph: 'B', accent: '#ef4444' },
  { id: 'kodi', name: 'Kodi', kind: 'Streaming & Video', pinned: true, glyph: 'K', accent: '#3b82f6' },
  { id: 'playmovies', name: 'Play Movies & TV', kind: 'Streaming & Video', pinned: true, glyph: '▶', accent: '#ef4444' },
  { id: 'youtube', name: 'YouTube', kind: 'Streaming & Video', pinned: true, glyph: '▶', accent: '#f43f5e' },
  { id: 'plex', name: 'Plex', kind: 'Media Servers', glyph: 'P', accent: '#e5a00d' },
  { id: 'spotify', name: 'Spotify', kind: 'Music & Audio', glyph: 'S', accent: '#1db954' },
];

export const ENTERTAINMENT: ShelfApp[] = [
  { id: 'netflix', name: 'Netflix', kind: 'Streaming & Video', glyph: 'N', accent: '#e50914' },
  { id: 'disney', name: 'Disney+', kind: 'Streaming & Video', glyph: 'D', accent: '#113ccf' },
  { id: 'prime', name: 'Prime Video', kind: 'Streaming & Video', glyph: 'P', accent: '#00a8e1' },
  { id: 'ytmusic', name: 'YouTube Music', kind: 'Music & Audio', glyph: 'M', accent: '#ff0033' },
  { id: 'spotify', name: 'Spotify', kind: 'Music & Audio', glyph: 'S', accent: '#1db954' },
  { id: 'kodi', name: 'Kodi', kind: 'Streaming & Video', glyph: 'K', accent: '#3b82f6' },
];

export interface Track {
  title: string;
  artist: string;
  album: string;
  length: number;
}

export const TRACKS: Track[] = [
  { title: 'Against All Odds (Take a Look at Me Now)', artist: 'Phil Collins', album: 'Face Value · 2016 Remaster', length: 252 },
  { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', length: 355 },
  { title: 'Redbone', artist: 'Childish Gambino', album: 'Awaken, My Love!', length: 327 },
  { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming', length: 244 },
  { title: 'Sinnerman', artist: 'Nina Simone', album: 'Pastel Blues', length: 601 },
];
