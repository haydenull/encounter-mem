import { List, LoadingOverlay, ThemeIcon } from '@mantine/core'
import { IconLetterCase } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import Empty from '~/components/Empty'
import NavBar from '~/components/NavBar'
import { api } from '~/utils/api'

const Index = () => {
  const router = useRouter()
  const { data: vocabularies, isLoading } = api.vocabulary.getVocabularies.useQuery()

  return (
    <div className="h-full flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        <LoadingOverlay visible={isLoading} />
        {Array.isArray(vocabularies) && vocabularies.length > 0 ? (
          <List
            withPadding
            spacing="xs"
            size="sm"
            className="mt-4 w-full"
            icon={
              <ThemeIcon size={24}>
                <IconLetterCase size="1rem" />
              </ThemeIcon>
            }
          >
            {vocabularies?.map((vocabulary) => (
              <List.Item
                key={vocabulary.id}
                onClick={() => router.push({ pathname: '/vocabularyDetail', query: { wordId: vocabulary.id } })}
                sx={(theme) => ({
                  display: 'block',
                  width: '100%',
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.sm,
                  cursor: 'pointer',
                  color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                  '&:hover': {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  },
                })}
              >
                {vocabulary.word}
              </List.Item>
            ))}
          </List>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  )
}

export default Index
