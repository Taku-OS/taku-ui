import path from 'path'
import fs from 'fs-extra'
import prompts from 'prompts'
import chalk from 'chalk'
import { logger, createSpinner } from '../utils/logger'
import { getConfig } from '../utils/get-config'
import { fetchComponent, fetchRegistry, getRegistryUrl } from '../utils/registry'

interface AddOptions {
  overwrite?: boolean
  all?: boolean
}

/**
 * Auto-detect project configuration
 */
async function autoDetectConfig(cwd: string): Promise<any> {
  const packageJsonPath = path.resolve(cwd, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No package.json found. Please run this command in a valid project.')
  }

  const packageJson = await fs.readJSON(packageJsonPath)
  const isNext = packageJson.dependencies?.next || packageJson.devDependencies?.next
  const hasTypeScript = fs.existsSync(path.resolve(cwd, 'tsconfig.json')) || 
                        packageJson.devDependencies?.typescript ||
                        packageJson.dependencies?.typescript

  // Auto-detect import aliases
  let componentsAlias = '@/components'
  let utilsAlias = '@/lib/utils'
  
  const tsconfigPath = path.resolve(cwd, 'tsconfig.json')
  const jsconfigPath = path.resolve(cwd, 'jsconfig.json')
  const configPath = fs.existsSync(tsconfigPath) ? tsconfigPath : 
                     (fs.existsSync(jsconfigPath) ? jsconfigPath : null)
  
  if (configPath) {
    try {
      const config = await fs.readJSON(configPath)
      const paths = config?.compilerOptions?.paths || {}
      if (paths['@/*']) {
        const basePath = paths['@/*'][0]?.replace('/*', '') || 'src'
        componentsAlias = basePath === 'src' ? '@/components' : `@/${basePath}/components`
        utilsAlias = basePath === 'src' ? '@/lib/utils' : `@/${basePath}/lib/utils`
      }
    } catch (e) {
      // Use defaults
    }
  }

  // Determine components directory
  const componentsPath = componentsAlias.replace('@/', 'src/')
  const utilsPath = utilsAlias.replace('@/', 'src/')

  return {
    style: 'default',
    tailwind: {
      config: isNext ? 'tailwind.config.ts' : 'tailwind.config.js',
      css: isNext ? 'app/globals.css' : 'src/index.css',
      baseColor: 'slate',
      cssVariables: true,
    },
    rsc: isNext,
    tsx: hasTypeScript,
    aliases: {
      components: componentsAlias,
      utils: utilsAlias,
    },
    resolvedPaths: {
      tailwindConfig: path.resolve(cwd, isNext ? 'tailwind.config.ts' : 'tailwind.config.js'),
      tailwindCss: path.resolve(cwd, isNext ? 'app/globals.css' : 'src/index.css'),
      utils: path.resolve(cwd, utilsPath),
      components: path.resolve(cwd, componentsPath),
    },
  }
}

export async function add(components: string[], options: AddOptions) {
  const cwd = process.cwd()

  // Try to get config, or auto-detect if not found
  let config = await getConfig(cwd)
  if (!config) {
    logger.info('No configuration found. Auto-detecting project structure...')
    logger.break()
    
    try {
      const autoConfig = await autoDetectConfig(cwd)
      config = autoConfig as any

      const detectedConfig = config as NonNullable<typeof config>

      logger.info('✓ Project structure detected')
      logger.info(`  Components: ${detectedConfig.aliases.components}`)
      logger.info(`  Utils: ${detectedConfig.aliases.utils}`)
      logger.info(`  TypeScript: ${detectedConfig.tsx ? 'Yes' : 'No'}`)
      logger.break()
      logger.info('💡 Tip: Run "taku-ui init" to customize these settings.')
      logger.break()
    } catch (error) {
      logger.error('Failed to auto-detect project structure.')
      logger.error('Please run "taku-ui init" first to configure your project.')
      process.exit(1)
    }
  }

  if (!config) {
    logger.error('Configuration is missing. Please run "taku-ui init" to set it up.')
    process.exit(1)
  }

  const resolvedConfig = config as NonNullable<typeof config>

  // Get registry path/URL
  // Priority: config.registryUrl > env TAKU_UI_REGISTRY_URL > local dev path
  const registryPath = (resolvedConfig as any).registryUrl 
    || process.env.TAKU_UI_REGISTRY_URL 
    || (() => {
      // Try local registry for development (only if exists)
      const localPath = path.resolve(__dirname, '../../..', 'registry')
      if (fs.existsSync(path.resolve(localPath, 'index.json'))) {
        return localPath
      }
      return undefined // Will use default remote URL
    })()

  // If no components specified, prompt user
  if (components.length === 0 && !options.all) {
    // Get available components from registry
    const registry = await fetchRegistry(registryPath)
    const availableComponents = registry.map((c: any) => c.name)

    if (availableComponents.length === 0) {
      logger.error('No components available in registry.')
      process.exit(1)
    }

    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Which components would you like to add?',
      choices: availableComponents.map((c: string) => ({
        title: c,
        value: c,
      })),
    })

    if (!selected || selected.length === 0) {
      logger.info('No components selected.')
      return
    }

    components = selected
  }

  if (options.all) {
    // Get all available components from registry
    const registry = await fetchRegistry(registryPath)
    components = registry.map((c: any) => c.name)
  }

  const spinner = createSpinner('Installing components...').start()

  try {
    for (const componentName of components) {
      await installComponent(componentName, resolvedConfig, registryPath, options.overwrite || false)
    }

    spinner.succeed('Components installed successfully!')
    logger.break()
    logger.success(`Added ${components.length} component(s).`)
    logger.info(`\nYou can now import them in your project:`)
    logger.info(chalk.cyan(`  import { Button } from '${resolvedConfig.aliases.components}/ui/button'`))
    logger.break()
  } catch (error) {
    spinner.fail('Failed to install components')
    logger.error(error)
    process.exit(1)
  }
}

async function installComponent(
  name: string,
  config: any,
  registryPath: string | undefined,
  overwrite: boolean
) {
  try {
    // Ensure utils file exists (components might need it)
    const utilsPath = path.resolve(config.resolvedPaths.utils)
    if (!fs.existsSync(utilsPath)) {
      await fs.ensureDir(path.dirname(utilsPath))
      await fs.writeFile(
        utilsPath,
        `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
      )
    }

    // Use registryPath or default to undefined (will use default remote URL)
    const component = await fetchComponent(name, registryPath || getRegistryUrl())

    if (!component || !component.files) {
      throw new Error(`Component "${name}" not found in registry.`)
    }

    // Download component files
    for (const file of component.files) {
      const targetPath = path.resolve(config.resolvedPaths.components, 'ui', path.basename(file.name))

      // Check if file exists
      if (fs.existsSync(targetPath) && !overwrite) {
        const { shouldOverwrite } = await prompts({
          type: 'confirm',
          name: 'shouldOverwrite',
          message: `${path.basename(file.name)} already exists. Overwrite?`,
          initial: false,
        })

        if (!shouldOverwrite) {
          continue
        }
      }

      await fs.ensureDir(path.dirname(targetPath))
      await fs.writeFile(targetPath, file.content)
    }

    logger.info(`  ✓ ${name}`)
  } catch (error) {
    throw new Error(`Failed to install ${name}: ${error}`)
  }
}
