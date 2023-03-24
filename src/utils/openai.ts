import type { User } from '@prisma/client'

const HEADERS = {
  'Content-Type': 'application/json',
}
export enum OpenaiType {
  translate = 'translate',
  createSentence = 'createSentence',
  chat = 'chat',
}
// const OPENAI_COMMON_MESSAGE = {
//   [OpenaiType.translate]: {
//     systemPrompt: 'You are a translation engine that can only translate text and cannot interpret it.',
//     assistantPrompt: 'translate the following text into Chinese:',
//   },
//   [OpenaiType.createSentence]: {
//     systemPrompt: 'You are a sentence creation engine that can only create sentences and cannot interpret them.',
//     assistantPrompt:
//       'Create a sentence composed of simple and commonly used words, related to front-end development, programmers or technology, and containing the following words:',
//   },
//   [OpenaiType.chat]: {
//     systemPrompt: 'You are a chat engine that can only chat and cannot interpret it.',
//     assistantPrompt:
//       'You are an English teacher. In the following conversation, please try to include the following words as much as possible and ask me a question after each time you speak. The topic of conversation is related to front-end development, programmers or technology. Also, please point out any errors in my answers.',
//   },
// }
const OPENAI_PARAMS = {
  model: 'gpt-3.5-turbo',
  temperature: 0,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1,
}

// export const fetchOpenai = async (
//   prompt: string | { role: string; content: string }[],
//   type: OpenaiType = OpenaiType.translate
// ) => {
//   const COMMON_MESSAGES = [
//     {
//       role: 'system',
//       content: OPENAI_COMMON_MESSAGE[type].systemPrompt,
//     },
//     {
//       role: 'user',
//       content: OPENAI_COMMON_MESSAGE[type].assistantPrompt,
//     },
//   ]
//   const messages = Array.isArray(prompt)
//     ? COMMON_MESSAGES.concat(prompt)
//     : COMMON_MESSAGES.concat({
//         role: 'user',
//         content: prompt,
//       })
//   return fetch(`${env.NEXT_PUBLIC_OPENAI_SERVER}/v1/chat/completions`, {
//     method: 'POST',
//     headers: HEADERS,
//     body: JSON.stringify({
//       ...OPENAI_PARAMS,
//       stream: false,
//       messages,
//     }),
//   })
// }

export type StreamData = {
  choices: {
    delta: { content?: string; role?: string }
    index: number
    finish_reason: null | 'stop'
  }[]
}
interface FetchSSEOptions extends RequestInit {
  openaiType?: OpenaiType
  onMessage: (data: StreamData) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
  userInfo?: User | null
}
export type Message = { role: 'system' | 'assistant' | 'user'; content: string }
export async function fetchSSE(
  prompt: string | Message[],
  { onMessage, onError, openaiType = OpenaiType.translate, userInfo, onSuccess }: FetchSSEOptions
) {
  const topic = userInfo?.topic || 'travel'
  let commonMessages: Message[] = []
  switch (openaiType) {
    case OpenaiType.translate:
      commonMessages = [
        {
          role: 'system',
          content: 'You are a translation engine that can only translate text and cannot interpret it.',
        },
        {
          role: 'user',
          content: 'translate the following text into Chinese:',
        },
      ]
      break
    case OpenaiType.createSentence:
      commonMessages = [
        {
          role: 'system',
          content: 'You are a sentence creation engine that can only create sentences and cannot interpret them.',
        },
        {
          role: 'user',
          content: `Create a sentence composed of simple and commonly used words, related to ${topic}, and containing the following words:`,
        },
      ]
      break
    case OpenaiType.chat:
      commonMessages = [
        {
          role: 'system',
          // content: `You are an English teacher who will help me become familiar with the usage of specified words. In our upcoming conversation, please ask me a question after each response, and after I respond, please be sure to point out any grammar or other errors I make (if there are any) and provide suggestions for correction. Now let's start our conversation on the topic of ${topic}.`,
          content: `你是一名英语老师，帮我熟悉指定单词的用法。在接下来的对话中请在每句回答后问我一个问题，并且在我回答后，务必指出我的语法或其他错误（如果有）并给出改正建议。
          现在让我们开始围绕${topic}来对话`,
        },
      ]
    default:
      break
  }
  const messages = Array.isArray(prompt)
    ? commonMessages.concat(prompt)
    : commonMessages.concat({
        role: 'user',
        content: prompt,
      })
  const response = await fetch(`./api/openai`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      ...OPENAI_PARAMS,
      stream: true,
      messages,
    }),
  })
  const reader = response.body?.getReader()
  if (!reader) {
    return onError?.(new Error('No reader'))
  }
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      onSuccess?.()
      break
    }
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
