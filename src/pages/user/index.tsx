import { Button } from '@mantine/core'
import { signIn, signOut, useSession } from 'next-auth/react'
import { api } from '~/utils/api'

const Login: React.FC = () => {
  const { data: sessionData } = useSession()

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  )

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        {sessionData && <span>Logged in as {sessionData.user?.email}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <Button onClick={sessionData ? () => void signOut() : () => void signIn()}>
        {sessionData ? 'Sign out' : 'Sign in'}
      </Button>
    </div>
  )
}

export default Login
