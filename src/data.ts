import type { Manifest, ShopList } from './types'

const dataBase = `${import.meta.env.BASE_URL}data/`

export async function loadAllLists(): Promise<ShopList[]> {
  const manifestRes = await fetch(`${dataBase}lists.json`)
  if (!manifestRes.ok) {
    throw new Error(`無法載入清單清單（lists.json）：${manifestRes.status}`)
  }

  const manifest = (await manifestRes.json()) as Manifest
  if (!Array.isArray(manifest.lists)) {
    throw new Error('lists.json 格式錯誤：缺少 lists 陣列')
  }

  const lists = await Promise.all(
    manifest.lists.map(async (entry) => {
      const res = await fetch(`${dataBase}${entry.file}`)
      if (!res.ok) {
        throw new Error(`無法載入 ${entry.file}：${res.status}`)
      }
      const list = (await res.json()) as ShopList
      if (list.id !== entry.id) {
        console.warn(
          `清單 id 不一致：manifest=${entry.id}, file=${list.id}（以檔案為準）`,
        )
      }
      return list
    }),
  )

  return lists
}
