import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Built by</span>
            <a
              href="https://github.com/domgiordano"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-green hover:text-primary-blue transition-colors font-medium"
            >
              @domgiordano
            </a>
          </div>

          <a
            href="https://github.com/domgiordano/super-bowl-squares"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-green transition-colors group"
          >
            <Github className="w-4 h-4 group-hover:text-primary-blue transition-colors" />
            <span className="font-medium">View Source Code</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
