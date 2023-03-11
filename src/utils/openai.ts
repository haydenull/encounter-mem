import { env } from '~/env.mjs'

const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${env.NEXT_PUBLIC_OPENAI_API_KEY}`,
}
const OPENAI_COMMON_MESSAGE = {
  translate: {
    systemPrompt:
      'You are a translation engine that can only translate text and cannot interpret it.',
    assistantPrompt: 'translate the following text into Chinese:',
  },
}
const OPENAI_PARAMS = {
  model: 'gpt-3.5-turbo',
  temperature: 0,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1,
}

export const fetchOpenai = async (prompt: string) => {
  return fetch(`${env.NEXT_PUBLIC_OPENAI_SERVER}/v1/chat/completions`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      ...OPENAI_PARAMS,
      stream: false,
      messages: [
        {
          role: 'system',
          content: OPENAI_COMMON_MESSAGE.translate.systemPrompt,
        },
        {
          role: 'user',
          content: OPENAI_COMMON_MESSAGE.translate.assistantPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })
}

export type StreamData = {
  choices: {
    delta: { content?: string; role?: string }
    index: number
    finish_reason: null | 'stop'
  }[]
}
interface FetchSSEOptions extends RequestInit {
  onMessage: (data: StreamData) => void
  onError: (error: Error) => void
}
export async function fetchSSE(
  prompt: string,
  { onMessage, onError }: FetchSSEOptions
) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_OPENAI_SERVER}/v1/chat/completions`,
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        ...OPENAI_PARAMS,
        stream: true,
        messages: [
          {
            role: 'system',
            content: OPENAI_COMMON_MESSAGE.translate.systemPrompt,
          },
          {
            role: 'user',
            content: OPENAI_COMMON_MESSAGE.translate.assistantPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }
  )
  const reader = response.body?.getReader()
  if (!reader) {
    return onError(new Error('No reader'))
  }
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      buffer += new TextDecoder().decode(value)
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      lines.forEach((line) => {
        const _line = line?.replace(/^data: /, '')
        try {
          const json = JSON.parse(_line) as StreamData
          onMessage(json)
        } catch (err) {}
      })
    }
  }
}
