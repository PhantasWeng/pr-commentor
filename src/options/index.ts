import { getSettings, saveSettings } from '../utils/storage'
import { ExtensionSettings, AIProvider, ResponseLanguage, OutputStyle, UILanguage, DEFAULT_MODEL } from '../types/settings'
import './options.css'

// ── Translations ──────────────────────────────────────────

const TRANSLATIONS: Record<UILanguage, Record<string, string>> = {
  english: {
    'page-title': 'Settings',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Classic token recommended — Fine-grained tokens require org admin approval. Classic tokens work immediately.',
    'github-hint': 'Scope required:',
    'create-token-link': 'Create token →',
    'ai-section': 'AI Provider',
    'provider-label': 'Provider',
    'api-key-label': 'API Key',
    'model-label': 'Model',
    'output-section': 'Output',
    'style-label': 'Style',
    'summary-title': 'PR Summary',
    'summary-desc': 'Overall summary covering all commits and testing notes',
    'per-commit-title': 'Per-commit',
    'per-commit-desc': 'Explain what each commit does, one by one',
    'response-language-label': 'Output Language',
    'custom-instructions-label': 'Custom Instructions',
    'custom-instructions-hint': 'Prepended to every prompt. Enforce conventions, format, or review focus areas.',
    'custom-instructions-placeholder': 'e.g. Always flag missing tests. Focus on security implications.',
    'save-btn': 'Save settings',
    'save-success': 'Settings saved',
    'save-error': 'Failed to save',
    'test-conn-btn': 'Test Connection',
    'test-conn-testing': 'Testing…',
    'test-conn-success': 'Connected',
    'test-conn-no-key': 'Enter an API key first',
    'scan-btn': 'Scan',
    'scan-no-key': 'Enter an API key first',
    'scan-success': '{n} models found',
    'scan-error': 'Failed to fetch models',
  },
  'traditional-chinese': {
    'page-title': '設定',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': '建議使用 Classic token — Fine-grained token 需要組織管理員審核，Classic token 可直接使用。',
    'github-hint': '需要的權限範圍：',
    'create-token-link': '建立 Token →',
    'ai-section': 'AI 提供商',
    'provider-label': '提供商',
    'api-key-label': 'API 金鑰',
    'model-label': '模型',
    'output-section': '輸出',
    'style-label': '輸出風格',
    'summary-title': 'PR 摘要',
    'summary-desc': '包含所有 commit 的整體摘要與測試注意事項',
    'per-commit-title': '逐 Commit 說明',
    'per-commit-desc': '逐一說明每個 commit 的變更內容',
    'response-language-label': '輸出語言',
    'custom-instructions-label': '自訂指令',
    'custom-instructions-hint': '加在每次 prompt 的開頭，可用來強制執行規範、格式或審查重點。',
    'custom-instructions-placeholder': '例如：必須標示缺少測試的地方。著重安全性問題。',
    'save-btn': '儲存設定',
    'save-success': '設定已儲存',
    'save-error': '儲存失敗',
    'test-conn-btn': '測試連線',
    'test-conn-testing': '測試中…',
    'test-conn-success': '連線成功',
    'test-conn-no-key': '請先填入 API 金鑰',
    'scan-btn': '掃描',
    'scan-no-key': '請先填入 API 金鑰',
    'scan-success': '找到 {n} 個模型',
    'scan-error': '無法取得模型列表',
  },
}

let currentUILang: UILanguage = 'english'

function applyTranslations(lang: UILanguage): void {
  currentUILang = lang
  const t = TRANSLATIONS[lang]

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!
    if (t[key] !== undefined) el.textContent = t[key]
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')!
    if (t[key] !== undefined) (el as HTMLInputElement | HTMLTextAreaElement).placeholder = t[key]
  })

  // Highlight active language button
  document.querySelectorAll<HTMLElement>('.lang-opt').forEach((opt) => {
    opt.classList.toggle('lang-opt--active', opt.dataset.lang === lang)
  })

  document.documentElement.lang = lang === 'traditional-chinese' ? 'zh-TW' : 'en'
}

// ── Password reveal ───────────────────────────────────────

const EYE_OPEN = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
  <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="8" cy="8" r="2.25" stroke="currentColor" stroke-width="1.5"/>
