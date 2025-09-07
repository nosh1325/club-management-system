import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileX, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/images/bracu-campus.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Very light overlay for maximum contrast */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 sm:p-10 shadow-2xl border border-white/60">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 rounded-full p-5 mb-6">
                <FileX className="h-16 w-16 text-gray-700" />
              </div>
              
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
              
              <p className="text-gray-600 mb-8">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/" className="flex-1">
                  <Button className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                
                <Link href="/clubs" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Clubs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
