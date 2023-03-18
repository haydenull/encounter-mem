import { vocabularyRouter } from '~/server/api/routers/vocabulary'
import { createTRPCRouter } from '~/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  vocabulary: vocabularyRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
