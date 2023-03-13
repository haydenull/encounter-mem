/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Textarea, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { api } from '~/utils/api'
import { fetchSSE, OpenaiType } from '~/utils/openai'

const Encounter = () => {
  const router = useRouter()
  const toast = useToast()
  const [sentence, setSentence] = useState('')
  const [words, setWords] = useState<{ id: string; word: string }[]>([])
  const [translateResult, setTranslateResult] = useState({
    loading: false,
    data: '',
  })
  const [newVocabId, setNewVocabId] = useState<string>()

  const { mutate: saveNewVocab, isLoading: isSaveNewVocabLoading } = api.vocabulary.createVocabulary.useMutation({
    onSuccess() {
      toast({ title: 'Save Success', status: 'success' })
    },
  })

  const onClickTranslate = async () => {
    if (sentence?.trim()?.length === 0) {
      return toast({ title: 'Please input sentence', status: 'error' })
    }
    const words = sentence.match(/[\w']+|[^\w\s]+/g)?.map((word) => ({
      id: crypto.randomUUID(),
      word,
    }))
    setWords(words || [])

    setTranslateResult({ loading: true, data: '' })
    await fetchSSE(sentence, {
      openaiType: OpenaiType.translate,
      onMessage(data) {
        setTranslateResult((_prev) => ({
          loading: true,
          data: _prev.data + (data?.choices?.[0]?.delta?.content || ''),
        }))
      },
      onError(error) {
        toast({ title: error.message || 'Request Error', status: 'error' })
        setTranslateResult((_prev) => ({ ..._prev, loading: false }))
      },
    })
    setTranslateResult((_prev) => ({ ..._prev, loading: false }))
  }
  const onClickClear = () => {
    setSentence('')
    setWords([])
    setTranslateResult({ loading: false, data: '' })
  }
  const onClickSaveToVocab = () => {
    const newVocab = words.find(({ id }) => id === newVocabId)
    if (!newVocab) {
      return toast({ title: 'Please select word', status: 'error' })
    }
    saveNewVocab({
      sentence,
      word: newVocab.word,
    })
  }

  return (
    <div className="pb-16">
      {/* <Button
        variant="link"
        colorScheme="green"
        className="m-2"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => router.push('/recall')}
      >
        Recall
      </Button> */}

      <div className="flex m-2 h-24 pt-3">
        <Textarea
          className="h-full flex-1"
          height="full"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Input your sentence here."
        />
        <div className="ml-2 flex flex-col justify-around">
          <Button onClick={onClickClear}>Clear</Button>
          <Button
            isLoading={translateResult.loading}
            loadingText="Translating"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={onClickTranslate}
          >
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
              colorScheme={newVocabId === id ? 'blue' : 'gray'}
            >
              {word}
            </Button>
          ))}
        </div>
        {newVocabId && (
          <Button
            className="mt-2"
            colorScheme="green"
            size="sm"
            onClick={onClickSaveToVocab}
            isLoading={isSaveNewVocabLoading}
          >
            Save To Vocabulary
          </Button>
        )}
      </div>

      <div className="fixed bottom-0 w-screen flex justify-center">
        <div className="p-2 m-2 flex backdrop-blur-md rounded-md w-fit">
          <Button
            className="mr-4"
            style={{ background: 'white' }}
            colorScheme="green"
            variant="outline"
            isDisabled
            onClick={() => router.push('/vocabularyList')}
          >
            Sentence List
          </Button>
          <Button colorScheme="green" onClick={() => router.push('/vocabularyList')}>
            Vocabulary List
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Encounter
