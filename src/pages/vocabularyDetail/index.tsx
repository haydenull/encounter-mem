import { Blockquote, Box, Button, LoadingOverlay, Title } from '@mantine/core'
import { IconMessageCircle2, IconRobot } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NavBar from '~/components/NavBar'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Index = () => {
  const router = useRouter()
  const { wordId } = router.query

  const { data: vocabulary, isLoading } = api.vocabulary.getVocabulary.useQuery({ id: Number(wordId) })

  const [sentenceByAI, setSentenceByAI] = useState<{
    loading: boolean
    sentences: string[]
  }>({ loading: false, sentences: [] })

  const onClickAICreate = async () => {
    const word = vocabulary?.word
    if (!word) return
    setSentenceByAI((_prev) => ({ ..._prev, loading: true }))
    let isFirst = true
    await fetchSSE(word, {
      openaiType: OpenaiType.createSentence,
      onMessage(data) {
        const newContent = data?.choices?.[0]?.delta?.content || ''
        if (isFirst) {
          isFirst = false
          return setSentenceByAI((_prev) => ({ ..._prev, sentences: _prev.sentences.concat(newContent) }))
        }

        setSentenceByAI((_prev) => {
          const lastMessage = _prev.sentences[_prev.sentences.length - 1] || ''
          const updatedMessage = lastMessage + newContent
          return {
            ..._prev,
            loading: false,
            sentences: _prev.sentences.slice(0, -1).concat(updatedMessage),
          }
        })
      },
    })
  }

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 relative">
        <LoadingOverlay visible={isLoading} />
        <div className="p-4">
          <Title align="center">{vocabulary?.word}</Title>
          <div>
            {vocabulary?.sentences?.map((sentence) => (
              <Blockquote key={sentence.id}>{sentence.content}</Blockquote>
            ))}
          </div>
          <div className="my-2">
            {sentenceByAI?.sentences?.map((sentence) => (
              <Box
                className="m-4"
                sx={(theme) => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  padding: theme.spacing.xl,
                  cursor: 'pointer',
                })}
              >
                {sentence}
              </Box>
            ))}
            <div className="flex justify-center">
              <Button
                variant="light"
                className="mt-4"
                leftIcon={<IconRobot />}
                loading={sentenceByAI?.loading}
                onClick={onClickAICreate}
              >
                Create Sentence by AI
              </Button>
            </div>
          </div>
          <div className="fixed bottom-4 flex justify-center w-screen">
            <Button
              leftIcon={<IconMessageCircle2 />}
              onClick={() => router.push({ pathname: '/chat', query: { word: vocabulary?.word } })}
            >
              Chat with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
