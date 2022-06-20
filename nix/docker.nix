let
  pkgs = import ./. {};
  dev = import ./dev.nix {};
  common = import ./common.nix {};
  node = import ./node.nix {};
  scala = import ./scala.nix {};

in rec {

  commonTools = pkgs.dockerTools.buildLayeredImage {
    name = "common-tools";
    contents = with pkgs; [ curl git jq ];
  };

  buildTools = pkgs.dockerTools.buildLayeredImage {
    name = "build-tools";
    contents = with pkgs; [ gcc cmake ];
  };

  deployTools = pkgs.dockerTools.buildLayeredImage {
    name = "deploy-tools";
    contents = with pkgs; [ kubectl argocd kubectx pwgen ripgrep skopeo ];
  };

  pythonImage = pkgs.dockerTools.buildLayeredImage {
    name = "python";
    contents = [ pkgs.python3 ];
  };

  pulumiImage = pkgs.dockerTools.buildLayeredImage {
    name = "pulumi";
    contents = [ pkgs.pulumi-bin ];
  };

  kustomizeImage = pkgs.dockerTools.buildLayeredImage {
    name = "kustomize";
    contents = [ pkgs.kustomize ];
  };

  nodeImage = pkgs.dockerTools.buildLayeredImage {
    name = "node";
    contents = [ pkgs.nodejs-16_x pkgs.yarn ];
  };

  scalaImage = pkgs.dockerTools.buildLayeredImage {
    name = "scala";
    contents = [ pkgs.jdk11 pkgs.sbt ];
  };

  nodeBuilder = pkgs.dockerTools.mergeImages [
    commonTools
    buildTools
    deployTools
    pythonImage
    nodeImage
    kustomizeImage
    pulumiImage
  ];

  scalaBuilder = pkgs.dockerTools.mergeImages [
    commonTools
    buildTools
    deployTools
    pythonImage
    scalaImage
  ];

  devBuilder = pkgs.dockerTools.buildLayeredImage {
    name = "dev-builder";
    tag = "latest";
    fromImage = nodeBuilder;
    created = "now";
    maxLayers = 200;
    extraCommands = ''
        mkdir -p tmp
      '';
    contents = with pkgs; [ nodejs-16_x yarn kustomize pulumi-bin
                            python3 gcc cmake curl git jdk11 sbt
			    kubectl pwgen ripgrep argocd skopeo
			    kubectx postgresql flyway k9s nix];
    config = {
      Env = [
        "NIX_PAGER=cat"
        "USER=nobody"
      ];
    };
  };

}
