export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

const CART_KEY = "furnistore_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const cart = localStorage.getItem(CART_KEY);

  if (!cart) {
    return [];
  }

  try {
    return JSON.parse(cart);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...item,
      quantity: 1,
    });
  }

  saveCart(cart);
}

export function removeFromCart(id: string) {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) => item.id !== id
  );

  saveCart(updatedCart);
}

export function updateCartQuantity(
  id: string,
  quantity: number
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) => cartItem.id === id
  );

  if (!item) {
    return;
  }

  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }

  item.quantity = quantity;

  saveCart(cart);
}

export function getCartCount() {
  const cart = getCart();

  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function getCartTotal() {
  const cart = getCart();

  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}