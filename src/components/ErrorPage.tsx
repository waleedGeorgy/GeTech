import { Link } from "@tanstack/react-router"
import { House } from "lucide-react"

const ErrorPage = ({ error }: { error: Error }) => {
    return (
        <div className="mt-24 flex flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-4xl font-bold uppercase">An error occurred</h2>
            {error.message.includes('Failed query') ?
                <p className="text-xl font-semibold">Error fetching data. Please try refreshing the page.</p>
                :
                <p className="text-xl font-semibold">{error.message}</p>
            }
            <Link to="/" className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-full hover:-translate-y-0.5 transition duration-200 shadow-md hover:shadow-lg font-semibold">
                <House />Back home
            </Link>
        </div>
    )
}

export default ErrorPage