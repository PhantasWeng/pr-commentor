export interface GenerateSummaryPayload {
  owner: string
  repo: string
  pullNumber?: number  // set on /pull/* pages
  base?: string        // set on /compare/* pages
  head?: string        // set on /compare/* pages
}

export interface GenerateSummaryMessage {
  type: 'GENERATE_SUMMARY'
  payload: GenerateSummaryPayload
}

export interface GenerateTitlePayload {
  owner: string
  repo: string
  pullNumber?: number   // set on /pull/* pages
  base?: string         // set on /compare/* pages
  head?: string         // set on /compare/* pages
}

export interface GenerateTitleMessage {
  type: 'GENERATE_TITLE'
  payload: GenerateTitlePayload
}

export type ExtensionMessage = GenerateSummaryMessage | GenerateTitleMessage

export interface MessageResponseSuccess {
  success: true
  data: string
}

export interface MessageResponseError {
  success: false
  error: string
}

export type MessageResponse = MessageResponseSuccess | MessageResponseError
