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
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null

    const m = u.pathname.match(/^\/([^/]+)\/([^/]+)\/compare\/(.+)$/)
    if (!m) return null

    const compareSpec = m[3]
    const sep = compareSpec.indexOf('...')
    if (sep === -1) return null

    const base = decodeURIComponent(compareSpec.slice(0, sep))
    const head = decodeURIComponent(compareSpec.slice(sep + 3))
    if (!base || !head) return null

    return { owner: m[1], repo: m[2], base, head }
  } catch {
    return null
  }
}
