const COMMANDS = ["init", "ship", "search", "repos", "skills", "copilot", "feedback", "doctor", "uninstall", "completion"];

const BASH_SCRIPT = `
# solana-new bash completion
_solana_new() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="${COMMANDS.join(" ")}"
  COMPREPLY=( $(compgen -W "$commands --help --version --agent --no-color" -- "$cur") )
}
complete -o default -F _solana_new solana-new
`.trim();

const ZSH_SCRIPT = `
# solana-new zsh completion
_solana_new() {
  local -a commands
  commands=(
    'init:Install skills to Codex/Claude'
    'ship:Idea → Build → Launch guide'
    'search:Find repos, skills, MCPs'
    'repos:Browse / filter repos'
    'skills:Browse / filter skills'
    'copilot:Manage Copilot token + settings'
    'feedback:Send feedback to the team'
    'doctor:Check environment setup'
    'uninstall:Remove installed skills'
    'completion:Generate shell completions'
  )

  _arguments -C \\
    '1:command:->cmds' \\
    '*::arg:->args'

  case "$state" in
    cmds)
      _describe -t commands 'solana-new command' commands
      ;;
    args)
      case "\${words[1]}" in
        ship)
          _arguments '--yolo[Send prompt directly]' '--agent[Machine-readable output]'
          ;;
        repos|skills)
          _arguments '--search[Filter by keyword]:query:' '--agent[Machine-readable output]'
          ;;
        copilot)
          local -a subcmds
          subcmds=('start:Guided onboarding + idea analysis' 'token:Update Copilot token' 'show:Show current config')
          _describe -t subcommands 'copilot subcommand' subcmds
          ;;
        *)
          _arguments '--agent[Machine-readable output]'
          ;;
      esac
      ;;
  esac
}
compdef _solana_new solana-new
`.trim();

export function cmdCompletion(args: string[]): void {
  const shell = args.find((a) => a === "bash" || a === "zsh")
    || (process.env.SHELL?.includes("zsh") ? "zsh" : "bash");

  if (shell === "zsh") {
    console.log(ZSH_SCRIPT);
  } else {
    console.log(BASH_SCRIPT);
  }
}
