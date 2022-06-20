{ project ? import ./. {}
}:
let
  common = import ./common.nix {};
  node = import ./node.nix {};
in with project.pkgs; [ nix kubectl kubectx k9s] ++ common ++ node
