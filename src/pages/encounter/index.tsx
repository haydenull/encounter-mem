import { Button, Textarea, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { api } from '~/utils/api'
import { fetchSSE } from '~/utils/openai'

const Encounter = () => {
  const [sentence, setSentence] = useState('')
  const [words, setWords] = useState<{ id: string; word: string }[]>([])
  const [translateResult, setTranslateResult] = useState({
    loading: false,
    data: '',
  })
  const [newVocabId, setNewVocabId] = useState<string>()

  const { mutate: saveNewVocab, isLoading: isSaveNewVocabLoading } =
    api.vocabulary.createVocabulary.useMutation()

  const toast = useToast()

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
    const res = saveNewVocab({
      sentence,
      word: newVocab.word,
    })
    console.log('[faiz:] === res', res)
  }

  return (
    <div>
      <Button colorScheme="green" className="m-2">
        Recall
      </Button>

      <div className="flex m-2">
        <Textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
        />
        <div className="ml-2">
          <Button className="mb-2" onClick={onClickClear}>
            Clear
          </Button>
          <Button
            isLoading={translateResult.loading}
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
              size="sm"
              className="m-1"
              onClick={() => setNewVocabId(id)}
              colorScheme={newVocabId === id ? 'blue' : 'gray'}
            >
              {word}
            </Button>
          ))}
        </div>
        <Button
          colorScheme="blue"
          onClick={onClickSaveToVocab}
          isLoading={isSaveNewVocabLoading}
        >
          Save To Vocabulary
        </Button>
      </div>
    </div>
  )
}

export default Encounter
