import { Button, Input, Title } from '@mantine/core'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import NavBar from '~/components/NavBar'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { word } = router.query
  const messageEndRef = useRef<HTMLDivElement>(null)

  const [inputValue, setInputValue] = useState<string>('')

  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([])

  const onClickSend = () => {
    setMessages((_prev) => [..._prev, { role: 'user', content: inputValue }])
    setInputValue('')

    let isFirst = true
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSSE(
      [
        {
          role: 'user',
          content: word as string,
        },
      ].concat(messages, {
        role: 'user',
        content: inputValue,
      }),
      {
        openaiType: OpenaiType.chat,
        onMessage: (data) => {
          if (isFirst) {
            isFirst = false
            return setMessages((_prev) => {
              return [..._prev, { role: 'assistant', content: data?.choices?.[0]?.delta?.content || '' }]
            })
          }
          setMessages((_prev) => {
            const lastMessage = _prev[_prev.length - 1]
            const updatedMessage = {
              role: 'assistant',
              content: (lastMessage?.content || '') + (data?.choices?.[0]?.delta?.content || ''),
            } as const
            return _prev.slice(0, -1).concat(updatedMessage)
          })
        },
      }
    )
  }

  useEffect(() => {
    if (word) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchSSE(word as string, {
        openaiType: OpenaiType.chat,
        onMessage: (data) => {
          setMessages((_prev) => [
            {
              role: 'assistant',
              content: (_prev?.[0]?.content || '') + (data?.choices?.[0]?.delta?.content || ''),
            },
          ])
        },
      })
    }
  }, [word])
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="min-h-screen pb-12">
      <NavBar />
      <Title className="flex justify-center">{word}</Title>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx(['my-2 flex px-2', message.role === 'assistant' ? 'justify-start' : 'justify-end'])}
          >
            <p
              className={clsx('rounded shadow-md p-2', message.role === 'assistant' ? 'bg-gray-200' : 'bg-blue-300')}
              style={{ maxWidth: '80%' }}
            >
              {message.content}
            </p>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      <div className="w-screen flex fixed bottom-0 p-2 justify-between">
        <Input className="flex-1 flex" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <Button className="ml-2" onClick={onClickSend}>
          Send
        </Button>
      </div>
    </div>
  )
}

export default Index
