import { Box, Button, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconTrash, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import NavBar from '~/components/NavBar'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Encounter = () => {
  const [sentence, setSentence] = useState({
    content: '',
    error: false,
  })
  const [words, setWords] = useState<{ id: string; word: string }[]>([])
  const [translateResult, setTranslateResult] = useState({
    loading: false,
    data: '',
  })
  const [wordDefinition, setWordDefinition] = useState<{
    content: string
    loading: boolean
  }>({
    content: '',
    loading: false,
  })
  const [newVocabId, setNewVocabId] = useState<string>()
  const { data: userInfo } = api.vocabulary.getUserInfo.useQuery()

  const { mutate: saveNewVocab, isLoading: isSaveNewVocabLoading } = api.vocabulary.createVocabulary.useMutation({
    onSuccess() {
      notifications.show({ title: 'Save Success', message: '', icon: <IconCheck />, color: 'teal' })
    },
  })

  const onClickTranslate = async () => {
    const { content } = sentence
    if (content?.trim()?.length === 0) {
      return notifications.show({ title: 'Please input sentence', message: '', icon: <IconX />, color: 'red' })
    }
    const words = content.match(/[\w']+|[^\w\s]+/g)?.map((word) => ({
      id: crypto.randomUUID(),
      word,
    }))
    setWords(words || [])

    setTranslateResult({ loading: true, data: '' })
    await fetchSSE(content, {
      userInfo,
      openaiType: OpenaiType.translate,
      onMessage(data) {
        setTranslateResult((_prev) => ({
          loading: true,
          data: _prev.data + (data?.choices?.[0]?.delta?.content || ''),
        }))
      },
      onError(error) {
        notifications.show({ title: error.message || 'Request Error', message: '', icon: <IconX />, color: 'red' })
        setTranslateResult((_prev) => ({ ..._prev, loading: false }))
      },
    })
    setTranslateResult((_prev) => ({ ..._prev, loading: false }))
  }
  const onClickClear = () => {
    setSentence({ content: '', error: false })
    setWords([])
    setTranslateResult({ loading: false, data: '' })
  }
  const onClickWord = (wordId: string) => {
    if (wordDefinition?.loading) return
    setNewVocabId(wordId)
    const word = words.find(({ id }) => id === wordId)?.word ?? ''
    const prompt = [
      {
        role: 'assistant',
        content: translateResult?.data,
      } as const,
      {
        role: 'user',
        content: `请给出句子中的单词 ${word} 的原始形态（如果有）、单词的语种、对应的音标（如果有）、所有含义（含词性）、双语示例，至少三条例句，请严格按照下面格式给到翻译结果：
        <原始文本>
        [<语种>] · / <单词音标>
        [<词性缩写>] <中文含义>]
        例句：
        <序号><例句>(例句翻译)`,
      } as const,
    ]
    setWordDefinition({ content: '', loading: true })
    fetchSSE(prompt, {
      openaiType: OpenaiType.translate,
      userInfo,
      onMessage(data) {
        setWordDefinition((_prev) => ({
          content: _prev?.content + (data?.choices?.[0]?.delta?.content || ''),
          loading: true,
        }))
      },
      onSuccess: () => setWordDefinition((_prev) => ({ ..._prev, loading: false })),
      onError: (error) => {
        notifications.show({ title: error.message || 'Request Error', message: '', icon: <IconX />, color: 'red' })
        setWordDefinition((_prev) => ({ ..._prev, loading: false }))
      },
    })
  }
  const onClickSaveToVocab = () => {
    const newVocab = words.find(({ id }) => id === newVocabId)
    if (!newVocab) {
      return notifications.show({ title: 'Please select word', message: '', icon: <IconX />, color: 'red' })
    }
    saveNewVocab({
      sentence: sentence.content,
      word: newVocab.word,
    })
  }

  return (
    <div className="pb-16">
      <NavBar />

      <div className="flex flex-col m-4">
        <Textarea
          className="h-full flex-1"
          value={sentence.content}
          error={sentence.error}
          onChange={(e) => setSentence({ content: e.target.value, error: false })}
          placeholder="Input your sentence here."
        />
        <div className="mt-2 flex justify-center">
          <Button size="sm" onClick={onClickClear} variant="outline" leftIcon={<IconTrash size="1rem" />}>
            Clear
          </Button>
          <Button loading={translateResult.loading} onClick={onClickTranslate} className="ml-2">
            Translate
          </Button>
        </div>
      </div>

      {translateResult.data?.length > 0 && (
        <Box
          className="m-4"
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            cursor: 'pointer',
          })}
        >
          {translateResult.data}
        </Box>
      )}

      {wordDefinition?.content && (
        <Box
          className="m-4 whitespace-pre-line"
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            cursor: 'pointer',
          })}
        >
          {wordDefinition.content}
        </Box>
      )}

      <div className="m-4">
        <div>
          {words.map(({ word, id }) => (
            <Button
              compact
              key={id}
              size="xs"
              variant={newVocabId === id ? 'gradient' : 'default'}
              gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }}
              className="m-1"
              onClick={() => onClickWord(id)}
              color={newVocabId === id ? 'blue' : 'gray'}
            >
              {word}
            </Button>
          ))}
        </div>
        {newVocabId && (
          <div className="flex justify-center my-2">
            <Button
              color="red"
              variant="light"
              size="sm"
              onClick={onClickSaveToVocab}
              loading={isSaveNewVocabLoading}
              leftIcon={<IconDeviceFloppy size="1rem" />}
            >
              Save To Vocabulary
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Encounter
