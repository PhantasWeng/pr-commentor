import { ExtensionSettings, DEFAULT_SETTINGS } from '../types/settings'

const STORAGE_KEY = 'pr_commentor_settings'

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const stored = result[STORAGE_KEY] as Partial<ExtensionSettings> | undefined
      resolve({ ...DEFAULT_SETTINGS, ...stored })
    })
  })
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve()
      }
    })
  })
}
