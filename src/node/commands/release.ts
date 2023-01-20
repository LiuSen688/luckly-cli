import ora from 'ora'
import execa from 'execa'
import logger from '../shared/logger.js'

import { getVersion } from '../shared/fsUtils.js'


async function publish() {
  const s = ora().start('Publishing all packages')
  const args = ['-r', 'publish', '--no-git-checks', '--access', 'public']

  const ret = await execa('pnpm', args)
  if (ret.stderr && ret.stderr.includes('npm ERR!')) {
    throw new Error('\n' + ret.stderr)
  } else {
    s.succeed('Publish all packages successfully')
    ret.stdout && logger.info(ret.stdout)
  }
}



interface ReleaseCommandOptions {
  remote?: string
  task?(): Promise<void>
}

export async function release(options: ReleaseCommandOptions) {
  try {
    const currentVersion = getVersion()

    if (!currentVersion) {
      logger.error('Your package is missing the version field')
      return
    }

    if (options.task) {
      await options.task()
    }

    await publish()

    logger.success(`Release successfully!`)

  } catch (error: any) {
    logger.error(error.toString())
    process.exit(1)
  }
}
