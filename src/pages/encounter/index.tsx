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
          data: _prev.data + (data?.choices?.[0]?.message?.content || ''),
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
              onClick={() => setNewVocabId(id)}
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
