declare namespace yargs {
  export interface Argv {
    _: string[];
    '$0': string;
    [key: string]: any;
  }

  /**
   * For complicated commands you can pull the logic into a module.
   */
  export interface CommandModule {

    /**
     * string that executes this command when given on the command line, may contain positional args
     */
    command: string;

    /**
     * string used as the description for the command in help text, use false for a hidden command
     */
    describe: string | boolean;

    /**
     * object declaring the options the command accepts, or a function accepting and returning a yargs instance
     */
    builder: Builder;

    /**
     * a function which will be passed the parsed argv.
     */
    handler: Handler;
  }

  interface CommandDirOptions {

    /**
     * Look for command modules in all subdirectories and apply them as a flattened (non-hierarchical) list.
     */
    recurse?: boolean;

    /**
     * The types of files to look for when requiring command modules.
     */
    extensions?: string[];

    /**
     * A synchronous function called for each command module encountered. Accepts commandObject, pathToFile, and
     * filename as arguments. Returns commandObject to include the command; any falsy value to exclude/skip it.
     */
    visit?: (commandObject: CommandModule, pathToFile: string, filename: string) => CommandModule | boolean | void;

    /**
     * Whitelist certain modules. See require-directory whitelisting for details.
     */
    include?: RegExp | ((path: string) => boolean);

    /**
     * Blacklist certain modules. See require-directory blacklisting for details.
     */
    exclude?: RegExp | ((path: string) => boolean);
  }

  export type Builder = { [key: string]: Options } | ((yargs: Yargs) => Yargs);
  export interface Handler {
    (argv: Argv): any;
  }

  export interface Yargs {

    /**
     * Get the arguments as a plain old object. Arguments without a corresponding flag show up in the argv._ array. The
     * script name or node command is available at argv.$0 similarly to how $0 works in bash or perl. If yargs is
     * executed in an environment that embeds node and there’s no script name (e.g. Electron or nw.js), it will ignore
     * the first parameter since it expects it to be the script name. In order to override this behavior, use
     * .parse(process.argv.slice(1)) instead of .argv and the first parameter won’t be ignored.
     */
    argv: Argv;

    /**
     * Parse args instead of process.argv. Returns the argv object. args may either be a pre-processed argv array, or a
     * raw argument string.
     */
    <T>(args: string[]): T & Argv;

    /**
     * Parse args instead of process.argv. Returns the argv object. args may either be a pre-processed argv array, or a
     * raw argument string.
     */
    parse<T>(args: string[]): T & Argv;

    /**
     * Set key names as equivalent such that updates to a key will propagate to aliases and vice-versa. Optionally
     * .alias() can take an object that maps keys to aliases. Each key of this object should be the canonical version of
     * the option, and each value should be a string or an array of strings.
     */
    alias(key: string, alias: string): this;
    alias(aliases: { [key: string]: string | string[] }): this;

    /**
     * Tell the parser to interpret key as an array. If .array('foo') is set, --foo foo bar will be parsed as ['foo',
     * 'bar'] rather than as 'foo'.
     */
    array(key: string): this;

    /**
     * Interpret key as a boolean. If a non-flag option follows key in process.argv, that string won’t get set as the
     * value of key. key will default to false, unless a default(key, undefined) is explicitly set. If key is an array,
     * interpret all the elements as booleans.
     */
    boolean(key: string): this;

    /**
     * Check that certain conditions are met in the provided arguments. fn is called with two arguments, the parsed argv
     * hash and an array of options and their aliases. If fn throws or returns a non-truthy value, show the thrown
     * error, usage information, and exit.
     */
    check(fn: (argv: Argv, aliases: { [key: string]: string[] }) => any): this;

    /**
     * Limit valid values for key to a predefined set of choices, given as an array or as an individual value.
     *
     * If this method is called multiple times, all enumerated values will be merged together. Choices are generally
     * strings or numbers, and value matching is case-sensitive. Optionally .choices() can take an object that maps
     * multiple keys to their choices. Choices can also be specified as choices in the object given to option().
     */
    choices(key: string, choices: (string | number)[]): this;

    /**
     * Document the commands exposed by your application. Use desc to provide a description for each command your
     * application accepts (the values stored in argv._). Set desc to false to create a hidden command. Hidden commands
     * don’t show up in the help output and aren’t available for completion. Optionally, you can provide a builder
     * object to give hints about the options that your command accepts.
     */
    command(command: string, description: string | boolean, builder?: Builder, handler?: Handler): this;
    command(command: string, description: string | boolean, module?: CommandModule): this;
    command(module: CommandModule): this;

