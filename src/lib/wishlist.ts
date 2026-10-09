export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

const WISHLIST_KEY = "furnistore_wishlist";

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const wishlist = localStorage.getItem(WISHLIST_KEY);

  if (!wishlist) {
    return [];
  }

  try {
    return JSON.parse(wishlist);
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist: WishlistItem[]) {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(wishlist)
  );

  window.dispatchEvent(new Event("wishlistUpdated"));
}

export function addToWishlist(
  item: WishlistItem
) {
  const wishlist = getWishlist();

  const alreadyExists = wishlist.some(
    (wishlistItem) => wishlistItem.id === item.id
  );

  if (alreadyExists) {
    return;
  }

  wishlist.push(item);

  saveWishlist(wishlist);
}

export function removeFromWishlist(id: string) {
  const wishlist = getWishlist();

  const updatedWishlist = wishlist.filter(
    (item) => item.id !== id
  );

  saveWishlist(updatedWishlist);
}

export function isInWishlist(id: string) {
  const wishlist = getWishlist();

  return wishlist.some(
    (item) => item.id === id
  );
}

export function getWishlistCount() {
  return getWishlist().length;
}