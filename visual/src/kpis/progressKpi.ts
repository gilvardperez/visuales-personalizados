import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, buildChartBlock, clamp, formatValue, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderProgressKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "progress");

    const hasTarget = data.comparison !== null && data.comparison !== undefined && data.comparison > 0;
    const ratio = Math.max(0, data.progressRatio ?? 0);
    const displayRatio = Math.min(ratio, 1);
    const targetText = data.comparisonText ?? "Sin meta";

    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: hasTarget ? `vs Meta ${targetText}` : undefined,
        suppressComparisonSubtitle: !hasTarget
    });

    const chartBlock = buildChartBlock(card);
    chartBlock.style.justifyContent = "center";

    if (!hasTarget) {
        return;
    }

    // Thick progress bar container
    const progressWrap = document.createElement("div");
    progressWrap.style.cssText = "width:100%;position:relative;";

    const track = document.createElement("div");
    track.className = "kpi-progress-track";

    const accentColor = ratio > 1
        ? (settings.successColor || theme.positive)
        : (settings.progressColor || theme.accent);

    const fill = document.createElement("div");
    fill.className = "kpi-progress-fill";
    fill.style.width = `${displayRatio * 100}%`;
    fill.style.backgroundColor = accentColor;

    track.appendChild(fill);

    // Target marker line at 100% completion position (where meta falls)
    // The target is at 100% of the progress bar = 100% of bar
    // But if ratio > 1 we want to show a marker at 1/ratio position
    const markerRatio = ratio > 1 ? (1 / ratio) : 1;
    const markerLine = document.createElement("div");
    markerLine.style.cssText = `
        position:absolute;
        top:-3px;
        bottom:-3px;
        left:${markerRatio * 100}%;
        width:2px;
        background:${settings.targetLineColor};
        border-radius:1px;
        transform:translateX(-1px);
    `;
    progressWrap.appendChild(track);
    progressWrap.appendChild(markerLine);
    chartBlock.appendChild(progressWrap);

    // Scale row: 0, Meta X, max
    const maxVal = Math.max(data.value, data.comparison ?? data.value);
    const scale = document.createElement("div");
    scale.className = "kpi-progress-scale";

    const s0 = document.createElement("span");
    s0.textContent = "0";
    scale.appendChild(s0);

    const sMeta = document.createElement("span");
    sMeta.textContent = `Meta ${targetText}`;
    scale.appendChild(sMeta);

    const sMax = document.createElement("span");
    sMax.textContent = formatValue(maxVal, settings);
    scale.appendChild(sMax);

    chartBlock.appendChild(scale);

    // Percentage text
    const pctEl = document.createElement("div");
    pctEl.className = "kpi-progress-text";
    const pctLabel = ratio > 1 ? `✓ ${(ratio * 100).toFixed(settings.decimalPlaces)}% logro` : `${(ratio * 100).toFixed(settings.decimalPlaces)}% logro`;
    pctEl.textContent = pctLabel;
    pctEl.style.color = ratio > 1 ? theme.positive : theme.textSecondary;
    chartBlock.appendChild(pctEl);
}

