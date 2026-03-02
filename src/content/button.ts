import { parsePRUrl, parseCompareUrl } from '../utils/github-url'
import { GenerateSummaryMessage, MessageResponse } from '../types/messages'

const INJECTED_ATTR = 'data-pr-commentor-injected'

export function injectButton(toolbar: Element): void {
  if (toolbar.hasAttribute(INJECTED_ATTR)) return

  const textareaId = toolbar.getAttribute('for')
  if (!textareaId) return

  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null
  if (!textarea) return

  toolbar.setAttribute(INJECTED_ATTR, 'true')

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'pr-commentor-btn'
  button.setAttribute('aria-label', 'Generate PR Summary')
  button.textContent = 'Generate Summary'

  button.addEventListener('click', () => handleClick(button, textarea))

  // Insert at the end of the toolbar
  toolbar.appendChild(button)
}

async function handleClick(button: HTMLButtonElement, textarea: HTMLTextAreaElement): Promise<void> {
  const prInfo = parsePRUrl(window.location.href)
  const compareInfo = parseCompareUrl(window.location.href)

  if (!prInfo && !compareInfo) {
    showError(textarea, 'Could not parse GitHub URL. Make sure you are on a PR or compare page.')
    return
  }

  // Extension context becomes invalid when the extension is reloaded without refreshing the page
  if (!chrome.runtime?.id) {
    showError(textarea, 'Extension was reloaded — please refresh the page and try again.')
    return
  }

  button.disabled = true
  button.textContent = 'Generating...'
  button.classList.add('pr-commentor-btn--loading')

  try {
    const payload = prInfo
      ? { owner: prInfo.owner, repo: prInfo.repo, pullNumber: prInfo.pullNumber }
      : { owner: compareInfo!.owner, repo: compareInfo!.repo, base: compareInfo!.base, head: compareInfo!.head }

    const message: GenerateSummaryMessage = {
      type: 'GENERATE_SUMMARY',
      payload,
    }

    const response: MessageResponse = await chrome.runtime.sendMessage(message)

    if (response.success) {
      insertText(textarea, response.data)
    } else {
      showError(textarea, response.error)
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Unknown error occurred'
    const isInvalidated =
      raw.includes('Extension context invalidated') ||
      raw.includes('message port closed') ||
      raw.includes('Cannot read properties of undefined')
    showError(
      textarea,
      isInvalidated
        ? 'Extension was reloaded — please refresh the page and try again.'
        : raw
    )
  } finally {
    button.disabled = false
    button.textContent = 'Generate Summary'
    button.classList.remove('pr-commentor-btn--loading')
  }
}

function insertText(textarea: HTMLTextAreaElement, text: string): void {
  textarea.value = text
  // Dispatch events so GitHub's Stimulus controllers update their state
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  textarea.dispatchEvent(new Event('change', { bubbles: true }))
  textarea.focus()
}

function showError(textarea: HTMLTextAreaElement, message: string): void {
  // Show error inline in textarea so user can see it
  const errorText = `<!-- Error: ${message} -->`
  textarea.value = errorText
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  textarea.focus()
}
