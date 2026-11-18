import type { UiState } from './types'

const DEFAULT_STATE: UiState = {
  listId: 'all',
  category: '',
  query: '',
  onlyWithLinks: false,
}

export function readStateFromUrl(): UiState {
  const params = new URLSearchParams(window.location.search)
  const list = params.get('list')
  const category = params.get('category')
  const query = params.get('q')
  const links = params.get('links')

  return {
    listId: list && list.trim() ? list.trim() : DEFAULT_STATE.listId,
    category: category ?? DEFAULT_STATE.category,
    query: query ?? DEFAULT_STATE.query,
    onlyWithLinks: links === '1' || links === 'true',
  }
}

export function writeStateToUrl(state: UiState): void {
  const params = new URLSearchParams()

  if (state.listId && state.listId !== 'all') {
    params.set('list', state.listId)
  }
  if (state.category) {
    params.set('category', state.category)
  }
  if (state.query.trim()) {
    params.set('q', state.query.trim())
  }
  if (state.onlyWithLinks) {
    params.set('links', '1')
  }

  const search = params.toString()
  const next = search
    ? `${window.location.pathname}?${search}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`

  window.history.replaceState(null, '', next)
}
