'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import EditProfileDialog from '@/components/EditProfileDialog'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingLikes, setLoadingLikes] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchUserPosts()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`/api/posts?userId=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.data.posts)
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPosts = async () => {
    setLoadingLikes(true)
    try {
      const res = await fetch('/api/users/me/likes')
      const data = await res.json()
      if (data.success) {
        setLikedPosts(data.data.posts)
      }
    } catch (error) {
      console.error('Fetch liked posts error:', error)
    } finally {
      setLoadingLikes(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                  <AvatarFallback className="text-2xl">
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{profile.fullName || profile.username}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <EditProfileDialog profile={profile} onProfileUpdated={fetchProfile} />
                <ChangePasswordDialog />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {profile.bio && <p className="mb-4">{profile.bio}</p>}
            <div className="flex space-x-6 text-sm mb-4">
              <div>
                <span className="font-bold">{profile.postsCount}</span> Posts
              </div>
              <div>
                <span className="font-bold">{profile.followersCount}</span> Followers
              </div>
              <div>
                <span className="font-bold">{profile.followingCount}</span> Following
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
              {profile.lastLogin && (
                <p>Last login: {new Date(profile.lastLogin).toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" onValueChange={(value) => {
          if (value === 'likes' && likedPosts.length === 0 && !loadingLikes) {
            fetchLikedPosts()
          }
        }}>
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
          <TabsContent value="likes" className="mt-6">
            {loadingLikes ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No liked posts yet</p>
              </div>
            ) : (
              likedPosts.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
