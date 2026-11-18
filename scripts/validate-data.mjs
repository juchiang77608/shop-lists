#!/usr/bin/env node
/**
 * 輕量資料驗證：對照 public/data/schema 的必要欄位做檢查。
 * 不依賴外部 JSON Schema 套件，方便在 CI 直接跑。
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dataDir = join(root, 'public', 'data')

const errors = []

function fail(msg) {
  errors.push(msg)
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    fail(`無法解析 JSON：${path}（${err.message}）`)
    return null
  }
}

function validateStore(store, path) {
  if (!store || typeof store !== 'object') {
    fail(`${path}: 不是物件`)
    return
  }
  for (const key of [
    'category',
    'name',
    'threads',
    'items',
    'shopLinks',
    'line',
    'sourceComment',
  ]) {
    if (!(key in store)) fail(`${path}: 缺少欄位 ${key}`)
  }
  if (!isNonEmptyString(store.category)) fail(`${path}.category 不可空白`)
  if (!isNonEmptyString(store.threads)) fail(`${path}.threads 不可空白`)
  if (typeof store.name !== 'string') fail(`${path}.name 必須是字串`)
  if (typeof store.items !== 'string') fail(`${path}.items 必須是字串`)
  if (typeof store.line !== 'string') fail(`${path}.line 必須是字串`)
  if (typeof store.sourceComment !== 'string') {
    fail(`${path}.sourceComment 必須是字串`)
  }
  if (!Array.isArray(store.shopLinks)) {
    fail(`${path}.shopLinks 必須是陣列`)
  } else if (store.shopLinks.some((u) => typeof u !== 'string')) {
    fail(`${path}.shopLinks 只能包含字串`)
  }
}

function validateList(list, filePath) {
  if (!list || typeof list !== 'object') {
    fail(`${filePath}: 根節點不是物件`)
    return
  }
  for (const key of ['id', 'title', 'source', 'collectedAt', 'stores']) {
    if (!(key in list)) fail(`${filePath}: 缺少欄位 ${key}`)
  }
  if (!isNonEmptyString(list.id)) fail(`${filePath}: id 不可空白`)
  if (!isNonEmptyString(list.title)) fail(`${filePath}: title 不可空白`)
  if (!isIsoDate(list.collectedAt)) {
    fail(`${filePath}: collectedAt 須為 YYYY-MM-DD`)
  }
  const source = list.source
  if (!source || typeof source !== 'object') {
    fail(`${filePath}: source 必須是物件`)
  } else {
    for (const key of ['url', 'author', 'postedAt', 'description']) {
      if (!(key in source)) fail(`${filePath}: source 缺少 ${key}`)
    }
    if (!isNonEmptyString(source.url)) fail(`${filePath}: source.url 不可空白`)
    if (!isNonEmptyString(source.author)) {
      fail(`${filePath}: source.author 不可空白`)
    }
    if (!isIsoDate(source.postedAt)) {
      fail(`${filePath}: source.postedAt 須為 YYYY-MM-DD`)
    }
  }
  if (!Array.isArray(list.stores)) {
    fail(`${filePath}: stores 必須是陣列`)
    return
  }
  list.stores.forEach((store, i) => validateStore(store, `${filePath}#stores[${i}]`))
}

const manifestPath = join(dataDir, 'lists.json')
if (!existsSync(manifestPath)) {
  fail(`找不到 ${manifestPath}`)
} else {
  const manifest = loadJson(manifestPath)
  if (manifest) {
    if (!Array.isArray(manifest.lists) || manifest.lists.length === 0) {
      fail('lists.json: lists 必須是非空陣列')
    } else {
      const ids = new Set()
      for (const [i, entry] of manifest.lists.entries()) {
        if (!entry || typeof entry !== 'object') {
          fail(`lists.json#lists[${i}] 不是物件`)
          continue
        }
        if (!isNonEmptyString(entry.id)) {
          fail(`lists.json#lists[${i}].id 不可空白`)
        }
        if (!isNonEmptyString(entry.file)) {
          fail(`lists.json#lists[${i}].file 不可空白`)
        }
        if (ids.has(entry.id)) fail(`lists.json: 重複的 id「${entry.id}」`)
        ids.add(entry.id)

        const listPath = join(dataDir, entry.file)
        if (!existsSync(listPath)) {
          fail(`找不到清單檔：${entry.file}`)
          continue
        }
        const list = loadJson(listPath)
        if (!list) continue
        validateList(list, entry.file)
        if (list.id && list.id !== entry.id) {
          fail(
            `${entry.file}: id「${list.id}」與 manifest「${entry.id}」不一致`,
          )
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`資料驗證失敗（${errors.length}）：`)
  for (const err of errors) console.error(`- ${err}`)
  process.exit(1)
}

console.log('資料驗證通過。')
