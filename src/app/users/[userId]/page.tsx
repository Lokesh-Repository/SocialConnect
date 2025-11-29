'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, UserPlus, UserMinus } from 'lucide-react'

export default function UserProfilePage() {
  const { userId } = useParams()
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login')
    }
  }, [authLoading, currentUser, router])

  useEffect(() => {
    if (userId) {
      fetchUser()
      fetchUserPosts()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Fetch user error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`/api/posts?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.data.posts)
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
    }
  }

  const handleFollow = async () => {
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/users/${userId}/follow`, { method })
      
      if (res.ok) {
        setIsFollowing(!isFollowing)
        fetchUser()
      }
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="text-2xl">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              {!isOwnProfile && (
                <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {user.bio && <p className="mb-4">{user.bio}</p>}
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-bold">{user.postsCount}</span> Posts
              </div>
              <div>
                <span className="font-bold">{user.followersCount}</span> Followers
              </div>
              <div>
                <span className="font-bold">{user.followingCount}</span> Following
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </div>
  )
}
