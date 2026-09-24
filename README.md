# PlateAtlas

Create authentic, country-specific licence plate backgrounds for Tesla vehicle
visualizations.

The first release focuses on Croatia: choose one of the 34 registration areas,
enter a standard registration, preview the complete plate, and export a
420 × 100 PNG with the Croatian coat of arms baked into the image.

## Local development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
yarn typecheck
yarn build
```

## Asset sources

- Croatian coat of arms: Croatian Parliament representation distributed by
  Wikimedia Commons. The official insignia is not an object of copyright under
  Croatian law, but its use may be legally restricted.
- Registration area data: *Pravilnik o registraciji i označavanju vozila*,
  NN 130/2017.

PlateAtlas is an independent project and is not affiliated with or endorsed by
Tesla, Inc. It creates images for digital vehicle visualization only.
