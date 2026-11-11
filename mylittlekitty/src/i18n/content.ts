import { t } from './index'

export const itemName = (item: { id: string; name: string }): string => {
  const v = t(`item.${item.id}.name`)
  return v.startsWith('item.') ? item.name : v
}
export const itemDesc = (item: { id: string; description?: string; desc?: string }): string => {
  const v = t(`item.${item.id}.desc`)
  return v.startsWith('item.') ? (item.description ?? item.desc ?? '') : v
}
export const questTitle = (q: { id: string; title: string }): string => {
  const v = t(`q.${q.id}`)
  return v === `q.${q.id}` ? q.title : v
}
export const achName = (a: { id: string; name: string }): string => {
  const v = t(`ach.${a.id}.name`)
  return v.startsWith('ach.') ? a.name : v
}
export const achDesc = (a: { id: string; description?: string; desc?: string }): string => {
  const v = t(`ach.${a.id}.desc`)
  return v.startsWith('ach.') ? (a.description ?? a.desc ?? '') : v
}
