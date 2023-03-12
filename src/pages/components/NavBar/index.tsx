import { ChevronLeftIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const NavBar = () => {
  const router = useRouter()

  return (
    <div className="h-10 flex items-center shadow-sm">
      <Button variant="ghost" leftIcon={<ChevronLeftIcon boxSize={7} />} onClick={() => router.back()}></Button>
    </div>
  )
}

export default NavBar
