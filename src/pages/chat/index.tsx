import { Button, Heading, Input } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { word } = router.query

  const [inputValue, setInputValue] = useState<string>('')

  const [chatHistory, setChatHistory] = useState<string[]>([])

  const onClickSend = () => {
    setChatHistory((_prev) => [..._prev, inputValue])
    setInputValue('')
  }
  const onClickChat = () => {
    const length = chatHistory?.length
    console.log('[faiz:] === length', length)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSSE(
      [
        {
          role: 'user',
          content: word as string,
        },
      ]
        .concat(
          chatHistory.map((item, index) => ({
            role: index % 2 === 0 ? 'system' : 'user',
            content: item,
          }))
        )
        .concat({
          role: 'user',
          content: inputValue,
        }),
      {
        openaiType: OpenaiType.chat,
        onMessage: (data) => {
          setChatHistory((_prev) => {
            const _newChatHistory = [..._prev]
            _newChatHistory[length] = (_prev[length] || '') + (data?.choices?.[0]?.delta?.content || '')
            return _newChatHistory
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
          setChatHistory((_prev) => [(_prev?.[0] || '') + (data?.choices?.[0]?.delta?.content || '')])
        },
      })
    }
  }, [word])

  return (
    <div className="min-h-screen pb-9">
      <Heading>{word}</Heading>
      <div>
        {chatHistory.map((chat, index) => (
          <p key={index} className="my-2">
            {chat}
          </p>
        ))}
      </div>
      <div className="flex fixed bottom-0">
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <Button onClick={onClickSend}>Send</Button>
        <Button onClick={onClickChat}>Chat</Button>
      </div>
    </div>
  )
}

export default Index
