import { ExtensionMessage, MessageResponse, GenerateTitlePayload } from '../types/messages'
import { GitHubPR, GitHubCommit, GitHubFile } from '../types/github'
import { OutputStyle, ResponseLanguage } from '../types/settings'
import { getSettings } from '../utils/storage'

function buildCompareApiUrl(owner: string, repo: string, base: string, head: string): string {
  return `https://api.github.com/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`
}

function getLanguageInstruction(language: ResponseLanguage): string {
  switch (language) {
    case 'traditional-chinese':
      return 'Please write the output in Traditional Chinese (繁體中文).'
    case 'simplified-chinese':
      return 'Please write the output in Simplified Chinese (简体中文).'
    case 'japanese':
      return 'Please write the output in Japanese (日本語).'
    case 'korean':
      return 'Please write the output in Korean (한국어).'
    case 'spanish':
      return 'Please write the output in Spanish (Español).'
    case 'portuguese':
      return 'Please write the output in Portuguese (Português).'
    case 'french':
      return 'Please write the output in French (Français).'
    case 'german':
      return 'Please write the output in German (Deutsch).'
    case 'italian':
      return 'Please write the output in Italian (Italiano).'
    case 'russian':
      return 'Please write the output in Russian (Русский).'
    case 'thai':
      return 'Please write the output in Thai (ไทย).'
    case 'vietnamese':
      return 'Please write the output in Vietnamese (Tiếng Việt).'
    case 'indonesian':
      return 'Please write the output in Indonesian (Bahasa Indonesia).'
    case 'turkish':
      return 'Please write the output in Turkish (Türkçe).'
    case 'dutch':
      return 'Please write the output in Dutch (Nederlands).'
    case 'english':
    default:
      return 'Please write the output in English.'
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage()
})

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: MessageResponse) => void) => {
    if (message.type === 'GENERATE_SUMMARY') {
      handleGenerateSummary(message.payload)
        .then((data) => sendResponse({ success: true, data }))
        .catch((err: Error) => sendResponse({ success: false, error: err.message }))
      return true // Keep async channel open
    }
    if (message.type === 'GENERATE_TITLE') {
      handleGenerateTitle(message.payload)
        .then((data) => sendResponse({ success: true, data }))
        .catch((err: Error) => sendResponse({ success: false, error: err.message }))
      return true
    }
    return false
  }
)

async function handleGenerateSummary(payload: {
  owner: string
  repo: string
  pullNumber?: number
  base?: string
  head?: string
}): Promise<string> {
  const settings = await getSettings()

  if (!settings.githubToken) {
    throw new Error('GitHub token not configured. Please open the extension settings.')
  }
  if (!settings.aiApiKey) {
    throw new Error('AI API key not configured. Please open the extension settings.')
  }

  const { owner, repo, pullNumber, base, head } = payload
  const headers = {
    Authorization: `Bearer ${settings.githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let pr: GitHubPR | null
  let commits: GitHubCommit[]
  let files: GitHubFile[]

  if (pullNumber !== undefined) {
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`
    console.log('[PR Commentor] Fetching PR:', baseUrl)
    ;[pr, commits, files] = await Promise.all([
      fetch(baseUrl, { headers }).then(throwIfNotOk).then((r) => r.json() as Promise<GitHubPR>),
      fetchAllCommits(baseUrl, headers),
      fetchAllFiles(baseUrl, headers),
    ])
  } else if (base !== undefined && head !== undefined) {
    const compareUrl = buildCompareApiUrl(owner, repo, base, head)
    console.log('[PR Commentor] Fetching compare:', compareUrl)
    const response = await fetch(compareUrl, { headers })
    await throwIfNotOk(response)
    const data = (await response.json()) as { commits: GitHubCommit[]; files?: GitHubFile[] }
    pr = null
    commits = data.commits
    files = data.files ?? []
  } else {
    throw new Error('Invalid payload: must provide pullNumber or base+head.')
  }

  const prompt = buildPrompt(pr, commits, files, settings.responseLanguage, settings.outputStyle, settings.prefixPrompt, base && head ? { base, head } : undefined)

  if (settings.aiProvider === 'claude') {
    return callClaude(prompt, settings.aiApiKey, settings.aiModel)
  } else {
    return callOpenAI(prompt, settings.aiApiKey, settings.aiModel)
  }
}

