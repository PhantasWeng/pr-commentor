import { getSettings, saveSettings } from '../utils/storage'
import { ExtensionSettings, AIProvider, ResponseLanguage, OutputStyle, UILanguage, DEFAULT_MODEL } from '../types/settings'
import './options.css'

// ── Translations ──────────────────────────────────────────

const EN_TRANSLATIONS = {
  'page-title': 'Settings',
  'ui-language-label': 'UI Language',
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
} as const

type TranslationKey = keyof typeof EN_TRANSLATIONS

const UI_LANGUAGE_OPTIONS: Array<{ value: UILanguage; label: string; locale: string }> = [
  { value: 'english', label: 'English', locale: 'en' },
  { value: 'traditional-chinese', label: '繁體中文', locale: 'zh-TW' },
  { value: 'simplified-chinese', label: '简体中文', locale: 'zh-CN' },
  { value: 'japanese', label: '日本語', locale: 'ja' },
  { value: 'korean', label: '한국어', locale: 'ko' },
  { value: 'spanish', label: 'Español', locale: 'es' },
  { value: 'portuguese', label: 'Português', locale: 'pt' },
  { value: 'french', label: 'Français', locale: 'fr' },
  { value: 'german', label: 'Deutsch', locale: 'de' },
  { value: 'italian', label: 'Italiano', locale: 'it' },
  { value: 'russian', label: 'Русский', locale: 'ru' },
  { value: 'thai', label: 'ไทย', locale: 'th' },
  { value: 'vietnamese', label: 'Tiếng Việt', locale: 'vi' },
  { value: 'indonesian', label: 'Bahasa Indonesia', locale: 'id' },
  { value: 'turkish', label: 'Türkçe', locale: 'tr' },
  { value: 'dutch', label: 'Nederlands', locale: 'nl' },
]

