'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import { Loader2 } from 'lucide-react'

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchFeed()
    }
  }, [user])

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/feed')
      const data = await res.json()
      if (data.success) {
        setPosts(data.data.posts)
      }
    } catch (error) {
      console.error('Fetch feed error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
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
        <CreatePost onPostCreated={fetchFeed} />
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No posts yet. Follow some users or create your first post!
            </p>
          </div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </div>
  )
}
