import { Link } from "@tanstack/react-router"
import { House } from "lucide-react"

const NotFoundPage = () => {
    return (
        <div className="mt-24 flex flex-col items-center justify-center gap-4">
            <h2 className="text-4xl font-bold">404 - NOT FOUND</h2>
            <p className="text-xl font-semibold">The resource you are looking for does not exist, or has been deleted.</p>
            <Link to="/" className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-full hover:-translate-y-0.5 transition duration-200 shadow-md hover:shadow-lg font-semibold">
                <House />Back home
            </Link>
        </div>
    )
}

export default NotFoundPage