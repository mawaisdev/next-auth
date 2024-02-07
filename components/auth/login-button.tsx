'use client'
import { useRouter } from 'next/navigation'

interface LoginButtonProps {
  children: React.ReactNode
  mode?: 'model' | 'redirect'
  asChild?: boolean
}

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { LoginForm } from '@/components/auth/login-form'

export const LoginButton = ({
  children,
  mode = 'redirect',
  asChild,
}: LoginButtonProps) => {
  const router = useRouter()

  const onClick = () => {
    router.push('/login')
  }

  if (mode == 'model') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className='p-0 w-auto bg-transparent border-none'>
          <LoginForm />
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  )
}
