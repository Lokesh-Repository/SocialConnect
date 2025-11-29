'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailLocked, setEmailLocked] = useState(false)
  const [usernameLocked, setUsernameLocked] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const validateUsername = (username: string): string => {
    if (username.length === 0) return ''
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 30) return 'Username must be at most 30 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
    return ''
  }

  const handleUsernameChange = (value: string) => {
    // Remove @ symbol and convert to lowercase
    const cleanUsername = value.replace('@', '').toLowerCase()
    setFormData({ ...formData, username: cleanUsername })
    
    // Validate username
    const error = validateUsername(cleanUsername)
    setUsernameError(error)
    
    // Lock email if username is entered
    if (cleanUsername.length > 0) {
      setEmailLocked(true)
    } else {
      setEmailLocked(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value })
    
    // Lock username if email is entered
    if (value.length > 0) {
      setUsernameLocked(true)
    } else {
      setUsernameLocked(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Next steps:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the confirmation link in the email</li>
                <li>You'll be redirected to login</li>
                <li>Sign in with your credentials</li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              The confirmation link will expire in 24 hours
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setSuccess(false)}
            >
              Register another account
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join SocialConnect today
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe (3-30 chars, letters, numbers, underscore)"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={usernameLocked}
                required={!emailLocked}
                className={usernameError ? 'border-destructive' : ''}
              />
              {usernameError && (
                <p className="text-xs text-destructive">
                  {usernameError}
                </p>
              )}
              {usernameLocked && !usernameError && (
                <p className="text-xs text-muted-foreground">
                  Clear email to enter username
                </p>
              )}
              {!usernameLocked && !usernameError && formData.username.length >= 3 && (
                <p className="text-xs text-green-600">
                  ✓ Username is valid
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={emailLocked}
                required={!usernameLocked}
              />
              {emailLocked && (
                <p className="text-xs text-muted-foreground">
                  Clear username to enter email
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password Must be at least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 my-8">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (formData.username.length > 0 && usernameError !== '')}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
