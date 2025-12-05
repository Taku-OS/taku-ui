import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'

// Default registry URL - users can override via TAKU_UI_REGISTRY_URL env var or config
// Supports both personal accounts and GitHub organizations
// Format: https://raw.githubusercontent.com/{USERNAME_OR_ORG}/{REPO}/{BRANCH}/registry
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry'
const DEFAULT_GITHUB_OWNER = 'Taku-OS'
const DEFAULT_GITHUB_REPO = 'taku-ui'
const DEFAULT_GITHUB_BRANCH = 'main'

/**
 * Get GitHub token from environment variable
 * For private repositories, users need to set TAKU_UI_GITHUB_TOKEN
 */
function getGitHubToken(): string | undefined {
  return process.env.TAKU_UI_GITHUB_TOKEN
}

/**
 * Get registry base URL from environment variable or use default
 */
export function getRegistryUrl(): string {
  return process.env.TAKU_UI_REGISTRY_URL || DEFAULT_REGISTRY_URL
}

/**
 * Check if we should use GitHub API (for private repos) or raw.githubusercontent.com
 */
function shouldUseGitHubAPI(): boolean {
  return !!getGitHubToken()
}

/**
 * Check if a path exists locally (for development mode)
 */
function isLocalPath(pathOrUrl: string): boolean {
  return !pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')
}

/**
 * Fetch file from GitHub API (for private repositories)
 */
