# KPI Design Studio para Power BI

Proyecto de visual personalizado (`pbiviz`) con 12 variantes de KPI Cards:

1. `default` — valor principal + delta vs comparación.
2. `progress` — valor + barra de progreso vs objetivo.
3. `microchart` — valor + sparkline + meses + etiqueta de último valor.
4. `area` — valor + delta + área sombreada de tendencia.
5. `bars` — valor + mini barras mensuales con último resaltado.
6. `barsLine` — barras de fondo + línea combinada.
7. `bullet` — bullet chart horizontal (actual vs target).
8. `donut` — anillo de cumplimiento con porcentaje central.
9. `lollipop` — mini lollipop chart mensual.
10. `dual` — dos sub-KPIs lado a lado.
11. `callout` — card con borde lateral y delta tipo badge.
12. `stackedCompare` — barras apiladas comparando dos series.

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

- 🟥 **Cards ejecutivas**: `default`, `callout`, `dual`
- 📈 **Tendencia**: `microchart`, `area`, `barsLine`, `lollipop`
- 📊 **Comparativo**: `bars`, `stackedCompare`, `bullet`
- 🍩 **Cumplimiento**: `progress`, `donut`
