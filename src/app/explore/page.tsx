'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search, UserPlus, UserCheck } from 'lucide-react'

interface SearchUser {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  isFollowing: boolean
  isCurrentUser: boolean
}

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingPage, setLoadingPage] = useState(false)
  const postsPerPage = 10

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    fetchPosts(1)
  }, [])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const fetchPosts = async (page: number) => {
    setLoadingPage(true)
    try {
      const res = await fetch(`/api/posts?page=${page}&limit=${postsPerPage}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.data.posts)
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages)
          setCurrentPage(data.data.pagination.page)
        }
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
    } finally {
      setLoading(false)
      setLoadingPage(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchPosts(page)
  }

  const searchUsers = async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.data)
        const following = new Set<string>(data.data.filter((u: SearchUser) => u.isFollowing).map((u: SearchUser) => u.id))
        setFollowingUsers(following)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setFollowingUsers(prev => {
          const newSet = new Set<string>(prev)
          newSet.add(userId)
          return newSet
        })
        setSearchResults(prev => prev.map(u => 
          u.id === userId ? { ...u, isFollowing: true } : u
        ))
      }
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  const handleUnfollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setFollowingUsers(prev => {
          const newSet = new Set<string>(prev)
          newSet.delete(userId)
          return newSet
        })
        setSearchResults(prev => prev.map(u => 
          u.id === userId ? { ...u, isFollowing: false } : u
        ))
      }
    } catch (error) {
      console.error('Unfollow error:', error)
    }
  }

  if (loading) {
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
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <Card className="mt-4">
              <CardContent className="p-4">
                {searching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((searchUser) => (
                      <div key={searchUser.id} className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => router.push(`/users/${searchUser.username}`)}
                        >
                          <Avatar>
                            <AvatarImage src={searchUser.avatar_url || undefined} />
                            <AvatarFallback>
                              {searchUser.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">@{searchUser.username}</p>
                            {searchUser.full_name && (
                              <p className="text-sm text-muted-foreground truncate">
                                {searchUser.full_name}
                              </p>
                            )}
                            {searchUser.bio && (
                              <p className="text-sm text-muted-foreground truncate">
                                {searchUser.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        {!searchUser.isCurrentUser && (
                          <Button
                            size="sm"
                            variant={searchUser.isFollowing ? "outline" : "default"}
                            onClick={() => searchUser.isFollowing ? handleUnfollow(searchUser.id) : handleFollow(searchUser.id)}
                          >
                            {searchUser.isFollowing ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          {loadingPage ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts to explore yet.</p>
            </div>
          ) : (
            <>
              {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loadingPage}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={1 === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={loadingPage}
                        >
                          1
                        </Button>
                        {currentPage > 4 && <span className="px-2 py-1">...</span>}
                      </>
                    )}
                    
                    {/* Pages around current */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === currentPage || 
                               page === currentPage - 1 || 
                               page === currentPage + 1 ||
                               (currentPage <= 2 && page <= 3) ||
                               (currentPage >= totalPages - 1 && page >= totalPages - 2)
                      })
                      .map(page => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loadingPage}
                        >
                          {page}
                        </Button>
                      ))}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 py-1">...</span>}
                        <Button
                          variant={totalPages === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={loadingPage}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
