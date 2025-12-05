import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Component {
  name: string
  description: string
  dependencies: string[]
}

async function getComponents(): Promise<Component[]> {
  try {
    // In Next.js, process.cwd() points to the app directory (apps/www)
    // Registry is at ../../registry/index.json from apps/www
    const registryPath = join(process.cwd(), '../../registry/index.json')
    const fileContent = readFileSync(registryPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading registry:', error)
    // Fallback: return sample data if file can't be read
    return [
      {
        name: 'window-controls',
        description: 'Window control buttons (close, minimize, maximize) for desktop applications',
        dependencies: ['class-variance-authority'],
      },
    ]
  }
}

export default async function ComponentsPage() {
  const components = await getComponents()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-block mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Components</h1>
          <p className="text-muted-foreground">
            Browse all available Taku UI components
          </p>
        </div>

        {components.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No components found in registry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <div
                key={component.name}
                className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 capitalize">
                  {component.name}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {component.description}
                </p>
                {component.dependencies && component.dependencies.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Dependencies:</p>
                    <div className="flex flex-wrap gap-2">
                      {component.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="px-2 py-1 bg-muted rounded text-xs font-mono"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/components/${component.name}`}
                    className="px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

