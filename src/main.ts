import './style.css'
import { loadAllLists } from './data'
import { siteConfig } from './site-config'
import { readStateFromUrl, writeStateToUrl } from './state'
import type { ShopList, StoreWithList, UiState } from './types'
import {
  displayName,
  escapeHtml,
  externalAttrs,
  filterStores,
  formatDate,
  hasShopLink,
  shopHostLabel,
  sortCategories,
  threadsProfileUrl,
} from './utils'

const appEl = document.querySelector<HTMLDivElement>('#app')
if (!appEl) throw new Error('#app not found')
const app: HTMLDivElement = appEl

let lists: ShopList[] = []
let allStores: StoreWithList[] = []
let state: UiState = readStateFromUrl()

function extLink(href: string, label: string, className = ''): string {
  const { target, rel } = externalAttrs()
  return `<a class="${className}" href="${escapeHtml(href)}" target="${target}" rel="${rel}">${escapeHtml(label)}</a>`
}

function renderHeader(): string {
  return `
    <header class="site-header">
      <div class="site-header__inner">
        <p class="site-eyebrow">由 ${escapeHtml(siteConfig.ownerName)} 整理</p>
        <h1 class="site-title">${escapeHtml(siteConfig.title)}</h1>
        <p class="site-lead">從小店 Threads 留言整理而來的網購清單，方便依分類與關鍵字查找。</p>
      </div>
    </header>
  `
}

function renderDisclaimer(): string {
  return `
    <aside class="disclaimer" role="note" aria-label="使用聲明">
      <p>資料整理自公開留言，可能已過期或有誤，下單前請向店家確認；本站與店家無合作關係、不保證交易。</p>
    </aside>
  `
}

function renderSources(): string {
  const visible =
    state.listId === 'all'
      ? lists
      : lists.filter((l) => l.id === state.listId)

  const cards = visible
    .map((list) => {
      const storeCount = list.stores.length
      return `
        <article class="source-card">
          <h3>${escapeHtml(list.title)}</h3>
          <p class="source-card__meta">${storeCount} 間店家 · 蒐集於 ${escapeHtml(formatDate(list.collectedAt))}</p>
          <p>${escapeHtml(list.source.description)}</p>
          <p class="source-card__credit">
            原始來源：
            ${extLink(list.source.url, list.source.author)}
            · 發文 ${escapeHtml(formatDate(list.source.postedAt))}
          </p>
        </article>
      `
    })
    .join('')

  return `
    <section class="section sources" aria-labelledby="sources-heading">
      <div class="section__head">
        <h2 id="sources-heading">清單來源</h2>
        <p>每份清單都標示原始 Threads 串文，方便回溯。</p>
      </div>
      <div class="source-grid">${cards}</div>
    </section>
  `
}

function renderStats(filtered: StoreWithList[]): string {
  const scoped =
    state.listId === 'all'
      ? allStores
      : allStores.filter((s) => s.listId === state.listId)

  const withLinks = scoped.filter(hasShopLink).length
  const categories = sortCategories(scoped.map((s) => s.category))
  const categoryBits = categories
    .map((cat) => {
      const n = scoped.filter((s) => s.category === cat).length
      return `<li><span>${escapeHtml(cat)}</span><strong>${n}</strong></li>`
    })
    .join('')

  return `
    <section class="section stats" aria-labelledby="stats-heading">
      <div class="section__head">
        <h2 id="stats-heading">總覽</h2>
        <p>目前顯示 <strong>${filtered.length}</strong> / ${scoped.length} 間店家。</p>
      </div>
      <ul class="stat-pills" aria-label="摘要數字">
        <li><span>店家數</span><strong>${scoped.length}</strong></li>
        <li><span>有商店連結</span><strong>${withLinks}</strong></li>
        <li><span>分類數</span><strong>${categories.length}</strong></li>
      </ul>
      <ul class="category-stats" aria-label="各分類店家數">${categoryBits}</ul>
    </section>
  `
}

