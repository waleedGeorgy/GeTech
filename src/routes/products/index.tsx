import { createFileRoute } from '@tanstack/react-router'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { products } from '@/db/schema'
import ProductCard from '@/components/ProductCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

const fetchAllProducts = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  });

/* The basic syntax for creating a route middleware.
We use the `createMiddleware()` function, that can be chained with multiple 'middleware' function,
where we can define additional functionality, and 'server()' where we define what the middleware does.
It accepts a 'request' object, which contains all the routing data, and the 'next()' function which moves
middleware execution forward. Without this function the middleware gets stuck in an infinite loop. */
const loggerMiddleware = createMiddleware().server(async ({ request, next }) => {
  console.log("Logger middleware " + request.url + " - From: " + request.headers.get('origin'));
  return next();
})

export const Route = createFileRoute('/products/')({
  component: RouteComponent,
  loader: async () => {
    const loadedProducts = await fetchAllProducts();
    return { loadedProducts }
  },
  /* To run the middleware, we invoke it inside the 'server' property of the route. */
  server: {
    middleware: [loggerMiddleware],
    /* HTTP endpoint call also be defined. Here if a POST request hits this route `/products/`, a JSON response will
    be sent back */
    handlers: {
      POST: async () => {
        return Response.json({ message: "Called the post endpoint" });
      },
    }
  }
})

function RouteComponent() {
  const { loadedProducts: allProducts } = Route.useLoaderData();

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Browse all products</h2>
      <section>
        <Card className="shadow-lg p-6">
          <CardHeader>
            <CardTitle className="uppercase text-accent text-sm">
              All products
            </CardTitle>
          </CardHeader>
          <div className="grid md:grid-cols-3 gap-4 pb-6 mt-4">
            {allProducts.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
