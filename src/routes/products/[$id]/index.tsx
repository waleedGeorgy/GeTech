import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq, ne, sql } from 'drizzle-orm';
import z from 'zod';
import { ArrowLeft, Check, Heart, Info, Loader, ShoppingBag, Star } from 'lucide-react';
import { db } from '@/db'
import { products } from '@/db/schema';
import { handleUpdateCartItems } from '@/routes/cart';
import ProductCard, { checkItemInCart } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const fetchSingleProduct = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const product = await db.select().from(products).where(eq(products.id, data.id)).limit(1);
    if (product.length === 0) throw notFound();
    else return product[0];
  });

const fetchRecommendedProductsExceptCurrent = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const recommendedProducts = await db.select().from(products).where(ne(products.id, data.id)).orderBy(sql`RANDOM()`).limit(4);
    return recommendedProducts;
  })

export const Route = createFileRoute('/products/$id/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const singleProduct = await fetchSingleProduct({ data: { id: params.id } });
    const recommendedProducts = await fetchRecommendedProductsExceptCurrent({ data: { id: params.id } });
    return { singleProduct, recommendedProducts }
  },
  // Adding metadata for each product details page for better SEO and social sharing
  head: async ({ loaderData: product }) => {
    return {
      meta: [
        { name: 'description', content: product?.singleProduct.description },
        { name: 'image', content: product?.singleProduct.image },
        { name: 'title', content: product?.singleProduct.name },
        {
          name: 'canonical',
          content: process.env.NODE_ENV === 'production' ?
            `https://getech.com/products/${product?.singleProduct.id}`
            :
            `http://localhost:3000/products/${product?.singleProduct.id}`
        }
      ],
    }
  },
})

function RouteComponent() {
  const { singleProduct, recommendedProducts } = Route.useLoaderData();

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: isItemInCart, isPending } = useQuery({
    queryKey: ['checkItemInCart', singleProduct.id],
    queryFn: () => checkItemInCart({ data: { productId: singleProduct.id } })
  });

  return (
    <div className='space-y-4 max-w-5xl mx-auto'>
      <Link to='/products' className='text-accent text-sm font-semibold flex items-center gap-1.5 hover:brightness-125 transition w-fit'>
        <ArrowLeft className='size-4' />
        Back to products
      </Link>
      <Card className='p-6 grid md:grid-cols-2 shadow-md'>
        <CardHeader>
          <div className='overflow-hidden rounded-lg border'>
            <img src={singleProduct.image} alt={singleProduct.name} className='w-full object-contain rounded-lg' loading='lazy' />
          </div>
        </CardHeader>
        <div className='flex flex-col gap-5'>
          <CardTitle className='flex items-center gap-4'>
            <h2 className='text-3xl font-light tracking-wide'>{singleProduct.name}</h2>
            <div className='flex items-center gap-2'>
              {singleProduct.badge &&
                <span className="text-sm border rounded-full px-3 py-0.5 bg-accent-foreground text-foreground">
                  {singleProduct.badge.substring(0, 1).toUpperCase() + singleProduct.badge.substring(1)}
                </span>
              }
            </div>
          </CardTitle>
          <CardContent className='flex flex-col gap-5 px-0'>
            <CardDescription className='text-base text-foreground opacity-75'>
              {singleProduct.description}
            </CardDescription>
            <p className='flex items-center gap-1.5'>
              <Star size={16} className='text-amber-500' />{singleProduct.rating}
              <span className='opacity-80 italic'>({singleProduct.reviews} reviews)</span>
            </p>
            <div className='flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium bg-zinc-100 dark:bg-zinc-800'>
              <Info className='size-5 text-accent' />
              {singleProduct.inventory === 'in-stock' ? 'Ships in 2-3 business days.' :
                singleProduct.inventory === 'backorder' ? 'Back-ordered. Shipping in ~2 weeks.' :
                  'Pre-ordered. Shipping in the next drop.'
              }
            </div>
            <div className='flex items-center justify-center gap-3'>
              <span className='text-2xl'>
                ${singleProduct.price}
              </span>
              <Button className='cursor-pointer hover:brightness-110 transition'
                disabled={isPending}
                variant={isItemInCart ? "outline" : "default"}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  await handleUpdateCartItems({
                    data: { action: "add", productId: singleProduct.id, quantity: 1 }
                  });

                  await router.invalidate({ sync: true });

                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['cartItemsTotalCountAndPrice'] }),
                    queryClient.invalidateQueries({ queryKey: ['checkItemInCart', singleProduct.id] })
                  ]);
                }}>
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
              <Button size='icon' variant='outline' className='cursor-pointer'>
                <Heart className='text-red-500' />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
      {/* Recommended products card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="uppercase text-accent text-sm">
            Recommended for you
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
