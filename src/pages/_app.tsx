import { type Session } from 'next-auth'
import { type AppType } from 'next/app'
// import { SessionProvider } from 'next-auth/react'
import { ChakraProvider } from '@chakra-ui/react'
import '~/styles/globals.css'
import { api } from '~/utils/api'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    // <SessionProvider session={session}>
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
    // </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
