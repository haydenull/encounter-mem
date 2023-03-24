import { OpenAIStream } from '~/utils/OpenAIStream'

export const config = {
  runtime: 'edge',
}

const payload = {
  model: 'gpt-3.5-turbo',
  temperature: 0,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1,
  stream: true,
}
export type RequestPayload = typeof payload & {
  messages?: {
    role: 'assistant' | 'user' | 'system'
    content: string
  }[]
}
const handler = async (req: Request): Promise<Response> => {
  const { messages } = (await req.json()) as RequestPayload

  const stream = await OpenAIStream({
    ...payload,
    messages,
  })
  return new Response(stream)
}

export default handler
