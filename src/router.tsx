import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import NotFoundPage from './components/NotFoundPage'
import ErrorPage from './components/ErrorPage'
import { QueryClient } from '@tanstack/react-query'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    /* Enabling the tanstack router client for the entire app */
    context: {
      queryClient: new QueryClient(),
    },
    defaultNotFoundComponent: () => <NotFoundPage />,
    defaultErrorComponent: ({ error }) => <ErrorPage error={error} />
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
