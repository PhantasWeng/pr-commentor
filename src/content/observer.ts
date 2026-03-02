import { injectButton } from './button'
import { injectTitleButton, processTitleInputs, TITLE_SELECTORS } from './title-button'

let observer: MutationObserver | null = null
let editClickListenerAdded = false

function processToolbars(): void {
  document.querySelectorAll('markdown-toolbar').forEach((toolbar) => {
    injectButton(toolbar)
  })
}

// GitHub's React UI shows the title input only after clicking the "Edit" button.
// Since React doesn't use `hidden` attribute toggling, we use click delegation instead.
function setupEditButtonListener(): void {
  if (editClickListenerAdded) return
  editClickListenerAdded = true

  document.addEventListener('click', (e) => {
    const target = e.target as Element
    const btn = target.closest('button')
    if (!btn) return
    // GitHub Primer React: Edit button contains a span with data-component="text" and text "Edit"
    const label = btn.querySelector('span[data-component="text"]')
    if (!label || label.textContent?.trim() !== 'Edit') return
    // Wait for React to render the input before scanning
    setTimeout(processTitleInputs, 150)
  }, { capture: true })
}

export function initObserver(): void {
  processToolbars()
  processTitleInputs()

  // Intercept Edit button clicks to catch the title input appearing in React UI
  setupEditButtonListener()

  // Watch for dynamically added toolbars (e.g. inline review comments)
  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue

        // The added node itself might be a toolbar
        if (node.tagName === 'MARKDOWN-TOOLBAR') {
          injectButton(node)
        }

        // Or it might contain toolbars as descendants
        node.querySelectorAll('markdown-toolbar').forEach((toolbar) => {
          injectButton(toolbar)
        })

        // Check for title inputs dynamically added to the page
        for (const sel of TITLE_SELECTORS) {
          if (node.matches?.(sel)) {
            injectTitleButton(node as HTMLInputElement)
          }
          node.querySelectorAll<HTMLInputElement>(sel).forEach(injectTitleButton)
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

export function disconnectObserver(): void {
  observer?.disconnect()
  observer = null
}