    /**
     * Apply command modules from a directory relative to the module calling this method. This allows you to organize
     * multiple commands into their own modules under a single directory and apply all of them at once instead of
     * calling .command(require('./dir/module')) multiple times. By default, it ignores subdirectories. This is so you
     * can use a directory structure to represent your command hierarchy, where each command applies its subcommands
     * using this method in its builder function. See the example below. Note that yargs assumes all modules in the
     * given directory are command modules and will error if non-command modules are encountered. In this scenario, you
     * can either move your module to a different directory or use the exclude or visit option to manually filter it
     * out. More on that below.
     * @param directory a relative directory path as a string (required)
     * @param opts is an options object (optional)
     */
    commandDir(directory: string, opts?: CommandDirOptions): this;

    /**
     * Enable bash-completion shortcuts for commands and options. cmd: When present in argv._, will result in the
     * .bashrc completion script being outputted. To enable bash completions, concat the generated script to your
     * .bashrc or .bash_profile.
     * @param fn Rather than relying on yargs’ default completion functionality, which shiver me timbers is pretty
     * awesome, you can provide your own completion method. If invoked without parameters, .completion() will make
     * completion the command to output the completion script.
     */
    completion(cmd: string, fn?: SyncCompletionFunction | AsyncCompletionFunction): this;

    /**
     * Enable bash-completion shortcuts for commands and options. cmd: When present in argv._, will result in the
     * .bashrc completion script being outputted. To enable bash completions, concat the generated script to your
     * .bashrc or .bash_profile.
     * @param description Provide a description in your usage instructions for the command that generates bash
     * completion scripts.
     * @param fn Rather than relying on yargs’ default completion functionality, which shiver me timbers is pretty
     * awesome, you can provide your own completion method. If invoked without parameters, .completion() will make
     * completion the command to output the completion script.
     */
    completion(cmd: string, description?: string, fn?: SyncCompletionFunction | AsyncCompletionFunction): this;
    /**
     * Tells the parser that if the option specified by key is passed in, it should be interpreted as a path to a JSON
     * config file. The file is loaded and parsed, and its properties are set as arguments. If invoked without
     * parameters, .config() will make --config the option to pass the JSON config file. An optional description can be
     * provided to customize the config (key) option in the usage string. An optional parseFn can be used to provide a
     * custom parser. The parsing function must be synchronous, and should return an object containing key value pairs
     * or an error.
     */
    config(key: string, description: string, parseFn?: (configPath: string) => { [key: string]: any }): this;
    config(key: string, parseFn?: (configPath: string) => { [key: string]: any }): this;
    config(config: { [key: string]: any }): this;

    /**
     * Interpret key as a boolean flag, but set its parsed value to the number of flag occurrences rather than true or
     * false. Default value is thus 0.
     */
    count(key: string): this;

    default(key: string, value: any, description?: string): this;
    default(defaults: { [key: string]: any }): this;

    /**
     * If key is a string, show the usage information and exit if key wasn’t specified in process.argv. If key is a
     * number, demand at least as many non-option arguments, which show up in argv._. A second number can also
     * optionally be provided, which indicates the maximum number of non-option arguments. If key is an array, demand
     * each element. If a msg string is given, it will be printed when the argument is missing, instead of the standard
     * error message. This is especially helpful for the non-option arguments in argv._. If a boolean value is given, it
     * controls whether the option is demanded; this is useful when using .options() to specify command line parameters.
     * A combination of .demand(1) and .strict() will allow you to require a user to pass at least one command:
     */
    demand(key: string | string[], msg?: string): this;
    demand(key: string | string[], required?: boolean): this;
    demand(count: number, msg?: string): this;
    demand(count: number, max?: number, msg?: string): this;

    /** An alias for demand(). See docs there. */
    require(key: string | string[], msg?: string): this;
    require(key: string | string[], required?: boolean): this;
    require(count: number, msg?: string): this;
    require(count: number, max?: number, msg?: string): this;
    /** An alias for demand(). See docs there. */
    required(key: string | string[], msg?: string): this;
    required(key: string | string[], required?: boolean): this;
    required(count: number, msg?: string): this;
    required(count: number, max?: number, msg?: string): this;

    /**
     * Describe a key for the generated usage information. Optionally .describe() can take an object that maps keys to
     * descriptions.
     */
    describe(key: string, description: string): this;

    /**
     * Should yargs attempt to detect the os’ locale? Defaults to true.
     */
    detectLocale(enable: boolean): this;

