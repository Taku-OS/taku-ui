import path from 'path'
import fs from 'fs-extra'
import prompts from 'prompts'
import execa from 'execa'
import chalk from 'chalk'
import { logger, createSpinner } from '../utils/logger'
import { getConfig, setConfig } from '../utils/get-config'

export async function init(options: { yes?: boolean }) {
  const cwd = process.cwd()

  logger.info('Welcome to Taku UI!')
  logger.break()

  // Check if already initialized
  const existingConfig = await getConfig(cwd)
  if (existingConfig && !options.yes) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Configuration already exists. Overwrite?',
      initial: false,
    })

    if (!overwrite) {
      logger.info('Cancelled.')
      return
    }
  }

  // Detect project structure
  const packageJsonPath = path.resolve(cwd, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    logger.error('No package.json found. Please run this command in a valid project.')
    process.exit(1)
  }

  const packageJson = await fs.readJSON(packageJsonPath)
  const isNext = packageJson.dependencies?.next || packageJson.devDependencies?.next

  // Prompt for configuration
  const config = await prompts([
    {
      type: 'select',
      name: 'style',
      message: 'Which style would you like to use?',
      choices: [
        { title: 'Default', value: 'default' },
        { title: 'New York', value: 'new-york' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'baseColor',
      message: 'Which base color would you like to use?',
      choices: [
        { title: 'Slate', value: 'slate' },
        { title: 'Gray', value: 'gray' },
        { title: 'Zinc', value: 'zinc' },
        { title: 'Neutral', value: 'neutral' },
        { title: 'Stone', value: 'stone' },
      ],
      initial: 0,
    },
    {
      type: 'text',
      name: 'tailwindConfig',
      message: 'Where is your tailwind.config file?',
      initial: isNext ? 'tailwind.config.ts' : 'tailwind.config.js',
    },
    {
      type: 'text',
      name: 'tailwindCss',
      message: 'Where is your global CSS file?',
      initial: isNext ? 'app/globals.css' : 'src/index.css',
    },
    {
      type: 'confirm',
      name: 'cssVariables',
      message: 'Would you like to use CSS variables for theming?',
      initial: true,
    },
    {
      type: 'text',
      name: 'components',
      message: 'Configure the import alias for components:',
      initial: '@/components',
    },
    {
      type: 'text',
      name: 'utils',
      message: 'Configure the import alias for utils:',
      initial: '@/lib/utils',
    },
    {
      type: 'confirm',
      name: 'rsc',
      message: 'Are you using React Server Components?',
      initial: isNext,
    },
    {
      type: 'confirm',
      name: 'tsx',
      message: 'Are you using TypeScript?',
      initial: true,
    },
  ])

  if (!config.style) {
    logger.info('Cancelled.')
    return
  }

  // Create config file
  const configData = {
    $schema: 'https://taku-ui.com/schema.json',
    style: config.style,
    tailwind: {
      config: config.tailwindConfig,
      css: config.tailwindCss,
      baseColor: config.baseColor,
      cssVariables: Boolean(config.cssVariables),
    },
    rsc: Boolean(config.rsc),
    tsx: Boolean(config.tsx),
    aliases: {
      components: config.components,
      utils: config.utils,
    },
  }

  await setConfig(cwd, configData)

  // Install dependencies
  const spinner = createSpinner('Installing dependencies...').start()

  try {
    const dependencies = [
      'tailwindcss',
      'autoprefixer',
      'postcss',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-slot',
    ]

    const devDependencies = config.tsx ? ['@types/react', '@types/react-dom'] : []

    // Detect package manager
    const packageManager = await detectPackageManager(cwd)

    if (dependencies.length > 0) {
      await execa(packageManager, ['add', ...dependencies], { cwd })
    }

    if (devDependencies.length > 0) {
      await execa(packageManager, ['add', '-D', ...devDependencies], { cwd })
    }

    // Create utils file
    const utilsPath = path.resolve(cwd, config.utils.replace('@/', 'src/'), 'utils.ts')
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

    // Create components directory
    const componentsPath = path.resolve(cwd, config.components.replace('@/', 'src/'))
    await fs.ensureDir(path.resolve(componentsPath, 'ui'))

    spinner.succeed('Dependencies installed successfully!')

    logger.break()
    logger.success('Success! Your project has been configured.')
    logger.info('\nNext steps:')
    logger.info('  1. Add components:')
    logger.info(`     ${chalk.cyan('npx taku-ui add button')}`)
    logger.info('  2. Start using components in your project!')
    logger.break()
  } catch (error) {
    spinner.fail('Failed to install dependencies')
    logger.error(error)
    process.exit(1)
  }
}

async function detectPackageManager(cwd: string): Promise<string> {
  if (fs.existsSync(path.resolve(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }
  if (fs.existsSync(path.resolve(cwd, 'yarn.lock'))) {
    return 'yarn'
  }
  if (fs.existsSync(path.resolve(cwd, 'bun.lockb'))) {
    return 'bun'
  }
  return 'npm'
}
