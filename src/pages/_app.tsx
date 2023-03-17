import { MantineProvider } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import '~/styles/globals.css'
import { api } from '~/utils/api'

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  const colorScheme = useColorScheme()
  return (
    <SessionProvider session={session}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
        <Notifications />
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
