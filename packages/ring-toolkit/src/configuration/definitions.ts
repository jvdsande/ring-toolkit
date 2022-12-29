export const Args = {
  shared: [
    {
      name: 'command',
      type: String,
      defaultOption: true,
    },
    {
      name: 'config',
      alias: 'c',
      type: String,
      typeLabel: '{underline path}',
      description: 'A custom path to a Ring Toolkit config file',
    },
    {
      name: 'empty',
      alias: 'e',
      type: Boolean,
      defaultValue: false,
      description: 'Disable default commands. Defaults to false',
    },
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      defaultValue: false,
      description: 'Displays this message, or a command help message if a command is provided',
    },
    {
      name: 'debug',
      type: Boolean,
      defaultValue: false,
      description: 'Enable debug logs. Defaults to false',
    },
  ],
};

export const Usage = {
  main: [
    {
      header: 'Ring Toolkit',
      content: 'All-in-one extensible Web Development toolkit',
    },
    {
      header: 'Usage',
      content: '$ ring-toolkit <command> [options]',
    },
  ],
  options: (commands: string[]) => [
    {
      header: 'For more info, run any command with the --help flag',
      content: commands.map(cmd => `$ ring-toolkit ${cmd} --help`).join('\n'),
    },
    {
      header: 'Options',
      optionList: Args.shared,
      hide: ['command'],
    },
  ],
};
