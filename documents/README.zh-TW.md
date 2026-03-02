# PR Commentor

[English](../README.md) | 繁體中文

> AI 自動生成 PR 摘要與標題，直接在 GitHub 頁面內完成，無需複製貼上。

![PR Commentor](./pr-commentor.jpg)

PR Commentor 在每個 GitHub Pull Request 的留言工具列中注入 **Generate Summary（生成摘要）** 按鈕，並在 PR 標題欄位旁注入 **Generate Title（生成標題）** 按鈕。點一下即可透過 GitHub API 抓取完整 diff 與 commit 歷史紀錄，送給 AI 模型後直接將結果填入文字框，準備好可以直接送出。

---

## Chrome Web Store 上架說明

### 簡短說明 *（≤ 132 字元）*

```
在 GitHub 留言框內直接生成 AI PR 摘要與標題，支援 Claude 與 OpenAI。
```

### 詳細說明

**PR Commentor** 在 GitHub Pull Request 頁面中直接加入 AI 驅動的「Generate Summary」與「Generate Title」按鈕，讓你不用再從頭手寫 PR 說明，AI 幫你分析 commit 與 diff，快速完成初稿。

**使用流程**

1. 開啟任意 GitHub Pull Request（或開 PR 前的 compare 頁面）。
2. 在留言工具列點擊 **Generate Summary** — 擴充功能會透過 GitHub API 抓取 PR 元資料、所有 commit 及完整 diff，再送給你選擇的 AI 服務。
3. 生成的摘要會立即填入留言框。編輯後直接送出。
4. 點擊 PR 標題欄位旁的 **Generate Title**，根據相同資料得到一個簡潔的祈使語氣標題（≤ 72 字元）。

**功能特色**

- **支援兩大 AI 服務** — 可選擇 Claude（Anthropic）或 GPT（OpenAI）。使用自己的 API 金鑰，所有資料不離開瀏覽器。
- **兩種輸出格式** — *PR Summary* 產生整體摘要（包含描述、commit 清單、測試注意事項）；*Per-commit* 則逐一說明每個 commit 做了什麼。
- **輸出語言** — 英文或繁體中文，隨時可在設定中切換。
- **自訂指令** — 在每次 prompt 前加入自訂說明（例如：「請標出缺少測試的地方，並聚焦於資安影響」），強制套用團隊規範。
- **模型掃描** — 手動輸入模型名稱，或點擊 Scan 從 API 自動列出可用模型。
- **連線測試** — 一鍵驗證 API 金鑰與模型是否正常運作。
- **支援私有 repo** — 設定具備 `repo` 權限的 GitHub Token 即可使用私有儲存庫。
- **深色模式相容** — 使用 GitHub 原生 CSS 自訂屬性，所有主題下皆顯示正常。
- **GitHub SPA 導航支援** — 在 PR 之間切換頁面時無需重新整理，按鈕持續運作。

**所需權限說明**

- `storage` — 透過 `chrome.storage.sync` 將設定（Token、API 金鑰、偏好）儲存在瀏覽器本地。除 GitHub 與 AI 服務的 API 外，不會傳送至任何伺服器。
- `activeTab` — 讀取目前的 GitHub PR 網址，以取得 owner、repo 和 PR 編號。
- `api.github.com`、`api.anthropic.com`、`api.openai.com` 的主機權限 — 擴充功能直接從瀏覽器呼叫這些 API，不經過任何中介伺服器。

**隱私政策**

GitHub Token 與 AI API 金鑰僅儲存於 Chrome 的加密同步儲存空間，且只會傳送給各自對應的服務（GitHub 與你選擇的 AI 服務）。PR Commentor 不收集、傳輸或記錄任何資料。

---

## 功能一覽

| 功能 | 說明 |
|---|---|
| Generate Summary | 在任意留言框內插入完整 PR 摘要（概述 + commit + 測試注意事項） |
| Generate Title | 在標題欄旁建議一個簡潔的 PR 標題（≤ 72 字元，祈使語氣） |
| AI 服務 | Claude (`claude-sonnet-4-6`) · GPT (`gpt-4o`) — 完全可自訂 |
| 輸出格式 | **PR Summary**（整體摘要）或 **Per-commit**（逐一說明每個 commit） |
| 輸出語言 | English · 繁體中文 |
| 自訂指令 | 在每次 AI 呼叫前加入自訂 prefix prompt |
| 模型掃描 | 自動從 Anthropic / OpenAI API 抓取可用模型清單 |
| 連線測試 | 一鍵驗證 API 金鑰與模型設定 |
| 私有 Repo | 使用具備 `repo` 權限的 GitHub Token 即可支援 |
| SPA 導航 | 支援 GitHub Turbo / SPA 頁面切換，無需重新整理 |
| 深色模式 | 使用 GitHub CSS 變數，自動適應各種主題 |

