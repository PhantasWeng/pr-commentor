import { parsePRUrl, parseCompareUrl } from '../utils/github-url'
import { GenerateTitleMessage, MessageResponse } from '../types/messages'

const TITLE_INJECTED_ATTR = 'data-pr-commentor-title-injected'

export const TITLE_SELECTORS = [
  'input[data-component="input"][type="text"]',  // GitHub React UI (PR edit & compare)
  'input#pull_request_title',                    // Legacy
  'input[name="pull_request[title]"]',           // Legacy
  'input[name="issue[title]"]',                  // Legacy
  'input.js-issue-title',                        // Legacy
]

export function processTitleInputs(): void {
  for (const sel of TITLE_SELECTORS) {
    document.querySelectorAll<HTMLInputElement>(sel).forEach(injectTitleButton)
  }
}

export function injectTitleButton(input: HTMLInputElement): void {
  if (input.hasAttribute(TITLE_INJECTED_ATTR)) return
  input.setAttribute(TITLE_INJECTED_ATTR, 'true')

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'pr-commentor-btn'
  btn.setAttribute('aria-label', 'Generate PR Title')
  btn.textContent = 'Generate Title'

  input.insertAdjacentElement('afterend', btn)
  btn.addEventListener('click', () => handleTitleClick(btn, input))
}

async function handleTitleClick(btn: HTMLButtonElement, input: HTMLInputElement): Promise<void> {
  const href = window.location.href

  if (!chrome.runtime?.id) {
    showError(input, 'Extension was reloaded — please refresh the page and try again.')
    return
  }

  const prInfo = parsePRUrl(href)
  const compareInfo = parseCompareUrl(href)

  if (!prInfo && !compareInfo) {
    showError(input, 'Could not parse GitHub URL. Make sure you are on a PR or compare page.')
    return
  }

  btn.disabled = true
  btn.textContent = 'Generating...'
  btn.classList.add('pr-commentor-btn--loading')

  try {
    const payload = prInfo
      ? { owner: prInfo.owner, repo: prInfo.repo, pullNumber: prInfo.pullNumber }
      : { owner: compareInfo!.owner, repo: compareInfo!.repo, base: compareInfo!.base, head: compareInfo!.head }

    const message: GenerateTitleMessage = {
      type: 'GENERATE_TITLE',
      payload,
    }

    const response: MessageResponse = await chrome.runtime.sendMessage(message)

    if (response.success) {
      input.value = response.data.trim()
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      input.focus()
    } else {
      showError(input, response.error)
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Unknown error occurred'
    const isInvalidated =
      raw.includes('Extension context invalidated') ||
      raw.includes('message port closed') ||
      raw.includes('Cannot read properties of undefined')
    showError(
      input,
      isInvalidated
        ? 'Extension was reloaded — please refresh the page and try again.'
        : raw
    )
  } finally {
    btn.disabled = false
    btn.textContent = 'Generate Title'
    btn.classList.remove('pr-commentor-btn--loading')
  }
}

function showError(input: HTMLInputElement, message: string): void {
  input.title = message
  input.style.outline = '2px solid red'
  setTimeout(() => {
    input.style.outline = ''
    input.title = ''
  }, 4000)
}
