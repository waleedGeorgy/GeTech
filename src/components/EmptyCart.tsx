import { ShoppingBasket } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty"
import { Link } from "@tanstack/react-router"

const EmptyCart = () => {
    return (
        <div className='max-w-3xl mx-auto'>
            <Card className='shadow-md'>
                <CardContent>
                    <Empty>
                        <EmptyMedia variant='icon'>
                            <ShoppingBasket className='size-10' />
                        </EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle className='text-xl'>Your cart is empty</EmptyTitle>
                            <EmptyDescription>Add something from the catalogue</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Link
                                to='/products'
                                className='inline-flex items-center gap-2 rounded-full text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md bg-accent px-4 py-1 text-background'
                            >
                                Browse products
                            </Link>
                        </EmptyContent>
                    </Empty>
                </CardContent>
            </Card>
        </div>
    )
}

export default EmptyCart