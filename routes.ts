/**
 * An array of routes that are accessible to the public
 * These routes does not require authentication
 * @type {string[]}
 */
export const PublicRoutes = ['/']

/**
 * An array of routes that are used for authentication
 * These routes will redirect the logged in user's to /settings
 * @type {string[]}
 */
export const AuthRoutes = ['/login', '/register']

/**
 * Prefix for api authentication route
 * Routes that start with this prefix will be used for api authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth'

/**
 * Default log in redirect
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/settings'
