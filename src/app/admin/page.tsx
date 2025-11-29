'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, FileText, Heart, MessageCircle, Shield } from 'lucide-react'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchUsers()
      fetchPosts()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      
      if (res.status === 403) {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
      setError('Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?limit=20')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error('Fetch users error:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts?limit=20')
      const data = await res.json()
      if (data.success) {
        setPosts(data.data.posts)
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'POST'
      })
      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Deactivate user error:', error)
    }
  }

  const handleActivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to activate this user? They will be able to log in again.')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST'
      })
      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Activate user error:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone and will delete all their posts, comments, and data.')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Delete user error:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchPosts()
        fetchStats()
      }
    } catch (error) {
      console.error('Delete post error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => router.push('/feed')}>
                Go to Feed
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.likes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.comments}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <p className="font-semibold">{user.full_name || user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.last_login && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last login: {new Date(user.last_login).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.role === 'ADMIN' && <Badge variant="destructive">Admin</Badge>}
                        {user.role !== 'ADMIN' && (
                          <>
                            {user.is_active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActivateUser(user.id)}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold">@{post.user?.username || 'Unknown'}</p>
                        <p className="text-sm mt-1">{post.content?.substring(0, 150)}{post.content?.length > 150 ? '...' : ''}</p>
                        <div className="flex space-x-4 text-xs text-muted-foreground mt-2">
                          <span>{post.like_count || 0} likes</span>
                          <span>{post.comment_count || 0} comments</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