async function fetchAllFiles(
  baseUrl: string,
  headers: Record<string, string>
): Promise<GitHubFile[]> {
  const all: GitHubFile[] = []
  let page = 1
  const perPage = 25

  while (true) {
    const response = await fetch(`${baseUrl}/files?per_page=${perPage}&page=${page}`, { headers })
    await throwIfNotOk(response)
    const batch = (await response.json()) as GitHubFile[]
    all.push(...batch)
    if (batch.length < perPage) break
    page++
  }

  return all
}

async function fetchAllCommits(
  baseUrl: string,
  headers: Record<string, string>
): Promise<GitHubCommit[]> {
  const all: GitHubCommit[] = []
  let page = 1
  const perPage = 25

  while (true) {
    const response = await fetch(`${baseUrl}/commits?per_page=${perPage}&page=${page}`, { headers })
    await throwIfNotOk(response)
    const batch = (await response.json()) as GitHubCommit[]
    all.push(...batch)
    if (batch.length < perPage) break  // Last page
    page++
  }

  return all
}

async function throwIfNotOk(response: Response): Promise<Response> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    const msg = body.message ?? ''

    switch (response.status) {
      case 401:
        throw new Error(
          'GitHub token is invalid or expired (401). Please update it in the extension settings.'
        )
      case 403:
        throw new Error(
          'GitHub API access denied (403). Your token may have hit the rate limit, or lacks required permissions.'
        )
      case 404:
        throw new Error(
          `GitHub API 404 on: ${response.url} — ` +
          `If this is a private repo, ensure your token has "repo" scope (classic) ` +
          `or "Pull requests: Read" + "Contents: Read" (fine-grained).`
        )
      default:
        throw new Error(`GitHub API error ${response.status}: ${msg}`)
    }
  }
  return response
}

function buildPrompt(
  pr: GitHubPR | null,
  commits: GitHubCommit[],
  files: GitHubFile[],
  language: ResponseLanguage,
  outputStyle: OutputStyle,
  prefixPrompt: string,
  branchInfo?: { base: string; head: string }
): string {
  const languageInstruction = getLanguageInstruction(language)

  const customInstructions = prefixPrompt
    ? `## Custom Instructions\n${prefixPrompt}\n\n`
    : ''

  const prHeader = pr
    ? `## PR Information
- **Title**: ${pr.title}
- **Author**: ${pr.user.login}
- **Branch**: \`${pr.head.ref}\` → \`${pr.base.ref}\`
- **Changes**: +${pr.additions} / -${pr.deletions} across ${pr.changed_files} files
- **Description**: ${pr.body || '(no description provided)'}`
    : `## Branch Comparison
- **Branch**: \`${branchInfo?.head ?? 'head'}\` → \`${branchInfo?.base ?? 'base'}\``

  const fileList = files
    .slice(0, 30)
    .map((f) => {
      const diff = f.patch ? f.patch.slice(0, 500) : '(no diff available)'
      return `### ${f.filename} (+${f.additions}/-${f.deletions})\n\`\`\`diff\n${diff}\n\`\`\``
    })
    .join('\n\n')

  const preamble = `You are a helpful code reviewer.

${languageInstruction}

${customInstructions}${prHeader}`

  if (outputStyle === 'per-commit') {
    const commitDetails = commits
      .map((c, i) => {
        const [title, ...body] = c.commit.message.split('\n')
        const detail = body.filter(Boolean).join('\n').trim()
        return `### Commit ${i + 1}: ${title}${detail ? `\n${detail}` : ''}`
      })
      .join('\n\n')

    return `${preamble}

## Commits
${commitDetails}

## Changed Files (for context)
${fileList}

## Instructions
For each commit listed above, write a concise 1–2 sentence explanation of what that commit does and why. Use the commit message and the changed files as context. Format the output as:

**Commit 1: <commit title>**
<explanation>

**Commit 2: <commit title>**
<explanation>

...and so on.`
  }

  // Default: summary style
  const commitList = commits
    .map((c) => `- ${c.commit.message.split('\n')[0]}`)
    .join('\n')

  return `${preamble}

## Commits (${commits.length} total)
${commitList}

## Changed Files
${fileList}

## Instructions
Generate a PR summary with these sections:
1. **Summary** - What this PR does in 2-3 sentences
2. **All Commits** - Every commit listed above MUST appear here, grouped by theme if helpful. Do not skip or omit any commit.
3. **Testing Notes** - What reviewers should focus on testing`
}

