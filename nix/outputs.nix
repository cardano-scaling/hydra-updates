{
  perSystem = { config, lib, pkgs, ... }:
    let
      nodejs = pkgs.nodejs_22;

      package = lib.importJSON ../package.json;

      # Excluded so a local dev tree can't ride along into the store; a stale
      # .next in particular poisons the build.
      src = lib.cleanSourceWith {
        src = ../.;
        filter = path: _type: !builtins.elem (baseNameOf path) [
          "node_modules"
          ".next"
          "out"
          "result"
          ".direnv"
        ];
      };

      # basePath is the GitHub Pages subpath (ADR-11); empty for a local preview.
      mkSite = { basePath ? "" }: pkgs.buildNpmPackage {
        pname = package.name;
        inherit (package) version;
        inherit nodejs src;

        npmDeps = pkgs.importNpmLock { npmRoot = src; };
        npmConfigHook = pkgs.importNpmLock.npmConfigHook;

        env = {
          NEXT_PUBLIC_BASE_PATH = basePath;
          NEXT_TELEMETRY_DISABLED = "1";
        };

        # `next/font/google` in app/layout.tsx downloads the font CSS and woff2
        # files during `next build`, and a failed fetch aborts a production
        # build. So this needs a relaxed sandbox:
        #
        #   nix build --option sandbox relaxed .#
        #
        # Dropping this line requires vendoring the fonts via `next/font/local`.
        __noChroot = true;

        # The default installPhase runs `npm pack`; we want the static export.
        installPhase = ''
          runHook preInstall
          mkdir -p $out
          cp -r out/. $out
          runHook postInstall
        '';
      };
    in
    {
      packages.default = mkSite { };
      packages.pages = mkSite { basePath = "/hydra-updates"; };

      devShells.default = pkgs.mkShell {
        name = "hydra-updates";
        inputsFrom = [ config.treefmt.build.devShell ];
        nativeBuildInputs = [
          nodejs
          pkgs.gh # scripts/gather.ts wants GITHUB_TOKEN=$(gh auth token)
        ];
      };
    };
}
