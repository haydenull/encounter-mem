import { List, ListItem, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NavBar from '~/components/NavBar'
import { api } from '~/utils/api'

const Index = () => {
  const router = useRouter()
  const { data: vocabularies, isLoading } = api.vocabulary.getVocabularies.useQuery()

  return (
    <div>
      <NavBar />
      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <List>
          {vocabularies?.map((vocabulary) => (
            <ListItem
              key={vocabulary.id}
              onClick={() => router.push({ pathname: '/vocabularyDetail', query: { wordId: vocabulary.id } })}
            >
              <p className="h-12 flex items-center shadow-sm px-4 cursor-pointer hover:bg-slate-50">
                {vocabulary.word}
              </p>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  )
}

export default Index
