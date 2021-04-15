import fs from 'fs-extra'
import cli from 'cli'
import path from 'path'
import depcheck from 'depcheck'
import childProcess from 'child_process'

/**
 * Helper function for pluralizing the "dependency" word
 * @param {number} length - number of dependencies
 * @returns {string} - pluralized word
 */
function dependencies(length) {
  if (length < 2) {
    return 'dependency'
  }

  return 'dependencies'
}

/**
 * Check if a dependency matches an array of checks
 * @param {string} dep - dependency to check
 * @param {string|RegExp|(string|RegExp)[]} match - checks to run
 * @returns {boolean} - whether the dep matches
 */
function depMatches(dep, match) {
  if (Array.isArray(match)) {
    return match.some((m) => depMatches(dep, m))
  }

  if (typeof match === 'string') {
    return dep.startsWith('string')
  }

  return match.test(dep)
}

/**
 * Helper function for filtering explicit imports of an aliased dep's subdependencies
 * Checks that @egg/web is present in this case
 * @param {string[]} missing - missing dependencies to filter
 * @param {string[]} installed - installed dependencies
 * @param {string} alias - aliased dependency
 * @param {RegExp|string|(RegExp|string)[]} match - values alias
 * @returns {string[]} - filtered dependencies
 */
function detectAlias(missing, installed, alias, match) {
  const missingOutsideAlias = missing.filter((dep) => !depMatches(dep, match))

  if (missingOutsideAlias.length !== missing.length) {
    if (installed.includes(alias)) {
      cli.info(`Detected explicit import of ${alias} sub-dependency`)
    } else {
      cli.error(
        `Detected explicit import of ${alias} sub-dependency, ${alias} missing`
      )
      return missing
    }
  }

  return missingOutsideAlias
}

/**
 * Launch the depcheck command
 * @param {object} config - loaded config
 * @returns {Promise<void>} - depcheck execution
 */
export async function commandDepCheck(config) {
  if (!config) {
    cli.info('No build config found, falling back to Depcheck CLI')

    // Remove ring-toolkit command from args
    const argv = process.argv.slice(3)

    return childProcess.spawnSync('depcheck', argv, {
      stdio: 'inherit',
      shell: true
    })
  }

  const pkg = await fs.readJSON(path.resolve(process.cwd(), './package.json'))
  const results = await depcheck(process.cwd(), config)

  const declaredDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ]

  if (results.dependencies.length) {
    cli.info(
      `Found ${results.dependencies.length} potentially unused ${dependencies(
        results.dependencies.length
      )}: `
    )
    results.dependencies.forEach((dep) => cli.info(` - ${dep}`))
  }

  const missing = Object.keys(config?.alias ?? {}).reduce((m, alias) => {
    return detectAlias(m, declaredDeps, alias, config.alias[alias])
  }, Object.keys(results.missing))

  if (missing.length > 0) {
    cli.error(
      `Found ${missing.length} missing ${dependencies(missing.length)}: `
    )
    missing.forEach((dep) => cli.error(` - ${dep}`))
    process.exit(1)
  }

  cli.ok('No missing dependency detected')
}
