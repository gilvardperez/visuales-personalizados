# KPI Design Studio para Power BI

Proyecto de visual personalizado (`pbiviz`) con 3 diseños iniciales de KPI Cards:

- `default`: valor principal + delta vs comparación.
- `progress`: valor + barra de progreso vs objetivo.
- `microchart`: valor + sparkline (línea) con serie temporal.

## ⬇️ Descargar el visual (forma fácil)

1. Ve a la pestaña **[Releases](https://github.com/gilvardperez/Visuales-Personalizados/releases)** del repositorio.
2. Descarga el archivo `kpiDesignStudio.X.X.X.pbiviz` de la release más reciente (o la `latest`).
3. Abre **Power BI Desktop** → panel **Visualizaciones** (lado derecho) → clic en los **tres puntos `…`** → **"Importar un objeto visual desde un archivo"** → selecciona el `.pbiviz` descargado.
4. ✅ El visual aparece en tu panel de visualizaciones, listo para arrastrar al lienzo.

> No necesitas instalar Node.js ni nada. GitHub Actions compila el visual automáticamente en cada cambio.

## Estructura del repositorio

- `visual/`: proyecto del custom visual (TypeScript + D3).
- `sample-pbip/`: ejemplo PBIP con modelo y reporte de muestra.

## 🛠️ Build manual (solo para contribuidores)

- Node.js 18+
- Instalar CLI de visuales:

```bash
npm i -g powerbi-visuals-tools@latest
```

- Instalar certificado de desarrollo:

```bash
pbiviz --install-cert
```

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

## Modo desarrollo

```bash
cd visual
pbiviz start
```

Luego habilita **Developer visual** en Power BI Service/Desktop según tu flujo de desarrollo.

## Roadmap

- [x] default
- [x] progress
- [x] microchart
- [ ] accent (TODO)
- [ ] trail (TODO)
- [ ] scorecard (TODO)
- [ ] gauge (TODO)
- [ ] breakdown (TODO)
- [ ] range (TODO)
- [ ] multi (TODO)
