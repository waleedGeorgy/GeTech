import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader, ShoppingBag, ShoppingCart } from 'lucide-react'
import { fetchCartItems } from '@/routes/cart'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'

export default function Header() {
  const { data: cartItems, isPending } = useQuery({
    queryKey: ['cartItemsTotalCountAndPrice'],
    queryFn: () => fetchCartItems()
  });

  const cartItemsCount = cartItems?.items.reduce((acc: number, item) => acc + Number(item.quantity), 0);
  const cartItemTotalPrice = cartItems?.items.reduce
    ((acc: number, item) => acc + Number(Number(item.price) * item.quantity), 0);

  return (
    <header className="bg-background/70 backdrop-blur-lg border-b sticky top-0 z-20">
      <div className='container max-w-6xl mx-auto p-4 flex items-center justify-between gap-2 flex-wrap'>
        <Link to='/' className="flex items-center gap-2.5 group text-center">
          <ShoppingBag className='bg-accent text-background p-1.5 rounded-lg size-7 group-hover:brightness-110 transition duration-300' />
          <h1 className='text-2xl font-medium tracking-tight group-hover:brightness-110 transition duration-300 text-foreground'>Ge<span className='text-accent'>Tech</span></h1>
        </Link>
        <nav className='flex items-center justify-center flex-wrap gap-2'>
          <Button asChild variant='ghost'>
            <Link to='/'>Home</Link>
          </Button>
          <Button asChild variant='ghost'>
            <Link to='/products'>Products</Link>
          </Button>
          <Button asChild variant='ghost'>
            <Link to='/products/add'>Add product</Link>
          </Button>
          <ThemeToggle />
          <Link
            disabled={isPending}
            to='/cart'
            className='shadow-sm inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-50 disabled:bg-zinc-500'>
            <ShoppingCart className='size-4' />
            {isPending ?
              <Loader className='animate-spin size-6' />
              :
              <>
                <span className='flex size-6 items-center justify-center rounded-full px-2 text-xs font-semibold bg-secondary'>{cartItemsCount}</span>
                <span className='text-xs font-medium'>${cartItemTotalPrice?.toFixed(2)}</span>
              </>
            }
          </Link>
        </nav>
      </div >
    </header >
  )
}
