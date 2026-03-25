import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Aivora</h1>
        <p className="mt-2 text-muted-foreground">AI-Powered SaaS Platform</p>
      </div>
      <Outlet />
    </div>
  )
}
