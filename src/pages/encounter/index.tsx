import { Button, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Encounter = () => {
  const router = useRouter()
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
      <Button className="m-2" onClick={() => router.push('/user')}>
        User
      </Button>

      <div className="flex m-2 h-24 pt-3">
        <Textarea
          className="h-full flex-1"
          value={sentence.content}
          error={sentence.error}
          onChange={(e) => setSentence({ content: e.target.value, error: false })}
          placeholder="Input your sentence here."
        />
        <div className="ml-2 flex flex-col justify-around">
          <Button size="sm" onClick={onClickClear}>
            Clear
          </Button>
          <Button loading={translateResult.loading} onClick={onClickTranslate}>
            Translate
          </Button>
        </div>
      </div>

      <div className="m-2">{translateResult.data}</div>

      <div className="m-2">
        <div>
          {words.map(({ word, id }) => (
            <Button
              key={id}
              size="xs"
              className="m-1"
              onClick={() => setNewVocabId(id)}
              color={newVocabId === id ? 'blue' : 'gray'}
            >
              {word}
            </Button>
          ))}
        </div>
        {newVocabId && (
          <Button className="mt-2" color="teal" size="sm" onClick={onClickSaveToVocab} loading={isSaveNewVocabLoading}>
            Save To Vocabulary
          </Button>
        )}
      </div>

      <div className="fixed bottom-0 w-screen flex justify-center">
        <div className="p-2 m-2 flex backdrop-blur-md rounded-md w-fit">
          <Button
            className="mr-4"
            style={{ background: 'white' }}
            color="teal"
            variant="outline"
            disabled
            onClick={() => router.push('/vocabularyList')}
          >
            Sentence List
          </Button>
          <Button color="teal" onClick={() => router.push('/vocabularyList')}>
            Vocabulary List
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Encounter
