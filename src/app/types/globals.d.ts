export {}

// Create a type for the roles
export type Roles = 'admin' | 'beta-tester'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}