async function handleGenerateTitle(payload: GenerateTitlePayload): Promise<string> {
  const settings = await getSettings()

  if (!settings.githubToken) {
    throw new Error('GitHub token not configured. Please open the extension settings.')
  }
  if (!settings.aiApiKey) {
    throw new Error('AI API key not configured. Please open the extension settings.')
  }

  const { owner, repo, pullNumber, base, head } = payload
  const headers = {
    Authorization: `Bearer ${settings.githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let commits: GitHubCommit[]
  let files: GitHubFile[]
  let headBranch: string

  if (pullNumber !== undefined) {
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`
    const [pr, fetchedCommits, fetchedFiles] = await Promise.all([
      fetch(baseUrl, { headers }).then(throwIfNotOk).then((r) => r.json() as Promise<GitHubPR>),
      fetchAllCommits(baseUrl, headers),
      fetchAllFiles(baseUrl, headers),
    ])
    commits = fetchedCommits
    files = fetchedFiles
    headBranch = pr.head.ref
  } else if (base !== undefined && head !== undefined) {
    const compareUrl = buildCompareApiUrl(owner, repo, base, head)
    const response = await fetch(compareUrl, { headers })
    await throwIfNotOk(response)
    const data = (await response.json()) as { commits: GitHubCommit[]; files?: GitHubFile[] }
    commits = data.commits
    files = data.files ?? []
    headBranch = head
  } else {
    throw new Error('Invalid payload: must provide pullNumber or base+head.')
  }

  const prompt = buildTitlePrompt(commits, files, headBranch, settings.responseLanguage, settings.prefixPrompt)

  if (settings.aiProvider === 'claude') {
    return callClaude(prompt, settings.aiApiKey, settings.aiModel, 100)
  } else {
    return callOpenAI(prompt, settings.aiApiKey, settings.aiModel, 100)
  }
}

function buildTitlePrompt(
  commits: GitHubCommit[],
  files: GitHubFile[],
  headBranch: string,
  language: ResponseLanguage,
  prefixPrompt: string
): string {
  const languageInstruction = getLanguageInstruction(language)

  const customInstructions = prefixPrompt
    ? `## Custom Instructions\n${prefixPrompt}\n\n`
    : ''

  const commitList = commits
    .map((c) => `- ${c.commit.message.split('\n')[0]}`)
    .join('\n')

  const fileList = files
    .slice(0, 50)
    .map((f) => `- ${f.filename} (+${f.additions}/-${f.deletions})`)
    .join('\n')

  return `You are a helpful developer assistant.

${languageInstruction}

${customInstructions}## Branch: ${headBranch}

## Commits
${commitList}

## Changed Files
${fileList}

## Instructions
Generate a concise PR title for the above changes. Return ONLY the PR title with no explanation, no markdown formatting, and no quotes. The title must be ≤72 characters, use imperative mood (e.g. "Add", "Fix", "Update"), and accurately describe the main purpose of the changes.`
}

async function callClaude(prompt: string, apiKey: string, model: string, maxTokens = 4096): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Claude API error ${response.status}: ${text}`)
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>
  }

  const textBlock = data.content.find((block) => block.type === 'text')
  if (!textBlock) throw new Error('No text content in Claude response')
  return textBlock.text
}

async function callOpenAI(prompt: string, apiKey: string, model: string, maxTokens = 4096): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`OpenAI API error ${response.status}: ${text}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('No content in OpenAI response')
  return content
}
