import { Box, Button, Input, ScrollArea, Title } from '@mantine/core'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import NavBar from '~/components/NavBar'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { word } = router.query
  const viewport = useRef<HTMLDivElement>(null)

  const [inputValue, setInputValue] = useState<string>('')

  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([])

  // TODO: 防抖
  const scrollToBottom = () => {
    viewport.current?.scrollTo({
      top: viewport.current?.scrollHeight,
      behavior: 'smooth',
    })
  }
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
            setMessages((_prev) => {
              return [..._prev, { role: 'assistant', content: data?.choices?.[0]?.delta?.content || '' }]
            })
            scrollToBottom()
            return
          }
          setMessages((_prev) => {
            const lastMessage = _prev[_prev.length - 1]
            const updatedMessage = {
              role: 'assistant',
              content: (lastMessage?.content || '') + (data?.choices?.[0]?.delta?.content || ''),
            } as const
            return _prev.slice(0, -1).concat(updatedMessage)
          })
          scrollToBottom()
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

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <Title className="flex justify-center">{word}</Title>
      <ScrollArea className="flex-1" viewportRef={viewport}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx(['my-4 flex px-4', message.role === 'assistant' ? 'justify-start' : 'justify-end'])}
          >
            <Box
              className="shadow-md p-3"
              sx={(theme) => {
                const backgroundColor = {
                  assistant: {
                    light: theme.colors.gray[0],
                    dark: theme.colors.dark[6],
                  },
                  user: {
                    light: theme.colors.teal[3],
                    dark: theme.colors.teal[9],
                  },
                }
                return {
                  backgroundColor: backgroundColor[message.role][theme.colorScheme],
                  maxWidth: '80%',
                  borderRadius: theme.radius.lg,
                  borderBottomLeftRadius: message.role === 'assistant' ? 0 : theme.radius.lg,
                  borderBottomRightRadius: message.role === 'user' ? 0 : theme.radius.lg,
                }
              }}
            >
              {message.content}
            </Box>
          </div>
        ))}
      </ScrollArea>
      <div className="w-screen flex p-4 justify-between">
        <Input className="flex-1 flex" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <Button className="ml-2" onClick={onClickSend}>
          Send
        </Button>
      </div>
    </div>
  )
}

export default Index
