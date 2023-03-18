import { Button } from '@mantine/core'
import { signIn, signOut, useSession } from 'next-auth/react'

const Login: React.FC = () => {
  const { data: sessionData } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">{sessionData && <span>Logged in as {sessionData.user?.email}</span>}</p>
      <Button onClick={sessionData ? () => void signOut() : () => void signIn()}>
        {sessionData ? 'Sign out' : 'Sign in'}
      </Button>
    </div>
  )
}

export default Login
