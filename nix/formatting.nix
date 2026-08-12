{ inputs, ... }:
{
  imports = [ inputs.treefmt-nix.flakeModule ];

  # Nix only: enabling a JS formatter here would reformat the whole repo.
  perSystem = _: {
    treefmt = {
      projectRootFile = "flake.nix";
      programs.nixpkgs-fmt.enable = true;
    };
  };
}
