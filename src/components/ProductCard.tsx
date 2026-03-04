import { Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import z from "zod";
import { Check, Loader, ShoppingBag, Star } from "lucide-react";
import { handleUpdateCartItems } from "@/routes/cart";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import type { ProductSelect } from "@/db/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export const checkItemInCart = createServerFn({ method: "GET" })
    .inputValidator(z.object({ productId: z.string() }))
    .handler(async ({ data }) => {
        const itemInCart = await db
            .select()
            .from(cartItems)
            .where(eq(cartItems.productId, data.productId))
            .limit(1);

        if (itemInCart.length > 0) return true;
        else return false;
    });

const ProductCard = ({ product }: { product: ProductSelect }) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    /* User side data fetching can be done with tanstack query using 'useQuery()'. It can be used inside components
      that don't have a designated route.
      In cases where there IS a route, tanstack query can be used to cache data that is being fetched by the server function,
      and is a powerful tanstack start pattern.
      It returns an object that contains the data fetched, 'isPending' which allows us the create fallback content, 'error'
      which contains any errors generated from the query, etc... */
    const { data: isItemInCart, isPending } = useQuery({
        /* Each query can have one or multiple identifiers (they can also be dynamic),
        which allows us to target this specific query from anywhere inside the code.
        Can be used, for example, for invalidating caches or execute refetching of said queries. */
        queryKey: ['checkItemInCart', product.id],
        /* It should have a query which actually fetches the data. Receives a QueryFunctionContext object with
        useful properties like queryKey and signal (for aborting requests). */
        queryFn: () => checkItemInCart({ data: { productId: product.id } }),
        /* Provides initial data before the query completes. Useful for optimistic UI updates or when you
        already have some data. The query will still fetch in the background (unless staleTime is set appropriately) */
        /* initialData: SOME_DATA, */
        /* How long the data is considered "fresh" before it becomes "stale". While fresh, queries won't refetch when
        the component remounts, the window is refocused or the network reconnects. After staleTime passes,
        background refetches may occur*/
        staleTime: 1000 * 60,
    });

    return (
        <Link to="/products/$id" params={{ id: product.id }}>
            <Card className="shadow-md hover:shadow-lg hover:-translate-y-1 transition">
                <CardHeader>
                    <img src={product.image} alt={product.name} className="border w-full h-72 rounded-lg object-cover overflow-hidden" />
                    <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold flex items-center gap-1 justify-between">
                            <Star className="size-3.5 text-amber-500" />
                            {product.rating}
                        </span>
                        <span className="text-zinc-500 italic">
                            ({product.reviews} reviews)
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3 py-3">
                    <span className="font-semibold text-base">${product.price}</span>
                    <Button
                        size='sm'
                        variant={isItemInCart ? "outline" : "default"}
                        className='cursor-pointer hover:brightness-110 transition'
                        disabled={isPending}
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await handleUpdateCartItems({
                                data: { action: "add", productId: product.id, quantity: 1 }
                            });
                            await router.invalidate({ sync: true });
                            await Promise.all([
                                queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] }),
                                queryClient.invalidateQueries({ queryKey: ['checkItemInCart', product.id] })
                            ]);
                        }}
                    >
                        {isPending ? (
                            <Loader className="animate-spin" />
                        ) : isItemInCart ? (
                            <>
                                <Check className="mr-1" />
                                <span>Item in cart</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="mr-1" />
                                <span>Add to cart</span>
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </Link >
    )
}

export default ProductCard