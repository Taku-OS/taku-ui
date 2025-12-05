import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'
import { WindowControlsPreview } from '@/components/window-controls-preview'
import { readFileSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'

interface ComponentFile {
  name: string
  content: string
}

interface ComponentData {
  name: string
  description: string
  dependencies: string[]
  files: ComponentFile[]
}

async function getComponent(name: string): Promise<ComponentData | null> {
  try {
    const componentPath = join(
      process.cwd(),
      `../../registry/components/${name}.json`
    )
    const fileContent = readFileSync(componentPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading component:', error)
    return null
  }
}

export default async function ComponentDetailPage({
  params,
}: {
  params: { name: string }
}) {
  const component = await getComponent(params.name)

  if (!component) {
    notFound()
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/components"
            className="inline-block mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Components
          </Link>
          <h1 className="text-4xl font-bold mb-2 capitalize">
            {component.name}
          </h1>
          <p className="text-muted-foreground">{component.description}</p>
        </div>

        {/* Component Preview Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Preview</h2>
          <div className="p-8 border rounded-lg bg-background">
            {component.name === 'window-controls' && <WindowControlsPreview />}
          </div>
        </div>

        {/* Dependencies Section */}
        {component.dependencies && component.dependencies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
            <div className="flex flex-wrap gap-2">
              {component.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="px-3 py-1 bg-muted rounded-md text-sm font-mono"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code Section */}
        {component.files && component.files.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Code</h2>
            {component.files.map((file) => (
              <div key={file.name} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{file.name}</h3>
                  <CopyButton text={file.content} />
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{file.content}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

