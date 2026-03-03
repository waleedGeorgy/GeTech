import { db } from '@/db';
import { cartItems } from '@/db/schema';
import { eq, gt } from 'drizzle-orm';

export const updateCartItem = async (
  productId: string,
  quantity: number = 1,
) => {
  const qty = Math.max(0, Math.min(quantity, 99));

  if (qty === 0)
    await db.delete(cartItems).where(eq(cartItems.productId, productId));
  else {
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.productId, productId))
      .limit(1);

    if (existingItem.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: qty })
        .where(eq(cartItems.productId, productId));
    }
  }
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const qty = Math.max(1, Math.min(quantity, 99));

  const existingItem = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.productId, productId))
    .limit(1);

  if (existingItem.length > 0) {
    await updateCartItem(productId, existingItem[0].quantity + qty);
  } else {
    await db.insert(cartItems).values({ productId, quantity: qty });
  }
};

export const removeCartItem = async (productId: string) => {
  await db.delete(cartItems).where(eq(cartItems.productId, productId));
};

export const clearCart = async () => {
  await db.delete(cartItems).where(gt(cartItems.quantity, 0));
};
