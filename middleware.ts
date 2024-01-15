import authConfig from '@/auth.config'

import NextAuth from 'next-auth'
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  AuthRoutes,
  PublicRoutes,
} from '@/routes'
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const { pathname } = nextUrl
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = PublicRoutes.includes(pathname)
  const isAuthRoute = AuthRoutes.includes(pathname)

  if (isApiAuthRoute) return null

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', nextUrl))
  }

  return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
