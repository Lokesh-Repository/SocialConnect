import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, MessageCircle, Heart, Lock, Image, Hash } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              SocialConnect
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/explore">Explore</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See what's happening
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Join SocialConnect to follow people, share your thoughts, and stay connected with what matters to you.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Follow people</h3>
                  <p className="text-sm text-gray-600">
                    Connect with friends and discover new accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Share updates</h3>
                  <p className="text-sm text-gray-600">
                    Post text and photos up to 280 characters
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Heart className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Like and comment</h3>
                  <p className="text-sm text-gray-600">
                    Engage with posts from people you follow
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Image className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Share photos</h3>
                  <p className="text-sm text-gray-600">
                    Add images to your posts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Hash className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Use categories</h3>
                  <p className="text-sm text-gray-600">
                    Tag posts with topics like Tech, Sports, News
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Lock className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Control privacy</h3>
                  <p className="text-sm text-gray-600">
                    Choose who can see your posts
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                © 2025 SocialConnect
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <Link href="/explore" className="hover:text-gray-900">Explore</Link>
                <Link href="/login" className="hover:text-gray-900">Login</Link>
                <Link href="/register" className="hover:text-gray-900">Sign Up</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
