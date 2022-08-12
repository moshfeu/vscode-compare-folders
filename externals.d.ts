declare module 'parse-gitignore' {
  function parse(gitignoreContent: string): string[];
  export = parse;
}