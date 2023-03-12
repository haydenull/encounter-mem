/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Heading, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NavBar from '~/pages/components/NavBar'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { wordId } = router.query

  const { data: vocabulary, isLoading } = api.vocabulary.getVocabulary.useQuery({ id: Number(wordId) })

  const [sentenceByAI, setSentenceByAI] = useState({ loading: false, content: '' })

  const onClickAICreate = async () => {
    const word = vocabulary?.word
    if (!word) return
    setSentenceByAI((_prev) => ({ ..._prev, loading: true }))
    await fetchSSE(word, {
      openaiType: OpenaiType.createSentence,
      onMessage(data) {
        setSentenceByAI((_prev) => ({
          ..._prev,
          loading: false,
          content: _prev.content + (data?.choices?.[0]?.delta?.content || ''),
        }))
      },
    })
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )

  return (
    <div>
      <NavBar />
      <Heading>{vocabulary?.word}</Heading>
      <div>
        {vocabulary?.sentences?.map((sentence) => (
          <p key={sentence.id}>{sentence.content}</p>
        ))}
      </div>
      <div className="my-2">
        <Button onClick={onClickAICreate} isLoading={sentenceByAI?.loading}>
          AI Create
        </Button>
        <p>{sentenceByAI?.content}</p>
      </div>
      <Button onClick={() => router.push({ pathname: '/chat', query: { word: vocabulary?.word } })}>
        Chat with AI
      </Button>
    </div>
  )
}

export default Index
