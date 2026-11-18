import type { Store, StoreWithList } from './types'
import { CATEGORY_ORDER } from './types'

const EXT_REL = 'noopener noreferrer nofollow'

export function externalAttrs(): { target: string; rel: string } {
  return { target: '_blank', rel: EXT_REL }
}

export function threadsProfileUrl(handle: string): string {
  const clean = handle.replace(/^@/, '')
  return `https://www.threads.com/@${encodeURIComponent(clean)}`
}

export function displayName(store: Store): string {
  const name = store.name.trim()
  if (name) return name
  const handle = store.threads.replace(/^@/, '')
  return handle ? `@${handle}` : '（未命名店家）'
}

export function hasShopLink(store: Store): boolean {
  return Array.isArray(store.shopLinks) && store.shopLinks.some((u) => u.trim())
}

export function sortCategories(categories: Iterable<string>): string[] {
  const set = new Set(categories)
  const ordered = CATEGORY_ORDER.filter((c) => set.has(c))
  const rest = [...set].filter((c) => !CATEGORY_ORDER.includes(c as (typeof CATEGORY_ORDER)[number])).sort()
  return [...ordered, ...rest]
}

export function filterStores(
  stores: StoreWithList[],
  opts: {
    listId: string
    category: string
    query: string
    onlyWithLinks: boolean
  },
): StoreWithList[] {
  const q = opts.query.trim().toLowerCase()

  return stores.filter((store) => {
    if (opts.listId !== 'all' && store.listId !== opts.listId) return false
    if (opts.category && store.category !== opts.category) return false
    if (opts.onlyWithLinks && !hasShopLink(store)) return false
    if (!q) return true

    const haystack = [
      store.name,
      store.threads,
      store.items,
      store.category,
      store.listTitle,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function formatDate(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!m) return isoDate
  return `${m[1]} 年 ${Number(m[2])} 月 ${Number(m[3])} 日`
}

export function shopHostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host.includes('myship.7-11')) return '賣貨便'
    if (host.includes('shopee')) return '蝦皮'
    if (host.includes('line.me')) return 'LINE'
    return host
  } catch {
    return '商店連結'
  }
}
