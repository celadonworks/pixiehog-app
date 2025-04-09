export const isNumber = function (x: unknown): x is number {
  return toString.call(x) == '[object Number]'
}