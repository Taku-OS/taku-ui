import chalk from 'chalk'
import ora from 'ora'

export const logger = {
  error: (...args: unknown[]) => {
    console.log(chalk.red(...args))
  },
  warn: (...args: unknown[]) => {
    console.log(chalk.yellow(...args))
  },
  info: (...args: unknown[]) => {
    console.log(chalk.cyan(...args))
  },
  success: (...args: unknown[]) => {
    console.log(chalk.green(...args))
  },
  break: () => {
    console.log('')
  },
}

export function createSpinner(text: string) {
  return ora({
    text,
    color: 'cyan',
  })
}
