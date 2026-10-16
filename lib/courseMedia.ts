/** Legacy database paths use form encoding: + is a space, %2B is a literal plus. */
export function courseMediaKey(storedPath: string) {
  return decodeURIComponent(storedPath.trim().replace(/^\/+/, '').replace(/\+/g, ' '));
}

/** Resolve HLS references without allowing access outside this lesson's directory. */
export function resolveLessonAsset(rootKey: string, currentKey: string, reference: string) {
  const directory = rootKey.slice(0, rootKey.lastIndexOf('/') + 1);
  const base = new URL(currentKey.split('/').map(encodeURIComponent).join('/'), 'https://lesson.invalid/');
  const resolved = new URL(reference, base);
  const key = decodeURIComponent(resolved.pathname.slice(1));
  if (resolved.origin !== base.origin || !key.startsWith(directory) || key.includes('\\') || key.split('/').some(part => part === '..' || part === '.')) {
    throw new Error('Invalid lesson asset');
  }
  return key;
}

export function rewritePlaylist(playlist: string, rewrite: (uri: string) => string) {
  return playlist.split(/\r?\n/).map(line => {
    if (!line.trim()) return line;
    if (!line.startsWith('#')) return rewrite(line.trim());
    return line.replace(/URI="([^"]+)"/g, (_, uri: string) => `URI="${rewrite(uri)}"`);
  }).join('\n');
}
