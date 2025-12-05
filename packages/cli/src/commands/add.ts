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

export async function add(components: string[], options: AddOptions) {
  const cwd = process.cwd()

  // Check if initialized
  const config = await getConfig(cwd)
  if (!config) {
    logger.error('Project not initialized. Run "taku-ui init" first.')
    process.exit(1)
  }

  // Get registry path/URL
  // Priority: config.registryUrl > env TAKU_UI_REGISTRY_URL > local dev path
  const registryPath = (config as any).registryUrl 
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
      await installComponent(componentName, config, registryPath, options.overwrite || false)
    }

    spinner.succeed('Components installed successfully!')
    logger.break()
    logger.success(`Added ${components.length} component(s).`)
    logger.info(`\nYou can now import them in your project:`)
    logger.info(chalk.cyan(`  import { Button } from '${config.aliases.components}/ui/button'`))
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
