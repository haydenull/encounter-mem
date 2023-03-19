import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc'

export const vocabularyRouter = createTRPCRouter({
  createVocabulary: publicProcedure
    .input(
      z.object({
        word: z.string(),
        meaning: z.string().optional(),
        sentence: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingVocabulary = await ctx.prisma.vocabulary.findFirst({
        where: {
          word: {
            equals: input.word,
          },
        },
      })
      const existingSentence = await ctx.prisma.sentence.findFirst({
        where: {
          content: input.sentence,
        },
      })
      // Create one if the sentence does not exist.
      const sentence = existingSentence
        ? existingSentence
        : await ctx.prisma.sentence.create({
            data: { content: input.sentence, userId: ctx.session?.user?.id },
          })
      // Add the new sentence to the array of sentences.
      if (existingVocabulary) {
        return ctx.prisma.vocabulary.update({
          where: {
            id: existingVocabulary.id,
          },
          data: {
            sentences: {
              connect: { id: sentence.id },
            },
          },
        })
      }
      // Create the word if it does not exist.
      return ctx.prisma.vocabulary.create({
        data: {
          word: input.word,
          meaning: input.meaning,
          userId: ctx.session?.user?.id,
          sentences: {
            connect: { id: sentence.id },
          },
        },
      })
    }),

  getVocabularies: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.id
    return ctx.prisma.vocabulary.findMany({
      where: {
        userId,
      },
    })
  }),
  getVocabulary: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const userId = ctx.session?.user?.id
    const vocabulary = await ctx.prisma.vocabulary.findFirst({
      where: {
        id: input.id,
        userId,
      },
    })
    if (!vocabulary) return null
    // get sentences
    const sentences = await ctx.prisma.sentence.findMany({
      where: {
        vocabularies: {
          some: {
            id: input.id,
            userId,
          },
        },
      },
    })
    return { ...vocabulary, sentences }
  }),
  getSentences: publicProcedure.input(z.object({ vocabularyId: z.number() })).query(async ({ input, ctx }) => {
    const userId = ctx.session?.user?.id
    return ctx.prisma.sentence.findMany({
      where: {
        vocabularies: {
          some: {
            id: input.vocabularyId,
            userId,
          },
        },
      },
    })
  }),
  getUserInfo: publicProcedure.query(async ({ input, ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: ctx.session?.user?.id,
      },
    })
  }),
  updateUserTopic: protectedProcedure.input(z.object({ topic: z.string() })).mutation(async ({ input, ctx }) => {
    return ctx.prisma.user.update({
      where: {
        id: ctx.session?.user?.id,
      },
      data: {
        topic: input.topic,
      },
    })
  }),

  // createSentence: publicProcedure
  //   .input(
  //     z.object({
  //       content: z.string(),
  //     })
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     const existingSentence = await ctx.prisma.sentence.findFirst({
  //       where: {
  //         content: input.content,
  //       },
  //     })
  //     if (existingSentence) return existingSentence
  //     return ctx.prisma.sentence.create({
  //       data: {
  //         content: input.content,
  //       },
  //     })
  //   }),
})
