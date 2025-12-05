import path from 'path'
import fs from 'fs-extra'
import { RawConfig, configSchema } from './schema'

export const CONFIG_FILE_NAME = 'taku-ui.json'

export async function getConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configPath = path.resolve(cwd, CONFIG_FILE_NAME)

    if (!fs.existsSync(configPath)) {
      return null
    }

    const configContent = await fs.readJSON(configPath)
    
    // If config file exists but is incomplete, return null to trigger auto-detection
    // This handles cases where init was interrupted or config is corrupted
    if (!configContent.tailwind || !configContent.tailwind.config || !configContent.tailwind.css) {
      return null
    }
    
    // Ensure boolean fields are actually booleans (handle string values)
    if (typeof configContent.rsc !== 'boolean') {
      if (configContent.rsc === 'true') {
        configContent.rsc = true
      } else if (configContent.rsc === 'false') {
        configContent.rsc = false
      } else {
        // For invalid values (like version numbers), use default from schema
        configContent.rsc = false
      }
    }
    if (typeof configContent.tsx !== 'boolean') {
      if (configContent.tsx === 'true') {
        configContent.tsx = true
      } else if (configContent.tsx === 'false') {
        configContent.tsx = false
      } else {
        // For invalid values, use default from schema
        configContent.tsx = true
      }
    }
    if (configContent.tailwind && typeof configContent.tailwind.cssVariables !== 'boolean') {
      if (configContent.tailwind.cssVariables === 'true') {
        configContent.tailwind.cssVariables = true
      } else if (configContent.tailwind.cssVariables === 'false') {
        configContent.tailwind.cssVariables = false
      } else {
        // For invalid values, use default from schema
        configContent.tailwind.cssVariables = true
      }
    }
    
    try {
      const config = configSchema.parse(configContent)

      return {
        ...config,
        resolvedPaths: {
          tailwindConfig: path.resolve(cwd, config.tailwind.config),
          tailwindCss: path.resolve(cwd, config.tailwind.css),
          utils: resolveImport(config.aliases.utils, cwd),
          components: resolveImport(config.aliases.components, cwd),
          ui: config.aliases.ui ? resolveImport(config.aliases.ui, cwd) : undefined,
        },
      }
    } catch (parseError) {
      // If schema validation fails, return null to trigger auto-detection
      return null
    }
  } catch (error) {
    // If file read fails, return null to trigger auto-detection
    return null
  }
}

export async function setConfig(cwd: string, config: Partial<RawConfig>) {
  const configPath = path.resolve(cwd, CONFIG_FILE_NAME)
  await fs.writeJSON(configPath, config, { spaces: 2 })
}

function resolveImport(importPath: string, cwd: string) {
  // Convert @/components to src/components
  return path.resolve(cwd, importPath.replace(/^@\//, 'src/'))
}

export async function getTailwindConfig(cwd: string) {
  const config = await getConfig(cwd)
  if (!config) {
    return null
  }
  return config.resolvedPaths.tailwindConfig
}
