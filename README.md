# KPI Design Studio para Power BI

Proyecto de visual personalizado (`pbiviz`) con 17 variantes de KPI Cards:

1. `default` — valor principal + delta vs comparación.
2. `progress` — valor + barra de progreso vs objetivo.
3. `microchart` — valor + sparkline + meses + etiqueta de último valor.
4. `area` — valor + delta + área de tendencia.
5. `bars` — valor + mini barras mensuales con último resaltado.
6. `barsLine` — barras de fondo + línea combinada.
7. `bullet` — bullet chart horizontal (actual vs target).
8. `donut` — anillo de cumplimiento con porcentaje central.
9. `lollipop` — mini lollipop chart mensual.
10. `dual` — dos sub-KPIs lado a lado.
11. `callout` — card con borde lateral y delta destacado.
12. `stackedCompare` — barras apiladas comparando dos series.
13. `gauge` — semicirculo tipo velocímetro con aguja y umbrales.
14. `waterfall` — mini cascada mensual (positivo/negativo).
15. `heatStrip` — tira de 12 celdas por intensidad de valor.
16. `comparison` — barras horizontales Actual vs Target con diferencia.
17. `radial` — anillo radial de cumplimiento estilo fitness.

## Novedades v0.3.0

- Tema global `light` / `dark` / `auto`.
- Cards nuevas de formato: **Theme**, **Card Style**, **Delta Style**, **Animation**.
- `cardStyle`: `flat`, `bordered`, `accent-left`.
- `deltaBadgeStyle`: `text`, `badge`, `pill` (default `badge`).
- `useGradient` en mini charts y nuevas variantes.
- Animaciones de entrada opcionales (`enableAnimation`, `animationDuration`).
- Sin sombras (`box-shadow`, `drop-shadow`, `text-shadow`) para mantener estilo flat.

## Estructura del repositorio

- `visual/`: proyecto del custom visual (TypeScript + D3).
- `sample-pbip/`: ejemplo PBIP con modelo y reporte de muestra.

## Requisitos previos

- Node.js 18+
- Instalar CLI de visuales:

```bash
npm i -g powerbi-visuals-tools@latest
```

- Instalar certificado de desarrollo:

```bash
pbiviz --install-cert
```

## Build

```bash
cd visual
npm install
pbiviz package
```

El comando genera el archivo `.pbiviz` en `visual/dist/`.

## Instalación en Power BI Desktop

1. Abrir Power BI Desktop.
2. Ir a **Archivo → Importar → Visual personalizado de un archivo**.
3. Seleccionar el `.pbiviz` generado en `visual/dist/`.

## Uso del sample PBIP

1. Abrir `sample-pbip/Sample.pbip` con Power BI Desktop (Sept 2023+).
2. Verificar que el modelo `Sales` y la página de ejemplo se carguen.
3. Si tu versión de Desktop requiere ajuste manual del reporte PBIR, importa el `.pbiviz` y vincula los campos:
   - `value`: Total Actual
   - `comparison`: Total Previous o Total Target
   - `trend`: Date
   - `trendValues`: Actual
   - `trendComparison` (opcional): serie comparativa para `stackedCompare`.

## Modo desarrollo

```bash
cd visual
pbiviz start
```

Luego habilita **Developer visual** en Power BI Service/Desktop según tu flujo de desarrollo.

## Mini guía visual rápida

- 🟥 **Cards ejecutivas**: `default`, `callout`, `dual`, `comparison`
- 📈 **Tendencia**: `microchart`, `area`, `barsLine`, `lollipop`, `waterfall`, `heatStrip`
- 📊 **Comparativo**: `bars`, `stackedCompare`, `bullet`, `gauge`
- 🍩 **Cumplimiento**: `progress`, `donut`, `radial`
