import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

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
          word: input.word,
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
            data: { content: input.sentence },
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
          sentences: {
            connect: { id: sentence.id },
          },
        },
      })
    }),

  getVocabularies: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.vocabulary.findMany()
  }),
  getVocabulary: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const vocabulary = await ctx.prisma.vocabulary.findUnique({
      where: {
        id: input.id,
      },
    })
    if (!vocabulary) return null
    // get sentences
    const sentences = await ctx.prisma.sentence.findMany({
      where: {
        vocabularies: {
          some: {
            id: input.id,
          },
        },
      },
    })
    return { ...vocabulary, sentences }
  }),
  getSentences: publicProcedure.input(z.object({ vocabularyId: z.number() })).query(async ({ input, ctx }) => {
    return ctx.prisma.sentence.findMany({
      where: {
        vocabularies: {
          some: {
            id: input.vocabularyId,
          },
        },
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