</svg>`

const EYE_OFF = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
  <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="8" cy="8" r="2.25" stroke="currentColor" stroke-width="1.5"/>
  <line x1="2.5" y1="2.5" x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

function initRevealButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.reveal-btn').forEach((btn) => {
    const input = document.getElementById(btn.dataset.target!) as HTMLInputElement | null
    if (!input) return

    btn.innerHTML = EYE_OFF

    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password'
      input.type = isHidden ? 'text' : 'password'
      btn.innerHTML = isHidden ? EYE_OPEN : EYE_OFF
      btn.setAttribute('aria-label', isHidden ? 'Hide value' : 'Show value')
    })
  })
}

// ── DOM refs ──────────────────────────────────────────────

const form = document.getElementById('settings-form') as HTMLFormElement
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement
const statusMsg = document.getElementById('status-msg') as HTMLSpanElement
const modelInput = document.getElementById('ai-model') as HTMLInputElement
const modelHint = document.getElementById('model-hint') as HTMLParagraphElement
const modelSuggestions = document.getElementById('model-suggestions') as HTMLDataListElement
const langToggle = document.getElementById('lang-toggle') as HTMLButtonElement
const testConnBtn = document.getElementById('test-conn-btn') as HTMLButtonElement
const testConnResult = document.getElementById('test-conn-result') as HTMLSpanElement
const scanModelsBtn = document.getElementById('scan-models-btn') as HTMLButtonElement
const scanResult = document.getElementById('scan-result') as HTMLParagraphElement

const MODEL_OPTIONS: Record<AIProvider, string[]> = {
  claude: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
}

// ── Model field ───────────────────────────────────────────

function updateModelField(provider: AIProvider, currentModel?: string): void {
  modelSuggestions.innerHTML = MODEL_OPTIONS[provider]
    .map((m) => `<option value="${m}">`)
    .join('')

  modelHint.textContent = `Default: ${DEFAULT_MODEL[provider]}`

  const otherProvider: AIProvider = provider === 'claude' ? 'openai' : 'claude'
  const isOtherProviderModel = MODEL_OPTIONS[otherProvider].includes(modelInput.value)
  if (!currentModel && isOtherProviderModel) {
    modelInput.value = DEFAULT_MODEL[provider]
  } else if (currentModel) {
    modelInput.value = currentModel
  }
}

// ── Load settings ─────────────────────────────────────────

async function loadSettings(): Promise<void> {
  const settings = await getSettings()

  ;(form.elements.namedItem('githubToken') as HTMLInputElement).value = settings.githubToken
  ;(form.elements.namedItem('aiApiKey') as HTMLInputElement).value = settings.aiApiKey
  ;(form.elements.namedItem('responseLanguage') as HTMLSelectElement).value = settings.responseLanguage
  ;(form.elements.namedItem('prefixPrompt') as HTMLTextAreaElement).value = settings.prefixPrompt

  form.querySelectorAll<HTMLInputElement>('input[name="aiProvider"]').forEach((r) => {
    r.checked = r.value === settings.aiProvider
  })
  form.querySelectorAll<HTMLInputElement>('input[name="outputStyle"]').forEach((r) => {
    r.checked = r.value === settings.outputStyle
  })

  updateModelField(settings.aiProvider, settings.aiModel)
  applyTranslations(settings.uiLanguage)
}

// ── Status message ────────────────────────────────────────

function showStatus(key: 'save-success' | 'save-error', isError = false): void {
  statusMsg.textContent = TRANSLATIONS[currentUILang][key]
  statusMsg.className = `status-msg ${isError ? 'status-msg--error' : 'status-msg--success'}`
  setTimeout(() => {
    statusMsg.textContent = ''
    statusMsg.className = 'status-msg'
  }, 3000)
}

// ── Language toggle ───────────────────────────────────────

langToggle.addEventListener('click', async () => {
  const next: UILanguage = currentUILang === 'english' ? 'traditional-chinese' : 'english'
  applyTranslations(next)
  // Persist immediately without waiting for Save
  const settings = await getSettings()
  await saveSettings({ ...settings, uiLanguage: next })
})

// ── Provider change ───────────────────────────────────────

form.querySelectorAll<HTMLInputElement>('input[name="aiProvider"]').forEach((radio) => {
  radio.addEventListener('change', () => updateModelField(radio.value as AIProvider))
})

// ── Save ──────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  saveBtn.disabled = true

  try {
    const formData = new FormData(form)
    const provider = (formData.get('aiProvider') as AIProvider) || 'claude'

    const settings: ExtensionSettings = {
      githubToken: (formData.get('githubToken') as string).trim(),
      aiProvider: provider,
      aiApiKey: (formData.get('aiApiKey') as string).trim(),
      aiModel: (formData.get('aiModel') as string).trim() || DEFAULT_MODEL[provider],
      responseLanguage: (formData.get('responseLanguage') as ResponseLanguage) || 'english',
      outputStyle: (formData.get('outputStyle') as OutputStyle) || 'summary',
      prefixPrompt: (formData.get('prefixPrompt') as string).trim(),
      uiLanguage: currentUILang,
    }

    await saveSettings(settings)
    showStatus('save-success')
  } catch (err) {
    const msg = err instanceof Error ? err.message : TRANSLATIONS[currentUILang]['save-error']
    statusMsg.textContent = msg
    statusMsg.className = 'status-msg status-msg--error'
    setTimeout(() => { statusMsg.textContent = ''; statusMsg.className = 'status-msg' }, 3000)
  } finally {
    saveBtn.disabled = false
  }
})

// ── Test connection ───────────────────────────────────────

function showTestResult(key: 'test-conn-success' | 'test-conn-no-key', isError = false, overrideMsg?: string): void {
  const t = TRANSLATIONS[currentUILang]
  testConnResult.textContent = overrideMsg ?? t[key]
  testConnResult.className = `test-result ${isError ? 'test-result--error' : 'test-result--success'}`
  setTimeout(() => {
    testConnResult.textContent = ''
    testConnResult.className = 'test-result'
  }, 4000)
}

testConnBtn.addEventListener('click', async () => {
  const t = TRANSLATIONS[currentUILang]
  const apiKey = (form.elements.namedItem('aiApiKey') as HTMLInputElement).value.trim()
  const provider = ([...form.querySelectorAll<HTMLInputElement>('input[name="aiProvider"]')].find((r) => r.checked)?.value ?? 'claude') as AIProvider
  const model = (form.elements.namedItem('aiModel') as HTMLInputElement).value.trim() || DEFAULT_MODEL[provider]

  if (!apiKey) {
    showTestResult('test-conn-no-key', true)
    return
  }

  testConnBtn.disabled = true
  testConnResult.textContent = t['test-conn-testing']
  testConnResult.className = 'test-result'

  try {
    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
    }
    showTestResult('test-conn-success', false)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    showTestResult('test-conn-no-key', true, msg)
  } finally {
    testConnBtn.disabled = false
  }
})

// ── Scan models ───────────────────────────────────────────

scanModelsBtn.addEventListener('click', async () => {
  const t = TRANSLATIONS[currentUILang]
  const apiKey = (form.elements.namedItem('aiApiKey') as HTMLInputElement).value.trim()
  const provider = ([...form.querySelectorAll<HTMLInputElement>('input[name="aiProvider"]')].find((r) => r.checked)?.value ?? 'claude') as AIProvider

  if (!apiKey) {
    scanResult.textContent = t['scan-no-key']
    scanResult.style.color = 'var(--error)'
    return
  }

  scanModelsBtn.disabled = true
  scanModelsBtn.classList.add('scanning')
  scanResult.textContent = ''
  scanResult.style.color = ''

  try {
    let modelIds: string[] = []

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as { data: { id: string }[] }
      modelIds = data.data.map((m) => m.id)
    } else {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as { data: { id: string }[] }
      // Filter to only chat-capable models
      modelIds = data.data
        .map((m) => m.id)
        .filter((id) => id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3'))
        .sort()
    }

    // Update datalist
    modelSuggestions.innerHTML = modelIds.map((id) => `<option value="${id}">`).join('')

    scanResult.textContent = t['scan-success'].replace('{n}', String(modelIds.length))
    scanResult.style.color = 'var(--success)'
  } catch (err) {
    const msg = err instanceof Error ? err.message : t['scan-error']
    scanResult.textContent = msg
    scanResult.style.color = 'var(--error)'
  } finally {
    scanModelsBtn.disabled = false
    scanModelsBtn.classList.remove('scanning')
  }
})

loadSettings()
initRevealButtons()