---

## 安裝方式

### 從 Chrome Web Store 安裝 *（建議）*

在 [Chrome Web Store](https://chromewebstore.google.com) 搜尋 **PR Commentor**，點擊 **加到 Chrome**。

### 手動安裝（unpacked）

```bash
git clone https://github.com/your-username/pr-commentor.git
cd pr-commentor
npm install
npm run build
```

1. 開啟 `chrome://extensions`
2. 開啟右上角的 **開發人員模式**
3. 點擊 **載入未封裝項目** → 選擇 `dist/` 資料夾

---

## 設定說明

擴充功能安裝後會自動開啟設定頁面，之後可隨時點擊擴充功能圖示重新開啟。

![設定頁面 — GitHub Token 與 AI 服務設定](./pr-commentor3.jpg)

### 1. GitHub Personal Access Token

用於透過 GitHub API 讀取 PR 資料。

- 前往 **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
- 建立一個具備 **`repo`** 權限的 Token（私有 repo 必須；純公開 repo 用 `public_repo` 即可）
- 將 Token（`ghp_…`）貼入 **GitHub Token** 欄位

> **Fine-grained token** 在組織 repo 上使用前需要組織管理員審核核准。建議直接使用 Classic Token，設定後立即生效。

### 2. AI 服務與 API 金鑰

選擇 **Claude** 或 **GPT**，貼上對應的 API 金鑰：

| 服務 | 取得金鑰位置 |
|---|---|
| Claude（Anthropic） | [console.anthropic.com](https://console.anthropic.com) |
| GPT（OpenAI） | [platform.openai.com](https://platform.openai.com) |

點擊 **Scan** 自動列出可用模型，或直接手動輸入模型名稱。
點擊 **Test Connection** 確認設定正確。

### 3. 輸出偏好

![設定頁面 — 輸出格式、語言與自訂指令](./pr-commentor4.jpg)

| 設定 | 選項 |
|---|---|
| 格式 | PR Summary · Per-commit |
| 語言 | English · 繁體中文 |
| 自訂指令 | 自由輸入文字，會附加在每次 prompt 的開頭 |

完成後點擊 **Save settings** 儲存。

---

## 使用方式

![GitHub PR 頁面上的 Generate Title 與 Generate Summary 按鈕](./pr-commentor2.jpg)

### 生成 PR 摘要

1. 開啟一個 GitHub Pull Request。
2. 點擊留言框（PR 描述欄或任意留言區域）。
3. 點擊留言工具列中出現的 **Generate Summary** 按鈕。
4. 稍候幾秒，AI 生成的摘要會自動填入文字框。
5. 視需要修改後送出。

支援 PR 頁面（`/pull/*`）與開 PR 前的 compare 頁面（`/compare/*`）。

### 生成 PR 標題

1. 開啟 GitHub PR 或 compare 頁面。
2. 點擊 PR 標題欄位旁的 **Generate Title**。
3. AI 根據 commit 與異動檔案建議一個簡潔、祈使語氣的標題。

---

## 開發

```bash
npm install          # 安裝相依套件
npm run dev          # Vite 開發模式（watch）
npm run build        # 正式建置 → 輸出至 dist/
npm run zip          # 建置並打包 dist/ 為 build/pr-commentor-x.x.x.zip
npm run zip:only     # 只打包（已建置過時使用，跳過 build 步驟）
```

**技術棧：** TypeScript · Vite · `@crxjs/vite-plugin` · Manifest V3

---

## 隱私與安全

- 所有 Token 與 API 金鑰儲存於 **`chrome.storage.sync`**（加密，隨 Chrome 登入帳號同步），除 GitHub 與你選擇的 AI 服務外，不會傳送至任何地方。
- PR Commentor 不含任何數據分析、遙測或第三方追蹤功能。
- 擴充功能僅在 `github.com/*/pull/*` 與 `github.com/*/compare/*` 頁面上啟動。

---

## 授權

MIT
