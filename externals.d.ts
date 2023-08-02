declare module 'parse-gitignore' {
  function parse(gitignoreContent: string): {
    patterns: string[];
  };
  export = parse;
}
