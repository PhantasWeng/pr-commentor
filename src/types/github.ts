export interface GitHubPR {
  number: number
  title: string
  body: string | null
  html_url: string
  state: string
  user: {
    login: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
  created_at: string
  updated_at: string
  additions: number
  deletions: number
  changed_files: number
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
}

export interface GitHubFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  patch?: string
}