    /**
     * Tell yargs to parse environment variables matching the given prefix and apply them to argv as though they were
     * command line arguments. Use the `__` separator in the environment variable to indicate nested options. (e.g.
     * `prefix_nested__foo` => `nested.foo`) If this method is called with no argument or with an empty string or with true,
     * then all env vars will be applied to argv. Program arguments are defined in this order of precedence:
     *  1. Command line args
     *  2. Config file
     *  3. Env var
     *  4. Configured defaults
     */
    env(prefix?: string | boolean): this;

    /**
     * A message to print at the end of the usage instructions
     */
    epilog(str: string): this;

    /**
     * A message to print at the end of the usage instructions
     */
    epilogue(str: string): this;

    /**
     * Give some example invocations of your program. Inside cmd, the string $0 will get interpolated to the current
     * script name or node command for the present script similar to how $0 works in bash or perl. Examples will be
     * printed out as part of the help message.
     */
    example(cmd: string, description: string): this;

    /**
     * By default, yargs exits the process when the user passes a help flag, uses the .version functionality, or when
     * validation fails. Calling .exitProcess(false) disables this behavior, enabling further actions after yargs have
     * been validated.
     */
    exitProcess(enable: boolean): this;

    /**
     * Method to execute when a failure occurs, rather than printing the failure message. fn is called with the failure
     * message that would have been printed and the Error instance originally thrown, if any.
     */
    fail(fn: (message: string) => any): this;

    /**
     * Allows to programmatically get completion choices for any line.
     * @param args An array of the words in the command line to complete.
     * @param done The callback to be called with the resulting completions.
     */
    getCompletion(args: string[], done: (completions: string[]) => any): this;

    /**
     * Given a key, or an array of keys, places options under an alternative heading when displaying usage instructions
     */
    group(keys: string | string[], groupName: string): this;

    /**
     * Indicate that an option (or group of options) should not be reset when a command is executed
     */
    global(key: string): this;

    /**
     * Add an option (e.g. --help) that displays the usage string and exits the process. If present, the description
     * parameter customizes the description of the help option in the usage string. If invoked without parameters,
     * .help() will make --help the option to trigger help output.
     */
    help(): string;
    help(option?: string, description?: string): this;

    /**
     * Given the key x is set, it is required that the key y is set. Optionally .implies() can accept an object
     * specifying multiple implications.
     */
    implies(x: string, y: string): this;

    /**
     * Return the locale that yargs is currently using. By default, yargs will auto-detect the operating system’s locale
     * so that yargs-generated help content will display in the user’s language. To override this behavior with a static
     * locale, pass the desired locale as a string to this method (see below).
     */
    locale(): string;

    /**
     * Override the auto-detected locale from the user’s operating system with a static locale. Note that the OS locale
     * can be modified by setting/exporting the LC_ALL environment variable.
     */
    locale(locale: string): this;

    /**
     * The number of arguments that should be consumed after a key. This can be a useful hint to prevent parsing
     * ambiguity.
     */
    nargs(key: string, count: number): this;

    /**
     * The key provided represents a path and should have path.normalize() applied.
     */
    normalize(key: string): this;

    /**
     * Tell the parser to always interpret key as a number. If key is an array, all elements will be parsed as numbers.
     * If the option is given on the command line without a value, argv will be populated with undefined. If the value
     * given on the command line cannot be parsed as a number, argv will be populated with NaN. Note that decimals,
     * hexadecimals, and scientific notation are all accepted.
     */
    number(key: string): this;

    /**
     * Instead of chaining together .alias().demand().default().describe().string(), you can specify keys in opt for each
     * of the chainable methods.
     */
    option(key: string, options: Options): this;
    options(key: string, options: Options): this;
    option(options: Builder): this;
    options(options: Builder): this;

    /**
     * Similar to config(), indicates that yargs should interpret the object from the specified key in package.json as a
     * configuration object. cwd can optionally be provided, the package.json will be read from this location.
     */
    pkgConf(key: string, cwd?: string): this;

    /**
     * Specifies either a single option key (string), or an array of options that must be followed by option values. If
     * any option value is missing, show the usage information and exit. The default behavior is to set the value of any
     * key not followed by an option value to true.
     */
    requiresArg(key: string): this;

    /**
     * Reset the argument object built up so far. This is useful for creating nested command line interfaces. Use global
     * to specify keys that should not be reset.
     */
    reset(): this;

