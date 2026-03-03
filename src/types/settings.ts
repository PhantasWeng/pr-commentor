export type AIProvider = 'claude' | 'openai'
export type ResponseLanguage =
  | 'english'
  | 'traditional-chinese'
  | 'simplified-chinese'
  | 'japanese'
  | 'korean'
  | 'spanish'
  | 'portuguese'
  | 'french'
  | 'german'
  | 'italian'
  | 'russian'
  | 'thai'
  | 'vietnamese'
  | 'indonesian'
  | 'turkish'
  | 'dutch'
export type OutputStyle = 'summary' | 'per-commit'
export type UILanguage =
  | 'english'
  | 'traditional-chinese'
  | 'simplified-chinese'
  | 'japanese'
  | 'korean'
  | 'spanish'
  | 'portuguese'
  | 'french'
  | 'german'
  | 'italian'
  | 'russian'
  | 'thai'
  | 'vietnamese'
  | 'indonesian'
  | 'turkish'
  | 'dutch'

export interface ExtensionSettings {
  githubToken: string
  aiProvider: AIProvider
  aiApiKey: string
  aiModel: string
  responseLanguage: ResponseLanguage
  outputStyle: OutputStyle
  prefixPrompt: string
  uiLanguage: UILanguage
}

export const DEFAULT_MODEL: Record<AIProvider, string> = {
  claude: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  githubToken: '',
  aiProvider: 'claude',
  aiApiKey: '',
  aiModel: DEFAULT_MODEL.claude,
  responseLanguage: 'english',
  outputStyle: 'summary',
  prefixPrompt: '',
  uiLanguage: 'english',
}