function renderControls(categories: string[]): string {
  const listOptions = [
    `<option value="all"${state.listId === 'all' ? ' selected' : ''}>全部清單</option>`,
    ...lists.map(
      (l) =>
        `<option value="${escapeHtml(l.id)}"${state.listId === l.id ? ' selected' : ''}>${escapeHtml(l.title)}</option>`,
    ),
  ].join('')

  const chips = [
    `<button type="button" class="chip${state.category === '' ? ' is-active' : ''}" data-category="" aria-pressed="${state.category === ''}">全部</button>`,
    ...categories.map((cat) => {
      const active = state.category === cat
      return `<button type="button" class="chip${active ? ' is-active' : ''}" data-category="${escapeHtml(cat)}" aria-pressed="${active}">${escapeHtml(cat)}</button>`
    }),
  ].join('')

  return `
    <section class="section controls" aria-label="篩選條件">
      <div class="controls__row">
        <label class="field">
          <span>清單</span>
          <select id="list-select">${listOptions}</select>
        </label>
        <label class="field field--grow">
          <span>搜尋店名／Threads／品項</span>
          <input id="search-input" type="search" placeholder="例如：白蝦、賣貨便帳號…" value="${escapeHtml(state.query)}" autocomplete="off" />
        </label>
        <label class="toggle">
          <input id="links-toggle" type="checkbox"${state.onlyWithLinks ? ' checked' : ''} />
          <span>只看有商店連結</span>
        </label>
      </div>
      <div class="chips" role="group" aria-label="分類篩選">${chips}</div>
    </section>
  `
}

function renderStoreLinks(store: StoreWithList): string {
  const parts: string[] = []
  const handle = store.threads.replace(/^@/, '')
  if (handle) {
    parts.push(extLink(threadsProfileUrl(handle), `@${handle}`, 'link-pill'))
  }
  for (const url of store.shopLinks.filter((u) => u.trim())) {
    parts.push(extLink(url, shopHostLabel(url), 'link-pill link-pill--shop'))
  }
  if (store.line.trim()) {
    const lineUrl = store.line.startsWith('http')
      ? store.line
      : `https://line.me/ti/p/~${encodeURIComponent(store.line)}`
    parts.push(extLink(lineUrl, 'LINE', 'link-pill link-pill--line'))
  }
  if (store.sourceComment.trim()) {
    parts.push(extLink(store.sourceComment, '原始留言', 'link-pill link-pill--muted'))
  }
  return parts.join(' ')
}

function renderMobileCards(stores: StoreWithList[]): string {
  if (!stores.length) {
    return `<p class="empty">沒有符合條件的店家，試著放寬篩選。</p>`
  }

  return `
    <ul class="store-cards">
      ${stores
        .map((store) => {
          const multi = lists.length > 1 && state.listId === 'all'
          return `
            <li class="store-card">
              <div class="store-card__top">
                <span class="badge">${escapeHtml(store.category)}</span>
                ${multi ? `<span class="badge badge--soft">${escapeHtml(store.listTitle)}</span>` : ''}
              </div>
              <h3>${escapeHtml(displayName(store))}</h3>
              <p class="store-card__items">${escapeHtml(store.items || '（未填品項）')}</p>
              <div class="store-card__links">${renderStoreLinks(store)}</div>
            </li>
          `
        })
        .join('')}
    </ul>
  `
}

