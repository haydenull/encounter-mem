import { ActionIcon, Avatar, Button, Drawer, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconMenu2, IconVocabulary } from '@tabler/icons-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'

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
  return (
    <>
      <Drawer opened={opened} onClose={close} withCloseButton={false}>
        <div className="h-screen flex flex-col justify-between -my-4 py-4">
          <div>
            <Avatar radius="xl" color={sessionData ? 'teal' : 'gray'} size="lg">
              {sessionData ? sessionData?.user?.email?.split('@')?.[0]?.[0] : null}
            </Avatar>
            <p className="text-gray-400">{sessionData && <span>{sessionData.user?.email}</span>}</p>
            <MainLink
              icon={<IconVocabulary size="1rem" />}
              color="teal"
              label="Vocabulart List"
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
