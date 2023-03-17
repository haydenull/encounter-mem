import { Button, Loader, Title } from '@mantine/core'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NavBar from '~/components/NavBar'
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

  return (
    <div>
      <NavBar />
      {isLoading ? (
        <>
          <div className="h-screen flex items-center justify-center">
            <Loader />
          </div>
        </>
      ) : (
        <div className="px-2">
          <Title>{vocabulary?.word}</Title>
          <div>
            {vocabulary?.sentences?.map((sentence) => (
              <p key={sentence.id}>{sentence.content}</p>
            ))}
          </div>
          <div className="my-2">
            <Button onClick={onClickAICreate} loading={sentenceByAI?.loading}>
              Create Sentence by AI
            </Button>
            <p>{sentenceByAI?.content}</p>
          </div>
          <Button onClick={() => router.push({ pathname: '/chat', query: { word: vocabulary?.word } })}>
            Chat with AI
          </Button>
        </div>
      )}
    </div>
  )
}

export default Index
