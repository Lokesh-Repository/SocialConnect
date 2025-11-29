'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Supabase automatically handles the email confirmation via the URL hash
        // We just need to check if the user is now authenticated
        
        // Wait a bit for Supabase to process the confirmation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          setStatus('error')
          setMessage(error.message || 'Failed to confirm email')
          return
        }

        if (session) {
          setStatus('success')
          setMessage('Your email has been confirmed successfully!')
          
          // Redirect to feed after 2 seconds
          setTimeout(() => {
            router.push('/feed')
          }, 2000)
        } else {
          // No session yet, might need to wait or there was an error
          setStatus('error')
          setMessage('Email confirmation link may have expired. Please try registering again.')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    confirmEmail()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        {status === 'loading' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Confirming Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === 'success' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Email Confirmed!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Redirecting you to your feed...
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/feed">Go to Feed</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'error' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Confirmation Failed</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                The confirmation link may have expired or is invalid.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm font-semibold mb-2">What you can do:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Try registering again with a new account</li>
                  <li>Check your spam folder for the latest email</li>
                  <li>Make sure you clicked the most recent link</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/register">Register Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
