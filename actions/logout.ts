'use server'

import { signOut } from '@/auth'

export const logout = async () => {
  // Todo: Some server stuff
  await signOut()
}
