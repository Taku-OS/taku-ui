import { Command } from 'commander'
import { init } from './commands/init'
import { add } from './commands/add'

const program = new Command()

program
  .name('taku-ui')
  .description('Add beautiful components to your project')
  .version('0.0.1')

program
  .command('init')
  .description('Initialize your project with Taku UI')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(init)

program
  .command('add')
  .description('Add a component to your project')
  .argument('[components...]', 'The components to add')
  .option('-o, --overwrite', 'Overwrite existing files')
  .option('-a, --all', 'Install all available components')
  .action(add)

program.parse()
