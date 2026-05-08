# KPI Design Studio para Power BI

Proyecto de visual personalizado (`pbiviz`) con **8 variantes esenciales** en v0.5.0:

1. `default` — valor principal + delta + barra de progreso vs meta (fina, ancho completo).
2. `area` — valor + meta inline + área de tendencia sin gradiente + línea punteada = meta.
3. `bars` — valor + meta inline + barras mensuales (fondo gris = target avg, relleno = actual).
4. `progress` — valor + barra gruesa (28px) con marcador de meta + escala.
5. `bullet` — bullet chart Stephen Few, ancho completo, escala debajo.
6. `donut` — anillo grueso, % logro y valor real al centro, "vs Meta" debajo.
7. `gauge` — semicírculo real, aguja triangular, arco coloreado 3 zonas, % dentro del arco.
8. `comparison` — dos barras horizontales gruesas (Actual / Meta) con valores dentro.

## Novedades v0.5.0

- **Cero espacio vacío vertical**: el chart usa `flex: 1` para llenar todo lo disponible.
- **Comparativo vs objetivo siempre visible** en todas las variantes (valor absoluto + %).
- **Sin gradientes**: área y barras usan color sólido con opacity (0.18 default).
- **Sin animaciones, sin sombras**.
- **Gauge rediseñado**: semicírculo horizontal, aguja triangular, 3 zonas de color correctas.
- **Donut rediseñado**: anillo grueso (22px) con % logro grande al centro + valor real.
- **Progress**: barra de 28px con marcador vertical de meta y escala numérica.
- **Comparison**: barras gruesas de 36px con label + valor DENTRO de la barra.
- **Bullet**: ancho completo con escala debajo y tres zonas de fondo (rojo/amarillo/verde).
- Padding compactado (12px) para maximizar el área del gráfico.

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
