import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to <span className="text-blue-600">Taku UI</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Beautiful UI components for React with Tailwind CSS
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/components"
            className="px-8 py-3 text-base font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Components
          </Link>
        </div>

        <div className="grid text-left grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🎨 Customizable</h3>
            <p className="text-muted-foreground">
              Every component is built with customization in mind using Tailwind CSS and CSS
              variables.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📦 Easy to Install</h3>
            <p className="text-muted-foreground">
              Install components with a single CLI command. Copy-paste directly into your project.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">♿️ Accessible</h3>
            <p className="text-muted-foreground">
              Built on Radix UI primitives with full keyboard navigation and screen reader support.
            </p>
          </div>
        </div>

        <div className="mt-16 p-6 bg-muted rounded-lg">
          <h3 className="text-2xl font-semibold mb-4">Quick Start</h3>
          <div className="text-left space-y-2 font-mono text-sm">
            <div className="bg-background p-3 rounded">
              <span className="text-muted-foreground"># Initialize your project</span>
              <br />
              <span>npx taku-ui init</span>
            </div>
            <div className="bg-background p-3 rounded">
              <span className="text-muted-foreground"># Add a component</span>
              <br />
              <span>npx taku-ui add window-controls</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
