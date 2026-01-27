"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()
  return (
    <div className='min-h-screen mx-auto my-20'>
      <div className="flex gap-2 items-center">
        <Button onClick={()=>{
          router.push("/services")
        }}>
          Services
        </Button>
        <Button onClick={()=>{
          router.push("/settings")
        }}>
          Settings
        </Button>
      </div>
    </div>
  )
}

export default Home