'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEmail, setIsEmail] = useState(false)
  const [identifierError, setIdentifierError] = useState('')

  const validateUsername = (username: string): string => {
    if (username.length === 0) return ''
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 30) return 'Username must be at most 30 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
    return ''
  }

  const handleIdentifierChange = (value: string) => {
    // Check if input looks like an email
    const looksLikeEmail = value.includes('@') && value.includes('.')
    setIsEmail(looksLikeEmail)
    
    if (looksLikeEmail) {
      // It's an email, no special processing needed
      setIdentifier(value)
      setIdentifierError('')
    } else {
      // It's a username, clean and validate
      const cleanUsername = value.replace('@', '').toLowerCase()
      setIdentifier(cleanUsername)
      
      // Validate username format
      const error = validateUsername(cleanUsername)
      setIdentifierError(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let email = identifier
      
      // If not an email, treat as username and fetch email
      if (!isEmail) {
        // Remove @ symbol if user entered it
        const cleanUsername = identifier.replace('@', '').toLowerCase()
        
        // Fetch user email by username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .ilike('username', cleanUsername)
          .single()

        if (userError || !userData) {
          setError('Invalid username or password')
          setLoading(false)
          return
        }

        email = userData.email
      }

      // Sign in with email
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Invalid username/email or password')
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if user account is active by querying the database directly
        const checkResponse = await fetch(`/api/users/${data.user.id}`)
        
        if (checkResponse.ok) {
          const result = await checkResponse.json()
          
          if (result.success && result.data) {
            const userData = result.data
            
            if (!userData.isActive) {
              // Account is deactivated
              await supabase.auth.signOut()
              setError('Your account has been deactivated. Please contact support.')
              setLoading(false)
              return
            }

            // Account is active, update last login and proceed to feed
            await fetch('/api/auth/update-last-login', { method: 'POST' })
            router.push('/feed')
            router.refresh()
          } else {
            // User doesn't exist in database
            await supabase.auth.signOut()
            setError('Account not found. Please contact support.')
            setLoading(false)
          }
        } else {
          // API error, but user is authenticated - let them through
          // They might be a new user or there's a temporary issue
          await fetch('/api/auth/update-last-login', { method: 'POST' })
          router.push('/feed')
          router.refresh()
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your SocialConnect account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                required
                className={identifierError ? 'border-destructive' : ''}
              />
              {identifierError && (
                <p className="text-xs text-destructive">
                  {identifierError}
                </p>
              )}
              {identifier && !identifierError && (
                <p className="text-xs text-muted-foreground">
                  {isEmail ? '✓ Logging in with email' : '✓ Logging in with username'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 my-8">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (identifier.length > 0 && identifierError !== '')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
