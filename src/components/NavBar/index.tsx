import { ActionIcon, Button } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import { useRouter } from 'next/router'

const NavBar = () => {
  const router = useRouter()

  return (
    <div className="h-10 flex items-center shadow-sm">
      <Button variant="ghost" leftIcon={<IconChevronLeft size={24} />} onClick={() => router.back()}></Button>
      <ActionIcon></ActionIcon>
    </div>
  )
}

export default NavBar
