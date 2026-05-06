import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-gradient-to-br from-primary via-primary to-indigo-700 p-10 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Aivora</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              AI-Powered Enterprise Platform
            </h2>
            <p className="mt-3 text-base text-white/70 leading-relaxed max-w-sm">
              Streamline customer communication, knowledge management, and task automation with intelligent AI assistance.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'RAG-powered knowledge base',
              'Multi-tenant architecture',
              'Intelligent task automation',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Aivora. All rights reserved.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile Logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Aivora</span>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
