with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [
    nodejs_24
  ];

  NIX_ENFORCE_PURITY = true;

  shellHook = '''';
}
