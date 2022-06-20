{ project ? import ./. {}
}:

with project.pkgs; [
      curl
      git
      pwgen
      jq
      ripgrep
  ]
