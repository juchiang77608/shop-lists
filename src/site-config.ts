/** 站點設定集中在這裡，方便改連結與文案。 */
export const siteConfig = {
  title: 'Threads 好店清單',
  description:
    '整理自 Threads 公開留言的小型網路店家清單。可依分類、關鍵字篩選，並連結至 Threads、賣貨便與 LINE。',
  ownerName: 'Janice',
  ownerGithub: 'juchiang77608',
  siteUrl: 'https://shops.janicechiang.dev/',
  githubRepoUrl: 'https://github.com/juchiang77608/shop-lists',
  /** 下架／更正 Issue 表單（對應 .github/ISSUE_TEMPLATE/takedown.yml） */
  issueFormUrl:
    'https://github.com/juchiang77608/shop-lists/issues/new?template=takedown.yml',
  /**
   * TODO: Janice 建立 Google 表單後，把完整網址填在這裡。
   * 留空時前端不會顯示備用表單連結。
   */
  googleFormUrl: '',
} as const
