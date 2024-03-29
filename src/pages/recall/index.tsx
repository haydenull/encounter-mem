import { Button, Loader, Title } from '@mantine/core'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { data: vocabularies, isLoading } = api.vocabulary.getVocabularies.useQuery()
  const { data: userInfo } = api.vocabulary.getUserInfo.useQuery()

  const currentVocabulary = vocabularies?.[0]
  const { data: sentences, isLoading: getSentencesLoading } = api.vocabulary.getSentences.useQuery(
    { vocabularyId: currentVocabulary?.id as number },
    { enabled: !!currentVocabulary }
  )

  const [sentenceByAI, setSentenceByAI] = useState({ loading: false, content: '' })

  const onClickAICreate = async () => {
    const word = currentVocabulary?.word
    if (!word) return
    setSentenceByAI((_prev) => ({ ..._prev, loading: true }))
    await fetchSSE(word, {
      openaiType: OpenaiType.createSentence,
      userInfo,
      onMessage(data) {
        setSentenceByAI((_prev) => ({
          ..._prev,
          loading: false,
          content: _prev.content + (data?.choices?.[0]?.delta?.content || ''),
        }))
      },
    })
  }

  if (isLoading || getSentencesLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    )

  return (
    <div>
      <Title>{currentVocabulary?.word}</Title>
      <div>
        {sentences?.map((sentence) => (
          <p key={sentence.id}>{sentence.content}</p>
        ))}
      </div>
      <div>
        <Button onClick={onClickAICreate} loading={sentenceByAI?.loading}>
          AI Create
        </Button>
        <p>{sentenceByAI?.content}</p>
      </div>
      <Button onClick={() => router.push({ pathname: '/chat', query: { word: currentVocabulary?.word } })}>
        Chat with AI
      </Button>
    </div>
  )
}

export default Index