async function fetchFromGitHubAPI(owner: string, repo: string, branch: string, path: string): Promise<any> {
  const token = getGitHubToken()
  if (!token) {
    throw new Error('GitHub token is required for private repositories. Set TAKU_UI_GITHUB_TOKEN environment variable.')
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'User-Agent': 'taku-ui-cli',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`)
      }
      if (response.status === 401 || response.status === 403) {
        const token = getGitHubToken()
        if (!token) {
          throw new Error(
            `Authentication failed. This appears to be a private repository.\n\n` +
            `Please set TAKU_UI_GITHUB_TOKEN environment variable:\n` +
            `  export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx\n\n` +
            `Or make the repository public at:\n` +
            `  https://github.com/${owner}/${repo}/settings\n\n` +
            `See PRIVATE_REPO_SETUP.md for detailed instructions.`
          )
        }
        throw new Error(`Authentication failed. Please check your GitHub token has access to ${owner}/${repo}`)
      }
      throw new Error(`Failed to fetch from GitHub API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // GitHub API returns base64 encoded content
    if (data.content && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      return JSON.parse(content)
    }
    
    throw new Error('Unexpected response format from GitHub API')
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error
    }
    throw new Error(`Failed to fetch from GitHub API: ${error}`)
  }
}

/**
 * Fetch registry index from remote URL
 * Supports both public (raw.githubusercontent.com) and private (GitHub API) repositories
 */
async function fetchRemoteRegistry(registryUrl: string): Promise<any[]> {
  // Try raw.githubusercontent.com first (for public repos)
  const indexPath = `${registryUrl}/index.json`
  
  try {
    const response = await fetch(indexPath, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }

    // If 404 and we have a token, try GitHub API (for private repos)
    if (response.status === 404 && shouldUseGitHubAPI()) {
      const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
      if (match) {
        const [, owner, repo, branch] = match
        return await fetchFromGitHubAPI(owner, repo, branch, 'registry/index.json')
      }
      // Fallback to default values
      return await fetchFromGitHubAPI(DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO, DEFAULT_GITHUB_BRANCH, 'registry/index.json')
    }

    // If 404 and no token, provide helpful error message
    if (response.status === 404) {
      const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
      if (match) {
        const [, owner, repo] = match
        throw new Error(
          `Registry not found at ${indexPath}\n\n` +
          `This appears to be a private repository (${owner}/${repo}).\n\n` +
          `Please set TAKU_UI_GITHUB_TOKEN environment variable:\n` +
          `  export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx\n\n` +
          `Or make the repository public at:\n` +
          `  https://github.com/${owner}/${repo}/settings\n\n` +
          `See PRIVATE_REPO_SETUP.md for detailed instructions.`
        )
      }
      throw new Error(`Registry not found at ${indexPath}`)
    }

    throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`)
  } catch (error) {
    // Only try GitHub API if it's a network error and we have a token
    // Don't try if it's a different error (like JSON parse error)
    if (shouldUseGitHubAPI() && error instanceof Error) {
      // Only retry with GitHub API if it's a network/404 error
      const isNetworkError = error.message.includes('fetch') || 
                             error.message.includes('network') ||
                             error.message.includes('ECONNREFUSED') ||
                             error.message.includes('ETIMEDOUT')
      
      if (isNetworkError || error.message.includes('not found')) {
        const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
        if (match) {
          const [, owner, repo, branch] = match
          try {
            return await fetchFromGitHubAPI(owner, repo, branch, 'registry/index.json')
          } catch (apiError) {
            // If API also fails, throw original error with better message
            throw error
          }
        }
      }
    }
    throw error
  }
}

/**
 * Fetch component from remote URL
 * Supports both public (raw.githubusercontent.com) and private (GitHub API) repositories
 */
async function fetchRemoteComponent(name: string, registryUrl: string): Promise<any> {
  // Try raw.githubusercontent.com first (for public repos)
  const componentUrl = `${registryUrl}/components/${name}.json`
  
  try {
    const response = await fetch(componentUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      return await response.json()
    }

    // If 404 and we have a token, try GitHub API (for private repos)
    // Only try GitHub API if we get a 404, indicating the repo might be private
    if (response.status === 404 && shouldUseGitHubAPI()) {
      const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
      if (match) {
        const [, owner, repo, branch] = match
        try {
          return await fetchFromGitHubAPI(owner, repo, branch, `registry/components/${name}.json`)
        } catch (apiError) {
          // If GitHub API also fails, fall through to show the original 404 error
          // This handles cases where the repo is public but component doesn't exist
        }
      }
    }

    // If 404 and no token, or GitHub API also failed, provide helpful error message
    if (response.status === 404) {
      const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
      if (match) {
        const [, owner, repo] = match
        // Check if we tried GitHub API and it failed
        if (shouldUseGitHubAPI()) {
          throw new Error(
            `Component "${name}" not found in registry.\n\n` +
            `The repository ${owner}/${repo} appears to be public, but the component "${name}" doesn't exist.\n\n` +
            `Available components can be listed with: npx taku-ui@latest add`
          )
        }
        throw new Error(
          `Component "${name}" not found at ${componentUrl}\n\n` +
          `This appears to be a private repository (${owner}/${repo}).\n\n` +
          `Please set TAKU_UI_GITHUB_TOKEN environment variable:\n` +
          `  export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx\n\n` +
          `Or make the repository public at:\n` +
          `  https://github.com/${owner}/${repo}/settings\n\n` +
          `See PRIVATE_REPO_SETUP.md for detailed instructions.`
        )
      }
      throw new Error(`Component "${name}" not found in registry`)
    }

    throw new Error(`Failed to fetch component: ${response.status} ${response.statusText}`)
  } catch (error) {
    // Only try GitHub API if it's a network error (not a response error)
    // This handles cases where fetch itself fails (network issues, CORS, etc.)
    if (shouldUseGitHubAPI() && error instanceof Error) {
      // Check if this is a network error (not a response error)
      // Response errors are handled above, so this should only catch network-level errors
      const isNetworkError = (error.message.includes('fetch') && !error.message.includes('status')) || 
                             error.message.includes('network') ||
                             error.message.includes('ECONNREFUSED') ||
                             error.message.includes('ETIMEDOUT') ||
                             error.message.includes('ENOTFOUND')
      
      if (isNetworkError) {
        const match = registryUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/registry/)
        if (match) {
          const [, owner, repo, branch] = match
          try {
            return await fetchFromGitHubAPI(owner, repo, branch, `registry/components/${name}.json`)
          } catch (apiError) {
            // If API also fails, throw original network error
            throw new Error(`Network error: Failed to fetch component "${name}" from ${componentUrl}. ${error.message}`)
          }
        }
      }
    }
    // Re-throw the error if we can't handle it
    throw error
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
