export interface Metafield {
  key: string
  namespace: string
  jsonValue?: string
  value: string
  type: string
}
export interface MetafieldsSetInput {
  key: string
  namespace: string
  jsonValue?: string
  value: string
  type: string
}