import { Title } from '@mantine/core'
import { useRouter } from 'next/router'
import Sidebar from '../Sidebar'

const NavBar = () => {
  const router = useRouter()

  return (
    <div className="h-12 flex items-center shadow-sm">
      <Sidebar />
      <Title className="cursor-pointer" order={5} onClick={() => router.push('/')}>
        Encounter Mem
      </Title>
    </div>
  )
}

export default NavBar
