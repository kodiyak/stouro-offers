export function getAvatarUrl(name: string) {
  return `https://avatar.vercel.sh/${encodeURIComponent(name.trim())}`;
}
