import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchRecommendedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    return await db.select().from(products).orderBy(sql`RANDOM()`).limit(4);
  });

export const Route = createFileRoute("/")({
  component: MainPage,
  loader: async () => {
    return await fetchRecommendedProducts();
  }
});

function MainPage() {
  const productsData = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <section>
        <Card className="shadow-lg p-6">
          <CardHeader>
            <CardTitle className="uppercase text-accent text-sm tracking-wide">
              The only tech store you will ever need
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-4xl font-semibold tracking-wide">
              Get all your tech on{" "}
              <span className="text-accent">GeTech</span>
            </h2>
            <p className="text-sm mt-1 opacity-75">
              Start by browsing our products, or check some of our favorite picks below
            </p>
            <Link to='/products' className="mt-6 flex items-center justify-center gap-1.5 bg-accent text-background w-fit rounded-full px-6 py-2 hover:-translate-y-0.5 transition duration-200 shadow-md hover:shadow-lg group">
              <p className="text-sm font-semibold">Browse all products</p>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition duration-200" />
            </Link>
          </CardContent>
        </Card>
      </section>
      <section>
        <Card className="shadow-lg p-6">
          <CardHeader>
            <CardTitle className="uppercase text-accent text-xs">
              Recommended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-semibold tracking-wide">
              Our picks from the catalog
            </h3>
            <p className="text-sm mt-1 opacity-75">
              Items curated by us, for you
            </p>
          </CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-6 mt-4">
            {productsData.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Card>
      </section>
    </div >
  );
}