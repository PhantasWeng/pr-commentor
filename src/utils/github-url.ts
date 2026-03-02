export interface PRInfo {
  owner: string
  repo: string
  pullNumber: number
}

export function parsePRUrl(url: string): PRInfo | null {
  // Matches: https://github.com/{owner}/{repo}/pull/{number}
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
  if (!match) return null

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3], 10),
  }
}

export interface CompareInfo {
  owner: string
  repo: string
  base: string
  head: string
}

export function parseCompareUrl(url: string): CompareInfo | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/compare\/([^/.]+(?:\.[^/.]+)*)\.\.\.([^/?#]+)/)
  if (!m) return null
  return { owner: m[1], repo: m[2], base: m[3], head: m[4] }
}
