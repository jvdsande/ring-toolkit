export async function getAliasConfiguration(
  configuration: any,
  alias: string,
  commandOptions: any,
) {
  const commandConfiguration = configuration[alias];

  if (typeof commandConfiguration === 'function') {
    return await commandConfiguration(commandOptions);
  }

  return commandConfiguration;
}