const TRANSLATIONS: Record<UILanguage, Record<TranslationKey, string>> = {
  english: EN_TRANSLATIONS,
  'traditional-chinese': {
    'page-title': '設定',
    'ui-language-label': '介面語言',
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
  'simplified-chinese': {
    'page-title': '设置',
    'ui-language-label': '界面语言',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': '建议使用 Classic token — Fine-grained token 需要组织管理员审批，Classic token 可立即使用。',
    'github-hint': '所需权限范围：',
    'create-token-link': '创建 Token →',
    'ai-section': 'AI 提供商',
    'provider-label': '提供商',
    'api-key-label': 'API 密钥',
    'model-label': '模型',
    'output-section': '输出',
    'style-label': '输出风格',
    'summary-title': 'PR 摘要',
    'summary-desc': '包含所有 commit 的整体摘要与测试注意事项',
    'per-commit-title': '逐 Commit 说明',
    'per-commit-desc': '逐一说明每个 commit 的变更内容',
    'response-language-label': '输出语言',
    'custom-instructions-label': '自定义指令',
    'custom-instructions-hint': '会加在每次 prompt 开头，可用于强制规范、格式或审查重点。',
    'custom-instructions-placeholder': '例如：必须标记缺少测试的地方，重点关注安全风险。',
    'save-btn': '保存设置',
    'save-success': '设置已保存',
    'save-error': '保存失败',
    'test-conn-btn': '测试连接',
    'test-conn-testing': '测试中…',
    'test-conn-success': '连接成功',
    'test-conn-no-key': '请先输入 API 密钥',
    'scan-btn': '扫描',
    'scan-no-key': '请先输入 API 密钥',
    'scan-success': '找到 {n} 个模型',
    'scan-error': '获取模型列表失败',
  },
  japanese: {
    'page-title': '設定',
    'ui-language-label': 'UI言語',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Classic token を推奨します。Fine-grained token は組織管理者の承認が必要です。Classic token はすぐに利用できます。',
    'github-hint': '必要なスコープ:',
    'create-token-link': 'トークンを作成 →',
    'ai-section': 'AI プロバイダー',
    'provider-label': 'プロバイダー',
    'api-key-label': 'API キー',
    'model-label': 'モデル',
    'output-section': '出力',
    'style-label': 'スタイル',
    'summary-title': 'PR 要約',
    'summary-desc': 'すべてのコミットとテスト観点を含む全体要約',
    'per-commit-title': 'コミットごと',
    'per-commit-desc': '各コミットの内容を1つずつ説明',
    'response-language-label': '出力言語',
    'custom-instructions-label': 'カスタム指示',
    'custom-instructions-hint': '毎回のプロンプト先頭に追加します。規約、形式、レビュー観点を指定できます。',
    'custom-instructions-placeholder': '例: テスト不足は必ず指摘し、セキュリティ影響を重視する。',
    'save-btn': '設定を保存',
    'save-success': '設定を保存しました',
    'save-error': '保存に失敗しました',
    'test-conn-btn': '接続テスト',
    'test-conn-testing': 'テスト中…',
    'test-conn-success': '接続成功',
    'test-conn-no-key': '先に API キーを入力してください',
    'scan-btn': 'スキャン',
    'scan-no-key': '先に API キーを入力してください',
    'scan-success': '{n} 件のモデルを検出',
    'scan-error': 'モデルの取得に失敗しました',
  },
  korean: {
    'page-title': '설정',
    'ui-language-label': 'UI 언어',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Classic token 사용을 권장합니다. Fine-grained token은 조직 관리자 승인이 필요하며, Classic token은 즉시 사용할 수 있습니다.',
    'github-hint': '필수 권한 범위:',
    'create-token-link': '토큰 만들기 →',
    'ai-section': 'AI 제공자',
    'provider-label': '제공자',
    'api-key-label': 'API 키',
    'model-label': '모델',
    'output-section': '출력',
    'style-label': '스타일',
    'summary-title': 'PR 요약',
    'summary-desc': '모든 커밋과 테스트 포인트를 포함한 전체 요약',
    'per-commit-title': '커밋별',
    'per-commit-desc': '각 커밋 변경 내용을 하나씩 설명',
    'response-language-label': '출력 언어',
    'custom-instructions-label': '사용자 지침',
    'custom-instructions-hint': '매 프롬프트 앞에 추가됩니다. 규칙, 형식, 리뷰 초점을 지정할 수 있습니다.',
    'custom-instructions-placeholder': '예: 누락된 테스트를 반드시 표시하고 보안 영향을 우선으로 검토.',
    'save-btn': '설정 저장',
    'save-success': '설정이 저장되었습니다',
    'save-error': '저장에 실패했습니다',
    'test-conn-btn': '연결 테스트',
    'test-conn-testing': '테스트 중…',
    'test-conn-success': '연결됨',
    'test-conn-no-key': '먼저 API 키를 입력하세요',
    'scan-btn': '스캔',
    'scan-no-key': '먼저 API 키를 입력하세요',
    'scan-success': '{n}개 모델을 찾았습니다',
    'scan-error': '모델 목록을 가져오지 못했습니다',
  },
  spanish: {
    'page-title': 'Configuración',
    'ui-language-label': 'Idioma de la interfaz',
    'github-section': 'GitHub',
    'github-token-label': 'Token de acceso personal',
    'callout-text': 'Se recomienda usar un token Classic. Los tokens Fine-grained requieren aprobación del admin de la organización; los Classic funcionan de inmediato.',
    'github-hint': 'Alcance requerido:',
    'create-token-link': 'Crear token →',
    'ai-section': 'Proveedor de IA',
    'provider-label': 'Proveedor',
    'api-key-label': 'Clave API',
    'model-label': 'Modelo',
    'output-section': 'Salida',
    'style-label': 'Estilo',
    'summary-title': 'Resumen de PR',
    'summary-desc': 'Resumen general de todos los commits y notas de prueba',
    'per-commit-title': 'Por commit',
    'per-commit-desc': 'Explica qué hace cada commit, uno por uno',
    'response-language-label': 'Idioma de salida',
    'custom-instructions-label': 'Instrucciones personalizadas',
    'custom-instructions-hint': 'Se agrega al inicio de cada prompt. Úsalo para imponer convenciones, formato o focos de revisión.',
    'custom-instructions-placeholder': 'p. ej. Marca siempre las pruebas faltantes. Enfócate en implicaciones de seguridad.',
    'save-btn': 'Guardar configuración',
    'save-success': 'Configuración guardada',
    'save-error': 'No se pudo guardar',
    'test-conn-btn': 'Probar conexión',
    'test-conn-testing': 'Probando…',
    'test-conn-success': 'Conectado',
    'test-conn-no-key': 'Primero ingresa una clave API',
    'scan-btn': 'Escanear',
    'scan-no-key': 'Primero ingresa una clave API',
    'scan-success': '{n} modelos encontrados',
    'scan-error': 'No se pudieron obtener los modelos',
  },
  portuguese: {
    'page-title': 'Configurações',
    'ui-language-label': 'Idioma da interface',
    'github-section': 'GitHub',
    'github-token-label': 'Token de acesso pessoal',
    'callout-text': 'Recomendamos usar token Classic. Tokens Fine-grained exigem aprovação do admin da organização; tokens Classic funcionam imediatamente.',
    'github-hint': 'Escopo necessário:',
    'create-token-link': 'Criar token →',
    'ai-section': 'Provedor de IA',
    'provider-label': 'Provedor',
    'api-key-label': 'Chave de API',
    'model-label': 'Modelo',
    'output-section': 'Saída',
    'style-label': 'Estilo',
    'summary-title': 'Resumo do PR',
    'summary-desc': 'Resumo geral cobrindo todos os commits e notas de teste',
    'per-commit-title': 'Por commit',
    'per-commit-desc': 'Explique o que cada commit faz, um por um',
    'response-language-label': 'Idioma de saída',
    'custom-instructions-label': 'Instruções personalizadas',
    'custom-instructions-hint': 'Adicionado ao início de cada prompt. Defina convenções, formato ou foco de revisão.',
    'custom-instructions-placeholder': 'ex.: Sempre sinalize testes ausentes. Foque em impactos de segurança.',
    'save-btn': 'Salvar configurações',
    'save-success': 'Configurações salvas',
    'save-error': 'Falha ao salvar',
    'test-conn-btn': 'Testar conexão',
    'test-conn-testing': 'Testando…',
    'test-conn-success': 'Conectado',
    'test-conn-no-key': 'Digite uma chave de API primeiro',
    'scan-btn': 'Escanear',
    'scan-no-key': 'Digite uma chave de API primeiro',
    'scan-success': '{n} modelos encontrados',
    'scan-error': 'Falha ao buscar modelos',
  },
  french: {
    'page-title': 'Paramètres',
    'ui-language-label': 'Langue de l’interface',
    'github-section': 'GitHub',
    'github-token-label': 'Jeton d’accès personnel',
    'callout-text': 'Le token Classic est recommandé. Les tokens Fine-grained nécessitent une approbation admin; les tokens Classic fonctionnent immédiatement.',
    'github-hint': 'Portée requise :',
    'create-token-link': 'Créer un token →',
    'ai-section': 'Fournisseur IA',
    'provider-label': 'Fournisseur',
    'api-key-label': 'Clé API',
    'model-label': 'Modèle',
    'output-section': 'Sortie',
    'style-label': 'Style',
    'summary-title': 'Résumé de PR',
    'summary-desc': 'Résumé global couvrant tous les commits et les notes de test',
    'per-commit-title': 'Par commit',
    'per-commit-desc': 'Explique ce que fait chaque commit, un par un',
    'response-language-label': 'Langue de sortie',
    'custom-instructions-label': 'Instructions personnalisées',
    'custom-instructions-hint': 'Ajouté au début de chaque prompt. Imposer des conventions, un format ou des axes de revue.',
    'custom-instructions-placeholder': 'ex. Signaler toujours les tests manquants. Se concentrer sur la sécurité.',
    'save-btn': 'Enregistrer',
    'save-success': 'Paramètres enregistrés',
    'save-error': 'Échec de l’enregistrement',
    'test-conn-btn': 'Tester la connexion',
    'test-conn-testing': 'Test en cours…',
    'test-conn-success': 'Connecté',
    'test-conn-no-key': 'Saisissez d’abord une clé API',
    'scan-btn': 'Scanner',
    'scan-no-key': 'Saisissez d’abord une clé API',
    'scan-success': '{n} modèles trouvés',
    'scan-error': 'Impossible de récupérer les modèles',
  },
  german: {
    'page-title': 'Einstellungen',
    'ui-language-label': 'Oberflächensprache',
    'github-section': 'GitHub',
    'github-token-label': 'Persönlicher Access Token',
    'callout-text': 'Classic-Token wird empfohlen. Fine-grained-Token benötigen die Freigabe eines Org-Admins; Classic-Token funktionieren sofort.',
    'github-hint': 'Erforderlicher Scope:',
    'create-token-link': 'Token erstellen →',
    'ai-section': 'KI-Anbieter',
    'provider-label': 'Anbieter',
    'api-key-label': 'API-Schlüssel',
    'model-label': 'Modell',
    'output-section': 'Ausgabe',
    'style-label': 'Stil',
    'summary-title': 'PR-Zusammenfassung',
    'summary-desc': 'Gesamtzusammenfassung aller Commits inkl. Testhinweisen',
    'per-commit-title': 'Pro Commit',
    'per-commit-desc': 'Erklärt nacheinander, was jeder Commit macht',
    'response-language-label': 'Ausgabesprache',
    'custom-instructions-label': 'Benutzerdefinierte Anweisungen',
    'custom-instructions-hint': 'Wird jedem Prompt vorangestellt. Für Konventionen, Format oder Review-Fokus.',
    'custom-instructions-placeholder': 'z. B. Fehlende Tests immer markieren. Auf Sicherheitsauswirkungen fokussieren.',
    'save-btn': 'Einstellungen speichern',
    'save-success': 'Einstellungen gespeichert',
    'save-error': 'Speichern fehlgeschlagen',
    'test-conn-btn': 'Verbindung testen',
    'test-conn-testing': 'Wird getestet…',
    'test-conn-success': 'Verbunden',
    'test-conn-no-key': 'Bitte zuerst API-Schlüssel eingeben',
    'scan-btn': 'Scannen',
    'scan-no-key': 'Bitte zuerst API-Schlüssel eingeben',
    'scan-success': '{n} Modelle gefunden',
    'scan-error': 'Modelle konnten nicht geladen werden',
  },
  italian: {
    'page-title': 'Impostazioni',
    'ui-language-label': 'Lingua interfaccia',
    'github-section': 'GitHub',
    'github-token-label': 'Token di accesso personale',
    'callout-text': 'Consigliato il token Classic. I token Fine-grained richiedono approvazione admin; i token Classic funzionano subito.',
    'github-hint': 'Scope richiesto:',
    'create-token-link': 'Crea token →',
    'ai-section': 'Provider AI',
    'provider-label': 'Provider',
    'api-key-label': 'Chiave API',
    'model-label': 'Modello',
    'output-section': 'Output',
    'style-label': 'Stile',
    'summary-title': 'Riepilogo PR',
    'summary-desc': 'Riepilogo generale con tutti i commit e note di test',
    'per-commit-title': 'Per commit',
    'per-commit-desc': 'Spiega cosa fa ogni commit, uno per uno',
    'response-language-label': 'Lingua di output',
    'custom-instructions-label': 'Istruzioni personalizzate',
    'custom-instructions-hint': 'Aggiunte all’inizio di ogni prompt. Imposta convenzioni, formato o focus di review.',
    'custom-instructions-placeholder': 'es. Segnala sempre i test mancanti. Concentrati sugli impatti di sicurezza.',
    'save-btn': 'Salva impostazioni',
    'save-success': 'Impostazioni salvate',
    'save-error': 'Salvataggio non riuscito',
    'test-conn-btn': 'Test connessione',
    'test-conn-testing': 'Test in corso…',
    'test-conn-success': 'Connesso',
    'test-conn-no-key': 'Inserisci prima una chiave API',
    'scan-btn': 'Scansiona',
    'scan-no-key': 'Inserisci prima una chiave API',
    'scan-success': '{n} modelli trovati',
    'scan-error': 'Impossibile recuperare i modelli',
  },
  russian: {
    'page-title': 'Настройки',
    'ui-language-label': 'Язык интерфейса',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Рекомендуется Classic token. Fine-grained token требует одобрения администратора организации; Classic token работает сразу.',
    'github-hint': 'Требуемые права:',
    'create-token-link': 'Создать токен →',
    'ai-section': 'Провайдер ИИ',
    'provider-label': 'Провайдер',
    'api-key-label': 'API-ключ',
    'model-label': 'Модель',
    'output-section': 'Вывод',
    'style-label': 'Стиль',
    'summary-title': 'Сводка PR',
    'summary-desc': 'Общая сводка по всем коммитам и заметкам по тестированию',
    'per-commit-title': 'По коммитам',
    'per-commit-desc': 'Объяснить по очереди, что делает каждый коммит',
    'response-language-label': 'Язык вывода',
    'custom-instructions-label': 'Пользовательские инструкции',
    'custom-instructions-hint': 'Добавляются в начало каждого prompt. Задайте формат, правила или фокус ревью.',
    'custom-instructions-placeholder': 'напр.: Всегда отмечай отсутствие тестов. Фокус на рисках безопасности.',
    'save-btn': 'Сохранить настройки',
    'save-success': 'Настройки сохранены',
    'save-error': 'Не удалось сохранить',
    'test-conn-btn': 'Проверить подключение',
    'test-conn-testing': 'Проверка…',
    'test-conn-success': 'Подключено',
    'test-conn-no-key': 'Сначала введите API-ключ',
    'scan-btn': 'Сканировать',
    'scan-no-key': 'Сначала введите API-ключ',
    'scan-success': 'Найдено моделей: {n}',
    'scan-error': 'Не удалось получить список моделей',
  },
  thai: {
    'page-title': 'การตั้งค่า',
    'ui-language-label': 'ภาษาหน้าอินเทอร์เฟซ',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'แนะนำให้ใช้ Classic token ส่วน Fine-grained token ต้องได้รับอนุมัติจากผู้ดูแลองค์กร และ Classic token ใช้งานได้ทันที',
    'github-hint': 'ขอบเขตสิทธิ์ที่ต้องใช้:',
    'create-token-link': 'สร้างโทเคน →',
    'ai-section': 'ผู้ให้บริการ AI',
    'provider-label': 'ผู้ให้บริการ',
    'api-key-label': 'คีย์ API',
    'model-label': 'โมเดล',
    'output-section': 'ผลลัพธ์',
    'style-label': 'รูปแบบ',
    'summary-title': 'สรุป PR',
    'summary-desc': 'สรุปภาพรวมครอบคลุมทุก commit และหมายเหตุการทดสอบ',
    'per-commit-title': 'แยกตาม commit',
    'per-commit-desc': 'อธิบายว่าแต่ละ commit ทำอะไรทีละรายการ',
    'response-language-label': 'ภาษาผลลัพธ์',
    'custom-instructions-label': 'คำสั่งเพิ่มเติม',
    'custom-instructions-hint': 'จะถูกเติมไว้ต้น prompt ทุกครั้ง ใช้กำหนดรูปแบบ มาตรฐาน หรือจุดโฟกัสการรีวิว',
    'custom-instructions-placeholder': 'เช่น ระบุจุดที่ไม่มีเทสต์เสมอ และโฟกัสผลกระทบด้านความปลอดภัย',
    'save-btn': 'บันทึกการตั้งค่า',
    'save-success': 'บันทึกการตั้งค่าแล้ว',
    'save-error': 'บันทึกไม่สำเร็จ',
    'test-conn-btn': 'ทดสอบการเชื่อมต่อ',
    'test-conn-testing': 'กำลังทดสอบ…',
    'test-conn-success': 'เชื่อมต่อสำเร็จ',
    'test-conn-no-key': 'กรอกคีย์ API ก่อน',
    'scan-btn': 'สแกน',
    'scan-no-key': 'กรอกคีย์ API ก่อน',
    'scan-success': 'พบโมเดล {n} รายการ',
    'scan-error': 'ไม่สามารถดึงรายการโมเดลได้',
  },
  vietnamese: {
    'page-title': 'Cài đặt',
    'ui-language-label': 'Ngôn ngữ giao diện',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Khuyến nghị dùng Classic token. Fine-grained token cần quản trị viên tổ chức phê duyệt; Classic token dùng ngay.',
    'github-hint': 'Phạm vi quyền cần có:',
    'create-token-link': 'Tạo token →',
    'ai-section': 'Nhà cung cấp AI',
    'provider-label': 'Nhà cung cấp',
    'api-key-label': 'API Key',
    'model-label': 'Mô hình',
    'output-section': 'Đầu ra',
    'style-label': 'Kiểu',
    'summary-title': 'Tóm tắt PR',
    'summary-desc': 'Tóm tắt tổng quan gồm mọi commit và ghi chú kiểm thử',
    'per-commit-title': 'Theo commit',
    'per-commit-desc': 'Giải thích từng commit làm gì, lần lượt',
    'response-language-label': 'Ngôn ngữ đầu ra',
    'custom-instructions-label': 'Hướng dẫn tùy chỉnh',
    'custom-instructions-hint': 'Được thêm vào đầu mỗi prompt. Dùng để áp quy ước, định dạng hoặc trọng tâm review.',
    'custom-instructions-placeholder': 'vd: Luôn nêu rõ phần thiếu test. Tập trung vào tác động bảo mật.',
    'save-btn': 'Lưu cài đặt',
    'save-success': 'Đã lưu cài đặt',
    'save-error': 'Lưu thất bại',
    'test-conn-btn': 'Kiểm tra kết nối',
    'test-conn-testing': 'Đang kiểm tra…',
    'test-conn-success': 'Đã kết nối',
    'test-conn-no-key': 'Hãy nhập API key trước',
    'scan-btn': 'Quét',
    'scan-no-key': 'Hãy nhập API key trước',
    'scan-success': 'Tìm thấy {n} mô hình',
    'scan-error': 'Không thể lấy danh sách mô hình',
  },
  indonesian: {
    'page-title': 'Pengaturan',
    'ui-language-label': 'Bahasa antarmuka',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Disarankan memakai Classic token. Fine-grained token memerlukan persetujuan admin organisasi; Classic token bisa langsung dipakai.',
    'github-hint': 'Cakupan yang diperlukan:',
    'create-token-link': 'Buat token →',
    'ai-section': 'Penyedia AI',
    'provider-label': 'Penyedia',
    'api-key-label': 'Kunci API',
    'model-label': 'Model',
    'output-section': 'Output',
    'style-label': 'Gaya',
    'summary-title': 'Ringkasan PR',
    'summary-desc': 'Ringkasan keseluruhan mencakup semua commit dan catatan pengujian',
    'per-commit-title': 'Per commit',
    'per-commit-desc': 'Jelaskan satu per satu apa yang dilakukan tiap commit',
    'response-language-label': 'Bahasa output',
    'custom-instructions-label': 'Instruksi khusus',
    'custom-instructions-hint': 'Ditambahkan di awal setiap prompt. Tetapkan konvensi, format, atau fokus review.',
    'custom-instructions-placeholder': 'mis. Selalu tandai test yang belum ada. Fokus pada dampak keamanan.',
    'save-btn': 'Simpan pengaturan',
    'save-success': 'Pengaturan tersimpan',
    'save-error': 'Gagal menyimpan',
    'test-conn-btn': 'Uji koneksi',
    'test-conn-testing': 'Menguji…',
    'test-conn-success': 'Terhubung',
    'test-conn-no-key': 'Masukkan API key terlebih dahulu',
    'scan-btn': 'Pindai',
    'scan-no-key': 'Masukkan API key terlebih dahulu',
    'scan-success': 'Ditemukan {n} model',
    'scan-error': 'Gagal mengambil daftar model',
  },
  turkish: {
    'page-title': 'Ayarlar',
    'ui-language-label': 'Arayüz dili',
    'github-section': 'GitHub',
    'github-token-label': 'Kişisel Erişim Jetonu',
    'callout-text': 'Classic token önerilir. Fine-grained token için organizasyon yöneticisi onayı gerekir; Classic token hemen çalışır.',
    'github-hint': 'Gerekli kapsam:',
    'create-token-link': 'Jeton oluştur →',
    'ai-section': 'YZ Sağlayıcısı',
    'provider-label': 'Sağlayıcı',
    'api-key-label': 'API Anahtarı',
    'model-label': 'Model',
    'output-section': 'Çıktı',
    'style-label': 'Stil',
    'summary-title': 'PR Özeti',
    'summary-desc': 'Tüm commitleri ve test notlarını kapsayan genel özet',
    'per-commit-title': 'Commit bazında',
    'per-commit-desc': 'Her commitin ne yaptığını tek tek açıklar',
    'response-language-label': 'Çıktı dili',
    'custom-instructions-label': 'Özel talimatlar',
    'custom-instructions-hint': 'Her promptun başına eklenir. Kural, format veya inceleme odağı tanımlayabilirsiniz.',
    'custom-instructions-placeholder': 'örn. Eksik testleri mutlaka belirt. Güvenlik etkilerine odaklan.',
    'save-btn': 'Ayarları kaydet',
    'save-success': 'Ayarlar kaydedildi',
    'save-error': 'Kaydetme başarısız',
    'test-conn-btn': 'Bağlantıyı test et',
    'test-conn-testing': 'Test ediliyor…',
    'test-conn-success': 'Bağlandı',
    'test-conn-no-key': 'Önce bir API anahtarı girin',
    'scan-btn': 'Tara',
    'scan-no-key': 'Önce bir API anahtarı girin',
    'scan-success': '{n} model bulundu',
    'scan-error': 'Model listesi alınamadı',
  },
  dutch: {
    'page-title': 'Instellingen',
    'ui-language-label': 'Interfacetaal',
    'github-section': 'GitHub',
    'github-token-label': 'Personal Access Token',
    'callout-text': 'Een Classic token wordt aanbevolen. Fine-grained tokens vereisen goedkeuring van een organisatiebeheerder; Classic tokens werken direct.',
    'github-hint': 'Benodigde scope:',
    'create-token-link': 'Token maken →',
    'ai-section': 'AI-provider',
    'provider-label': 'Provider',
    'api-key-label': 'API-sleutel',
    'model-label': 'Model',
    'output-section': 'Uitvoer',
    'style-label': 'Stijl',
    'summary-title': 'PR-samenvatting',
    'summary-desc': 'Algemene samenvatting van alle commits en testnotities',
    'per-commit-title': 'Per commit',
    'per-commit-desc': 'Leg per commit uit wat er is gedaan',
    'response-language-label': 'Uitvoertaal',
    'custom-instructions-label': 'Aangepaste instructies',
    'custom-instructions-hint': 'Wordt voor elke prompt toegevoegd. Dwing conventies, formaat of reviewfocus af.',
    'custom-instructions-placeholder': 'bijv. Markeer altijd ontbrekende tests. Focus op security-impact.',
    'save-btn': 'Instellingen opslaan',
    'save-success': 'Instellingen opgeslagen',
    'save-error': 'Opslaan mislukt',
    'test-conn-btn': 'Verbinding testen',
    'test-conn-testing': 'Bezig met testen…',
    'test-conn-success': 'Verbonden',
    'test-conn-no-key': 'Voer eerst een API-sleutel in',
    'scan-btn': 'Scannen',
    'scan-no-key': 'Voer eerst een API-sleutel in',
    'scan-success': '{n} modellen gevonden',
    'scan-error': 'Modellen ophalen mislukt',
  },
}

let currentUILang: UILanguage = 'english'

function applyTranslations(lang: UILanguage): void {
  currentUILang = lang
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.english

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!
    if (t[key] !== undefined) el.textContent = t[key]
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')!
    if (t[key] !== undefined) (el as HTMLInputElement | HTMLTextAreaElement).placeholder = t[key]
  })

  const selected = UI_LANGUAGE_OPTIONS.find((item) => item.value === lang) ?? UI_LANGUAGE_OPTIONS[0]
  uiLangValue.textContent = selected.label
  document.documentElement.lang = selected.locale
  highlightActiveUILanguage(lang)
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
const uiLangButton = document.getElementById('ui-lang-button') as HTMLButtonElement
const uiLangPanel = document.getElementById('ui-lang-panel') as HTMLDivElement
const uiLangValue = document.getElementById('ui-lang-value') as HTMLSpanElement
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

