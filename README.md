# KPI Design Studio para Power BI

Proyecto de visual personalizado (`pbiviz`) con **8 variantes esenciales** en v0.4.0:

1. `default` — valor principal + delta + valor de comparación.
2. `area` — valor + delta + área de tendencia.
3. `bars` — valor + mini barras mensuales con última destacada.
4. `progress` — valor + progreso horizontal vs meta.
5. `bullet` — bullet chart horizontal (actual vs target).
6. `donut` — anillo de cumplimiento con fallback cuando no hay meta.
7. `gauge` — semicirculo tipo velocímetro con aguja y umbrales.
8. `comparison` — barras horizontales Actual vs Meta con diferencia.

## Novedades v0.4.0

- Catálogo curado de 17 a 8 variantes.
- Layout compacto: menos espacios vacíos y mini-chart más protagonista.
- Render instantáneo (sin animaciones).
- Nuevo subtitle de comparación configurable: `vs {valor} {sufijo}`.
- Fixes críticos en `donut`, `bullet` y etiquetas de último valor.
- Se mantiene estilo flat sin sombras.

## Estructura del repositorio

- `visual/`: proyecto del custom visual (TypeScript + D3).
- `sample-pbip/`: ejemplo PBIP con modelo y reporte de muestra.

## Requisitos previos

- Node.js 18+

```bash
npm i -g powerbi-visuals-tools@latest
```

```bash
pbiviz --install-cert
```

## Build

```bash
cd visual
npm install
npm run lint
npm run package
```

El comando genera el archivo `.pbiviz` en `visual/dist/`.

## Instalación en Power BI Desktop

1. Abrir Power BI Desktop.
2. Ir a **Archivo → Importar → Visual personalizado de un archivo**.
3. Seleccionar el `.pbiviz` generado en `visual/dist/`.

## Uso del sample PBIP

1. Abrir `sample-pbip/Sample.pbip` con Power BI Desktop (Sept 2023+).
2. Importar el `.pbiviz` y vincular:
   - `value`: Total Actual
   - `comparison`: Total Previous o Total Target
   - `trend`: Date
   - `trendValues`: Actual

## Modo desarrollo

```bash
cd visual
pbiviz start
```
