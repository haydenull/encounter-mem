import {
  ActionIcon,
  Avatar,
  Button,
  Drawer,
  Group,
  Modal,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconMenu2, IconVocabulary } from '@tabler/icons-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { api } from '~/utils/api'

interface MainLinkProps {
  icon: React.ReactNode
  color: string
  label: string
  onClick?: () => void
}
function MainLink({ icon, color, label, onClick }: MainLinkProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  )
}

const Sidebar = () => {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const [opened, { open, close }] = useDisclosure(false)
  const [topicModal, { open: openTopicModal, close: closeTopicModal }] = useDisclosure(false)

  const { data: userInfo, refetch: refetchUserInfo } = api.vocabulary.getUserInfo.useQuery()
  const [topicValue, setTopicValue] = useState(userInfo?.topic || '')

  const { mutateAsync: updateUserTopic, isLoading: updating } = api.vocabulary.updateUserTopic.useMutation()

  const onClickTopicSave = async () => {
    await updateUserTopic({ topic: topicValue })
    notifications.show({ title: 'Topic updated', message: 'Your topic has been updated', color: 'green' })
    refetchUserInfo()
    closeTopicModal()
  }

  return (
    <>
      <Modal opened={topicModal} onClose={closeTopicModal} title="Set your topic">
        <TextInput label="Topic" value={topicValue} onChange={(e) => setTopicValue(e.target.value)} />
        <div className="mt-2 flex justify-end">
          <Button loading={updating} onClick={onClickTopicSave}>
            Save
          </Button>
        </div>
      </Modal>
      <Drawer opened={opened} onClose={close} withCloseButton={false}>
        <div className="h-screen flex flex-col justify-between -my-4 py-4">
          <div>
            <Avatar radius="xl" color={sessionData ? 'teal' : 'gray'} size="lg">
              {sessionData ? sessionData?.user?.email?.split('@')?.[0]?.[0]?.toUpperCase() : null}
            </Avatar>
            <div className="text-gray-400">
              {sessionData && <p className="my-1 ml-3 flex items-center">{sessionData.user?.email}</p>}
              {sessionData && (
                <p className="my-1 ml-3 flex items-center text-ellipsis overflow-hidden w-full">
                  {userInfo?.topic}
                  <ActionIcon
                    color="teal"
                    onClick={() => {
                      setTopicValue(userInfo?.topic || '')
                      openTopicModal()
                    }}
                  >
                    <IconEdit size="1rem" />
                  </ActionIcon>
                </p>
              )}
            </div>
            <MainLink
              icon={<IconVocabulary size="1rem" />}
              color="teal"
              label="Vocabulary List"
              onClick={() => router.push('/vocabularyList')}
            />
            {/* <MainLink icon={<IconNotebook size="1rem" />} color="blue" label="Sentence List" /> */}
          </div>
          <Button onClick={sessionData ? () => void signOut() : () => void signIn()}>
            {sessionData ? 'Sign out' : 'Sign in'}
          </Button>
        </div>
      </Drawer>
      <ActionIcon onClick={open} className="m-2">
        <IconMenu2 />
      </ActionIcon>
    </>
  )
}

export default Sidebar
