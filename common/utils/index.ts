export const universalBtoa = (str: string) => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
};

export const universalAtob = (b64Encoded: string) => {
  try {
    return atob(b64Encoded);
  } catch (err) {
    return Buffer.from(b64Encoded, 'base64').toString();
  }
};


export const urlWithShopParam = (url: string, shop?: string) => {
  const parsedUrl = new URL(url)
  if (shop) {
    const base64Shop = universalBtoa(shop);
    parsedUrl.searchParams.append('_s', base64Shop);
  }
  return parsedUrl.toString();
}