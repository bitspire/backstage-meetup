{ sources ? import ./sources.nix,
  jdk ? "jdk11"
}:
let
    config = import ./config.nix { inherit jdk; };
in import sources.nixpkgs { inherit config; }
