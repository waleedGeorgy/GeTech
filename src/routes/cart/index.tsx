import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { Loader, Minus, Plus, Trash } from 'lucide-react';
import z from 'zod';
import { addToCart, clearCart, removeCartItem, updateCartItem } from '@/data/cart';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import EmptyCart from '@/components/EmptyCart';
import { CartItemSummaryRow } from '@/components/CartItemSummaryRow';

export const fetchCartItems = createServerFn({ method: "GET" })
  .handler(async () => {
    const cart = await db.select().from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .orderBy(desc(cartItems.createdAt));

    return {
      items: cart.map(item => ({
        ...item.products,
        quantity: item.cart_items.quantity
      }))
    };
  });

export const handleUpdateCartItems = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    action: z.enum(['add', 'remove', 'update', 'clear']),
    productId: z.string(),
    quantity: z.number()
  })).handler(async ({ data }) => {
    switch (data.action) {
      case "add":
        return await addToCart(data.productId, data.quantity);
      case "update":
        return await updateCartItem(data.productId, data.quantity);
    }
  });

export const handleDeleteCartItems = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    action: z.enum(['remove', 'clear']),
    productId: z.string().optional(),
  })).handler(async ({ data }) => {
    switch (data.action) {
      case "remove":
        return await removeCartItem(data.productId as string);
      case "clear":
        return await clearCart();
    }
  });

export const Route = createFileRoute('/cart/')({
  component: RouteComponent,
  loader: async () => {
    return await fetchCartItems();
  }
})

function RouteComponent() {
  const { items } = Route.useLoaderData();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCartEmptying, setIsCartEmptying] = useState<boolean>(false);

  const shippingCost = Math.floor(Math.random() * 10);
  const shipping = items.length > 0 ? shippingCost : 0;

  const subtotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  const total = shipping + subtotal;

  if (items.length === 0) return <EmptyCart />

  return (
    <Card className="mx-auto max-w-4xl gap-6 rounded-2xl border p-6 shadow-sm">
      {/* Cart info */}
      <div className="space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Cart</CardTitle>
          <CardDescription className="text-sm">
            Review your picks before checking out.
          </CardDescription>
          <CardAction>
            <Button variant="destructive" size="sm"
              disabled={isCartEmptying}
              className='cursor-pointer'
              onClick={async () => {
                setIsCartEmptying(true);

                await handleDeleteCartItems({
                  data: { action: "clear" }
                });

                router.invalidate({ sync: true });
                queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] });

                setIsCartEmptying(false);
              }}>
              {isCartEmptying ?
                <Loader className='animate-spin' />
                :
                <>
                  <Trash />Clear cart
                </>
              }
            </Button>
          </CardAction>
        </CardHeader>
        {/* Cart items */}
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-1 py-2 px-3 border rounded-xl shadow-md bg-zinc-50 dark:bg-background/50"
              >
                {/* Cart items image */}
                <div className="hidden items-center justify-center rounded-lg border sm:flex">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-20 object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
                {/* Cart item name */}
                <Link
                  to="/products/$id"
                  params={{ id: item.id }}
                  className="text-base hover:text-accent transition underline underline-offset-2"
                >
                  {item.name}
                </Link>
                {/* Cart item actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Decrease ${item.name}`}
                        onClick={async () => {
                          await handleUpdateCartItems({
                            data: { action: "update", productId: item.id, quantity: item.quantity - 1 }
                          });

                          router.invalidate({ sync: true });
                          queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] })
                        }}
                      >
                        <Minus />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) => {
                          e.preventDefault()
                          e.stopPropagation();
                          console.log("Quantity changed")
                        }}
                        className="rounded-lg border text-sm font-semibold w-14"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Increase ${item.name}`}
                        onClick={async () => {
                          await handleUpdateCartItems({
                            data: { action: "add", productId: item.id, quantity: 1 }
                          });
                          router.invalidate({ sync: true });
                          queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] })
                        }}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <span className="text-base w-16 text-right">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    disabled={isDeleting}
                    className='cursor-pointer'
                    variant="destructive"
                    onClick={async () => {
                      setIsDeleting(true);

                      await handleDeleteCartItems({
                        data: { action: "remove", productId: item.id }
                      });

                      router.invalidate({ sync: true });
                      queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] });

                      setIsDeleting(false);
                    }}
                  >
                    {isDeleting ? <Loader className='animate-spin' /> : <Trash />}
                  </Button>
                </div>
              </div>)
          })}
          {/* Cart summary */}
          <div className="mt-4 space-y-4 rounded-xl border p-5 text-sm shadow-md bg-zinc-50 dark:bg-background/50">
            <h2 className="text-base font-semibold">Order summary</h2>
            <div className="space-y-2">
              <CartItemSummaryRow label="Sub-total" value={subtotal} />
              <CartItemSummaryRow label="Shipping" value={shipping} />
              <Separator />
              <CartItemSummaryRow label="Total" value={total} bold />
            </div>
            <Button className="w-full hover:brightness-110 transition cursor-pointer" variant='default'>
              Checkout
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}