    /**
     * Generate a bash completion script. Users of your application can install this script in their .bashrc, and yargs
     * will provide completion shortcuts for commands and options.
     */
    showCompletionScript(): string;

    /**
     * Print the usage data using the console function consoleLevel for printing.
     */
    showHelp(consoleLevel?: string): this;

    /**
     * By default, yargs outputs a usage string if any error is detected. Use the .showHelpOnFail() method to customize
     * this behavior. If enable is false, the usage string is not output. If the message parameter is present, this
     * message is output after the error message.
     */
    showHelpOnFail(enable: boolean, message?: string): this;

    /**
     * Specifies either a single option key (string), or an array of options. If any of the options is present, yargs
     * validation is skipped.
     */
    skipValidation(key: string): this;

    /**
     * Any command-line argument given that is not demanded, or does not have a corresponding description, will be
     * reported as an error.
     */
    strict(): this;

    /**
     * Tell the parser logic not to interpret key as a number or boolean. This can be useful if you need to preserve
     * leading zeros in an input. If key is an array, interpret all the elements as strings. .string('_') will result in
     * non-hyphenated arguments being interpreted as strings, regardless of whether they resemble numbers.
     */
    string(key: string): this;

    updateLocale(obj: { [key: string]: string }): this;

    /**
     * Override the default strings used by yargs with the key/value pairs provided in obj
     */
    updateStrings(obj: { [key: string]: string }): this;

    /**
     * Set a usage message to show which commands to use. Inside message, the string $0 will get interpolated to the
     * current script name or node command for the present script similar to how $0 works in bash or perl. opts is
     * optional and acts like calling .options(opts).
     */
    usage(message: string, opts?: Options): this;

    /**
     * Add an option (e.g. --version) that displays the version number (given by the version parameter) and exits the
     * process. If no arguments are passed to version (.version()), yargs will parse the package.json of your module and
     * use its version value. The default value of option is --version. You can provide a function for version, rather
     * than a string. This is useful if you want to use a version stored in a location other than package.json.
     */
    version(version: string, option?: string, description?: string): this;
    version(version: () => string): this;

    /**
     * Format usage output to wrap at columns many columns. By default wrap will be set to Math.min(80, windowWidth).
     * Use .wrap(null) to specify no column limit (no right-align). Use .wrap(yargs.terminalWidth()) to maximize the
     * width of yargs’ usage instructions.
     */
    wrap(columns: number): this;
  }

  export interface Options {
    /** alias(es) for the canonical option key, see alias() */
    alias?: string | string[];
    /** interpret option as an array, see array() */
    array?: boolean;
    /** interpret option as a boolean flag, see boolean() */
    boolean?: boolean;
    /** limit valid option arguments to a predefined set, see choices() */
    choices?: (string | number)[];
    /** interpret option as a path to a JSON config file, see config() */
    config?: boolean;
    /** provide a custom config parsing function, see config() */
    configParser?: (configPath: string) => { [key: string]: any };
    /** interpret option as a count of boolean flags, see count() */
    count?: boolean;
    /** set a default value for the option, see default() */
    default?: any;
    /** use this description for the default value in help content, see default() */
    defaultDescription?: string;
    /** demand the option be given, with optional error message, see demand() */
    demand?: boolean | string;
    /** demand the option be given, with optional error message, see demand() */
    require?: boolean | string;
    /** demand the option be given, with optional error message, see demand() */
    required?: boolean | string;
    /** the option description for help content, see describe() */
    desc?: string;
    /** the option description for help content, see describe() */
    describe?: string;
    /** the option description for help content, see describe() */
    description?: string;
    /** when displaying usage instructions place the option under an alternative group heading, see group() */
    group?: string;
    /** apply path.normalize() to the option, see normalize() */
    normalize?: boolean;
    /** interpret option as a number, number() */
    number?: boolean;
    global?: boolean;
    /** specify how many arguments should be consumed for the option, see nargs() */
    nargs?: number;
    /** require the option be specified with a value, see requiresArg() */
    requiresArg?: boolean;
    /** skips validation if the option is present, see skipValidation() */
    skipValidation?: boolean;
    /** interpret option as a string, see string() */
    string?: boolean;
    type?: Type;
  }

  export type Type = 'array' | 'boolean' | 'count' | 'number' | 'string';

  export type SyncCompletionFunction = (current: string, argv: any) => string[];
  export type AsyncCompletionFunction = (current: string, argv: any, done: (completion: string[]) => void) => void;
}

declare var yargs: yargs.Yargs;

export = yargs;
