export interface ListSource {
  url: string
  author: string
  postedAt: string
  description: string
}

export interface Store {
  category: string
  name: string
  threads: string
  items: string
  shopLinks: string[]
  line: string
  sourceComment: string
}

export interface ShopList {
  id: string
  title: string
  source: ListSource
  collectedAt: string
  stores: Store[]
}

export interface ManifestEntry {
  id: string
  file: string
}

export interface Manifest {
  lists: ManifestEntry[]
}

export interface StoreWithList extends Store {
  listId: string
  listTitle: string
}

export interface UiState {
  listId: string // 'all' or a concrete list id
  category: string // '' = 全部
  query: string
  onlyWithLinks: boolean
}

export const CATEGORY_ORDER = [
  '海鮮水產',
  '肉品',
  '冷凍調理',
  '農產乾貨調味',
  '寵物',
  '非食品',
  '其他',
] as const
