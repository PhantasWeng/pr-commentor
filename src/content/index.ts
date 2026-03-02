import './content.css'
import { initObserver, disconnectObserver } from './observer'

function init(): void {
  const href = window.location.href
  const isPR = /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(href)
  const isCompare = /github\.com\/[^/]+\/[^/]+\/compare\//.test(href)
  if (!isPR && !isCompare) return
  initObserver()
}

// Initial load
init()

// GitHub uses Turbo Drive for SPA navigation — re-initialize on each navigation
document.addEventListener('turbo:load', () => {
  disconnectObserver()
  init()
})
