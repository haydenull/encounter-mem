import { useEffect, useState } from 'react'

const useViewportHeight = (): number => {
  // 在初始化时检查是否在客户端环境中运行
  const [viewportHeight, setViewportHeight] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 0)

  useEffect(() => {
    // 只在客户端环境中执行此 useEffect
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return viewportHeight
}

export default useViewportHeight
