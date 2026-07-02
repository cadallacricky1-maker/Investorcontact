import { loginAction, signupAction } from '@/app/login/actions'

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-gray-600">Sign in or create your account.</p>

        <div className="mt-6 grid gap-8">
          <form action={loginAction} className="space-y-4">
            <h2 className="text-lg font-medium">Login</h2>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full rounded-md border p-3"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full rounded-md border p-3"
              required
            />
            <button className="w-full rounded-md bg-black px-4 py-2 text-white">
              Sign in
            </button>
          </form>

          <div className="border-t pt-8">
            <form action={signupAction} className="space-y-4">
              <h2 className="text-lg font-medium">Sign up</h2>
              <input
                name="name"
                type="text"
                placeholder="Full name"
                className="w-full rounded-md border p-3"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-md border p-3"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full rounded-md border p-3"
                required
              />
              <button className="w-full rounded-md border px-4 py-2">
                Create account
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}