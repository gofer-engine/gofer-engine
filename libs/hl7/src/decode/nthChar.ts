export const nthChar = (
  searchIn: string,
  searchFor: string,
  nthChar: number
) => {
  return searchIn.split(searchFor, nthChar).join(searchFor).length
}
