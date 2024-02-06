'use client'

import { FormError } from '@/components/form-error'

import { UserRole } from '@prisma/client'
import { useCurrentRole } from '@/hooks/use-current-role'

interface RoleGateProps {
  children: React.ReactNode
  allowedRole: UserRole
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole()

  if (role !== allowedRole)
    return <FormError message="You don't have permission to view this page" />

  return <>{children}</>
}