function renderDesktopTable(stores: StoreWithList[]): string {
  if (!stores.length) {
    return `<p class="empty desktop-only">沒有符合條件的店家，試著放寬篩選。</p>`
  }

  const showListCol = lists.length > 1 && state.listId === 'all'

  return `
    <div class="table-wrap desktop-only">
      <table class="store-table">
        <thead>
          <tr>
            <th scope="col">分類</th>
            ${showListCol ? '<th scope="col">清單</th>' : ''}
            <th scope="col">店名</th>
            <th scope="col">品項</th>
            <th scope="col">連結</th>
          </tr>
        </thead>
        <tbody>
          ${stores
            .map((store) => {
              return `
                <tr>
                  <td><span class="badge">${escapeHtml(store.category)}</span></td>
                  ${showListCol ? `<td>${escapeHtml(store.listTitle)}</td>` : ''}
                  <td>
                    <div class="store-name">${escapeHtml(displayName(store))}</div>
                  </td>
                  <td>${escapeHtml(store.items || '—')}</td>
                  <td class="store-links">${renderStoreLinks(store)}</td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderResults(filtered: StoreWithList[]): string {
  return `
    <section class="section results" aria-labelledby="results-heading">
      <div class="section__head">
        <h2 id="results-heading">店家</h2>
        <p class="sr-only">桌面版為表格，手機版為卡片。</p>
      </div>
      ${renderMobileCards(filtered)}
      ${renderDesktopTable(filtered)}
    </section>
  `
}

function renderTakedown(): string {
  const google = siteConfig.googleFormUrl.trim()
  const googleLink = google
    ? `<p>或使用備用表單：${extLink(google, 'Google 表單')}</p>`
    : ''

  return `
    <section class="section takedown" aria-labelledby="takedown-heading">
      <div class="section__head">
        <h2 id="takedown-heading">店家下架／更正</h2>
        <p>若不想被收錄，或資料有誤，請透過下列管道告知，我們會儘速處理。</p>
      </div>
      <div class="takedown__body">
        <p>${extLink(siteConfig.issueFormUrl, '前往 GitHub 填寫下架／更正申請')}</p>
        ${googleLink}
      </div>
    </section>
  `
}

function renderFooter(): string {
  return `
    <footer class="site-footer">
      <p>維護：${escapeHtml(siteConfig.ownerName)}（${extLink(`https://github.com/${siteConfig.ownerGithub}`, `@${siteConfig.ownerGithub}`)}）</p>
      <p>${extLink(siteConfig.githubRepoUrl, '原始碼與 Issue')}</p>
    </footer>
  `
}

function bindEvents(): void {
  const listSelect = document.querySelector<HTMLSelectElement>('#list-select')
  const searchInput = document.querySelector<HTMLInputElement>('#search-input')
  const linksToggle = document.querySelector<HTMLInputElement>('#links-toggle')

  listSelect?.addEventListener('change', () => {
    state = { ...state, listId: listSelect.value || 'all', category: '' }
    paint()
  })

  let searchTimer = 0
  searchInput?.addEventListener('input', () => {
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      state = { ...state, query: searchInput.value }
      paint({ keepFocus: 'search-input' })
    }, 150)
  })

  linksToggle?.addEventListener('change', () => {
    state = { ...state, onlyWithLinks: linksToggle.checked }
    paint()
  })

  document.querySelectorAll<HTMLButtonElement>('.chip[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state = { ...state, category: btn.dataset.category ?? '' }
      paint()
    })
  })
}

function paint(opts: { keepFocus?: string } = {}): void {
  writeStateToUrl(state)

  const scoped =
    state.listId === 'all'
      ? allStores
      : allStores.filter((s) => s.listId === state.listId)

  const categories = sortCategories(scoped.map((s) => s.category))
  if (state.category && !categories.includes(state.category)) {
    state = { ...state, category: '' }
    writeStateToUrl(state)
  }

  // If URL pointed at an unknown list, fall back to all
  if (state.listId !== 'all' && !lists.some((l) => l.id === state.listId)) {
    state = { ...state, listId: 'all' }
    writeStateToUrl(state)
  }

  const filtered = filterStores(allStores, state)

  app.innerHTML = `
    ${renderHeader()}
    <main class="page">
      ${renderDisclaimer()}
      ${renderSources()}
      ${renderStats(filtered)}
      ${renderControls(categories)}
      ${renderResults(filtered)}
      ${renderTakedown()}
    </main>
    ${renderFooter()}
  `

  bindEvents()

  if (opts.keepFocus === 'search-input') {
    const input = document.querySelector<HTMLInputElement>('#search-input')
    if (input) {
      const end = input.value.length
      input.focus()
      input.setSelectionRange(end, end)
    }
  }
}

async function boot(): Promise<void> {
  app.innerHTML = `
    ${renderHeader()}
    <main class="page">
      <p class="loading" role="status">載入店家資料中…</p>
    </main>
  `

  try {
    lists = await loadAllLists()
    allStores = lists.flatMap((list) =>
      list.stores.map((store) => ({
        ...store,
        listId: list.id,
        listTitle: list.title,
      })),
    )
    paint()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    app.innerHTML = `
      ${renderHeader()}
      <main class="page">
        <p class="error" role="alert">載入失敗：${escapeHtml(message)}</p>
      </main>
    `
  }
}

boot()
