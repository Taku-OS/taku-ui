import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'

// Default registry URL - users can override via TAKU_UI_REGISTRY_URL env var or config
// Supports both personal accounts and GitHub organizations
// Format: https://raw.githubusercontent.com/{USERNAME_OR_ORG}/{REPO}/{BRANCH}/registry
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry'

/**
 * Get registry base URL from environment variable or use default
 */
export function getRegistryUrl(): string {
  return process.env.TAKU_UI_REGISTRY_URL || DEFAULT_REGISTRY_URL
}

/**
 * Check if a path exists locally (for development mode)
 */
function isLocalPath(pathOrUrl: string): boolean {
  return !pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')
}

/**
 * Fetch registry index from remote URL
 */
async function fetchRemoteRegistry(registryUrl: string): Promise<any[]> {
  const indexPath = `${registryUrl}/index.json`
  
  try {
    const response = await fetch(indexPath, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    throw new Error(`Failed to fetch registry from ${indexPath}: ${error}`)
  }
}

/**
 * Fetch component from remote URL
 */
async function fetchRemoteComponent(name: string, registryUrl: string): Promise<any> {
  const componentUrl = `${registryUrl}/components/${name}.json`
  
  try {
    const response = await fetch(componentUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Component "${name}" not found in registry`)
      }
      throw new Error(`Failed to fetch component: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error
    }
    throw new Error(`Failed to fetch component "${name}" from ${componentUrl}: ${error}`)
  }
}

/**
 * Fetch registry index (components list)
 * Supports both local (development) and remote (production) registries
 */
export async function fetchRegistry(registryPath?: string): Promise<any[]> {
  // If registryPath is provided and is a local path, read from local registry
  if (registryPath && isLocalPath(registryPath)) {
    const indexPath = path.resolve(registryPath, 'index.json')
    if (fs.existsSync(indexPath)) {
      try {
        return await fs.readJSON(indexPath)
      } catch (error) {
        // Fall through to remote fetch if local read fails
      }
    }
  }

  // Fetch from remote registry
  const registryUrl = registryPath && !isLocalPath(registryPath) 
    ? registryPath 
    : getRegistryUrl()
  
  return await fetchRemoteRegistry(registryUrl)
}

/**
 * Fetch a specific component from registry
 * Supports both local (development) and remote (production) registries
 */
export async function fetchComponent(name: string, registryPath: string): Promise<any> {
  // If registryPath is a local path, read from local registry
  if (isLocalPath(registryPath)) {
    const componentPath = path.resolve(registryPath, 'components', `${name}.json`)
    
    if (fs.existsSync(componentPath)) {
      try {
        return await fs.readJSON(componentPath)
      } catch (error) {
        // Fall through to remote fetch if local read fails
      }
    }
  }

  // Fetch from remote registry
  const registryUrl = isLocalPath(registryPath)
    ? getRegistryUrl()
    : registryPath
  
  return await fetchRemoteComponent(name, registryUrl)
}