function renderUILanguageOptions(): void {
  uiLangPanel.innerHTML = UI_LANGUAGE_OPTIONS
    .map((item) => `
      <button type="button" class="ui-lang-option" data-lang="${item.value}" role="menuitemradio">
        ${item.label}
      </button>
    `)
    .join('')
}

function highlightActiveUILanguage(lang: UILanguage): void {
  document.querySelectorAll<HTMLButtonElement>('.ui-lang-option').forEach((button) => {
    const active = button.dataset.lang === lang
    button.classList.toggle('ui-lang-option--active', active)
    button.setAttribute('aria-checked', String(active))
  })
}

function toggleUILanguagePanel(expanded: boolean): void {
  uiLangPanel.classList.toggle('ui-lang-panel--open', expanded)
  uiLangButton.setAttribute('aria-expanded', String(expanded))
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

// ── UI language picker ────────────────────────────────────

uiLangButton.addEventListener('click', (e) => {
  e.stopPropagation()
  const expanded = uiLangButton.getAttribute('aria-expanded') === 'true'
  toggleUILanguagePanel(!expanded)
})

uiLangPanel.addEventListener('click', async (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.ui-lang-option')
  if (!target?.dataset.lang) return

  const next = target.dataset.lang as UILanguage
  if (next === currentUILang) {
    toggleUILanguagePanel(false)
    return
  }

  applyTranslations(next)
  toggleUILanguagePanel(false)

  const settings = await getSettings()
  await saveSettings({ ...settings, uiLanguage: next })
})

document.addEventListener('click', (e) => {
  const target = e.target as Node
  if (!uiLangPanel.contains(target) && !uiLangButton.contains(target)) {
    toggleUILanguagePanel(false)
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleUILanguagePanel(false)
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

renderUILanguageOptions()
loadSettings()
initRevealButtons()
