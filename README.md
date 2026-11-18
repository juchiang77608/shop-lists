# Threads 開店清單

整理自 Threads 公開留言的小型網路店家清單（靜態網站）。

網站（上線後）：https://juchiang77608.github.io/shop-lists/

維護者：Janice（[@juchiang77608](https://github.com/juchiang77608)）

## 功能

- 讀取 `public/data/` 的清單 JSON（執行期 `fetch`，不必改程式碼）
- 清單切換（單一清單或「全部清單」）
- 分類篩選、關鍵字搜尋、只看有商店連結
- 桌面表格／手機卡片
- 來源串文致謝、免責聲明、下架／更正申請管道
- 篩選狀態可寫入 URL query（`list`、`category`、`q`、`links`）

## 本機開發

```bash
npm install
npm run validate
npm run dev
```

建置（`base` 為 `/shop-lists/`）：

```bash
npm run build
npm run preview
```

預覽請開啟 `http://localhost:4173/shop-lists/`。

## 如何新增一份清單

1. 在 `public/data/lists/` 新增 JSON（可參考現有檔案），欄位包含：
   - `id`、`title`
   - `source`：`url`、`author`、`postedAt`、`description`
   - `collectedAt`
   - `stores[]`：`category`、`name`、`threads`（不含 `@`）、`items`、`shopLinks[]`、`line`、`sourceComment`
2. 在 `public/data/lists.json` 加一筆：

```json
{ "id": "taiwan-made-2026", "file": "lists/taiwan-made-2026.json" }
```

3. 執行 `npm run validate` 確認格式。
4. 重新整理網站即可；**不需改 TypeScript**。

JSON Schema 放在 `public/data/schema/`，供文件與驗證參考。

## 下架／更正

- GitHub Issue 表單：`.github/ISSUE_TEMPLATE/takedown.yml`
- 網站「店家下架／更正」區塊會連到 Issue 表單
- 備用 Google 表單：在 `src/site-config.ts` 的 `googleFormUrl` 填入網址（**TODO：由 Janice 建立表單後填入**）。空白時網站不顯示該連結。

## 部署（GitHub Pages）

推送到 `main` 後，`.github/workflows/deploy-pages.yml` 會建置並部署。

上線前請確認：

1. 倉庫設為 **public**（或付費方案才可對 private repo 開 Pages）
2. Settings → Pages → Source = **GitHub Actions**
3. 合併本專案 PR 至 `main`
