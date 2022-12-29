/**
 * Helper function for pluralizing the "dependency" word
 * @param length - number of dependencies
 * @returns - pluralized word
 */
export function dependencies(length: number) {
  if (length < 2) {
    return 'dependency';
  }

  return 'dependencies';
}

/**
 * Check if a dependency matches an array of checks
 * @param dep - dependency to check
 * @param match - checks to run
 * @returns - whether the dep matches
 */
export function depMatches(dep: string, match: string | RegExp | (string | RegExp)[]): boolean {
  if (Array.isArray(match)) {
    return match.some(m => depMatches(dep, m));
  }

  if (typeof match === 'string') {
    return dep.startsWith('string');
  }

  return match.test(dep);
}

/**
 * Helper function for filtering explicit imports of an aliased dep's subdependencies
 * Checks that aliased dep is present in this case
 * @param missing - missing dependencies to filter
 * @param installed - installed dependencies
 * @param alias - aliased dependency
 * @param match - values alias
 * @returns - filtered dependencies
 */
export function detectAlias(
  missing: string[],
  installed: string[],
  alias: string,
  match: string | RegExp | (string | RegExp)[],
) {
  const missingOutsideAlias = missing.filter(dep => !depMatches(dep, match));

  const isInstalled = installed.includes(alias);
  const isDetected = missingOutsideAlias.length !== missing.length;

  return {
    missing: !isInstalled ? missing : missingOutsideAlias,
    detected: isDetected,
    installed: isInstalled,
  };
}
