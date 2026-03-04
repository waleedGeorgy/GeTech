import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import appCss from '../styles.css?url'
import { client } from '@/lib/appwrite'
import { getThemeServerFn } from '@/lib/theme'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'

/* To enable tanstack query client throughout the codebase, we need to use the 'createRootROuteWithContext' function
instead of the normal createRootRoute, and pass it the query client as a generic. */
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'GeTech',
      },
      {
        description: 'GeTech is your one-stop shop for all things tech. Discover our wide range of products, from the latest gadgets to essential accessories, all at unbeatable prices.',
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // Query client is accessed by using the `useRouteContext()` hook from the route object
  const { queryClient } = Route.useRouteContext();

  const theme = Route.useLoaderData();

  useEffect(() => {
    // Ping Appwrite backend once on app startup to verify setup
    client.ping().catch(() => {
      // ignore ping errors in production flow; dev may check console
      // console.warn('Appwrite ping failed')
    })
  }, [])

  return (
    /* We then need to provide the client to the entire app, by wrapping the app inside <QueryClientProvider>.
    Finally we also need to define the client in the `router.tsx` file */
    <QueryClientProvider client={queryClient}>
      <html lang="en" className={theme}>
        <head>
          <HeadContent />
        </head>
        <body className='min-h-screen antialiased'>
          <ThemeProvider theme={theme}>
            <Header />
            <main className='container max-w-6xl mx-auto px-4 py-8'>
              {children}
            </main>
          </ThemeProvider>
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  )
}
