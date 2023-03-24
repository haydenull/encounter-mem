import { env } from '~/env.mjs'
import { RequestPayload } from '~/pages/api/openai'

export async function OpenAIStream(payload: RequestPayload) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let counter = 0

  const res = await fetch(`${env.OPENAI_API_BASE_URL}/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  })
  console.log('[faiz:] === res', res.body)
  // return res.body

  const customStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of res.body as any) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })

  return customStream

  // const stream = new ReadableStream({
  //   async start(controller) {
  //     function onParse(event: ParsedEvent | ReconnectInterval) {
  //       console.log('[faiz:] === onParse', event)
  //       if (event.type === 'event') {
  //         const data = event.data
  //         console.log('[faiz:] === data', data)
  //         if (data === '[DONE]') {
  //           controller.close()
  //           return
  //         }
  //         try {
  //           const json = JSON.parse(data)
  //           const message = json.choices[0].message
  //           // if (counter < 2 && (text.match(/\n/) || []).length) {
  //           //   return
  //           // }
  //           const queue = encoder.encode(JSON.stringify(message))
  //           controller.enqueue(queue)
  //           counter++
  //         } catch (e) {
  //           controller.error(e)
  //         }
  //       }
  //     }

  //     const parser = createParser(onParse)
  //     for await (const chunk of res.body as any) {
  //       parser.feed(decoder.decode(chunk))
  //     }
  //   },
  // })

  // return stream
}
