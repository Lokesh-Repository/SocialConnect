'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import Navbar from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Heart, MessageCircle, UserPlus, FileText, Check } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { notifications, markAsRead, refetch } = useNotifications()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'COMMENT':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'POST':
        return <FileText className="w-5 h-5 text-purple-500" />
      default:
        return null
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n: any) => !n.is_read)
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.post_id) {
      return `/posts/${notification.post_id}`
    }
    return null
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n: any) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification: any) => {
              const link = getNotificationLink(notification)
              const content = (
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p>{notification.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.is_read && (
                      <>
                        <Badge variant="default">New</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )

              return (
                <Card 
                  key={notification.id} 
                  className={`${notification.is_read ? 'opacity-60' : ''} ${link ? 'cursor-pointer hover:bg-accent' : ''}`}
                >
                  <CardContent className="py-4">
                    {link ? (
                      <Link href={link} onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
