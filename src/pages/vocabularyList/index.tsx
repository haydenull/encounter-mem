/* eslint-disable @typescript-eslint/no-misused-promises */
import { List, ListItem, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NavBar from '~/pages/components/NavBar'
import { api } from '~/utils/api'

const Index = () => {
  const router = useRouter()
  const { data: vocabularies, isLoading } = api.vocabulary.getVocabularies.useQuery()

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )

  return (
    <div>
      <NavBar />
      <List spacing="3">
        {vocabularies?.map((vocabulary) => (
          <ListItem
            key={vocabulary.id}
            onClick={() => router.push({ pathname: '/vocabularyDetail', query: { wordId: vocabulary.id } })}
          >
            {vocabulary.word}
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default Index
