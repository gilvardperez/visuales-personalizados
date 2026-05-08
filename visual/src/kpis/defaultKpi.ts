import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, buildChartBlock, colorWithAlpha, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderDefaultKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "default");

    const hasComparison = data.comparison !== null && data.comparison !== undefined && data.comparison > 0;
    const progressRatio = hasComparison ? Math.max(0, data.progressRatio ?? 0) : null;
    const displayRatio = progressRatio !== null ? Math.min(progressRatio, 1) : null;
    const pctText = progressRatio !== null ? `${(progressRatio * 100).toFixed(settings.decimalPlaces)}% logro` : "";
    const subtitleText = hasComparison
        ? `Meta: ${data.comparisonText}${pctText ? ` (${pctText})` : ""}`
        : undefined;

    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: subtitleText,
        suppressComparisonSubtitle: !hasComparison
    });

    if (!hasComparison || displayRatio === null) {
        return;
    }

    // Flex-1 chart block with thin progress bar
    const chartBlock = buildChartBlock(card);
    chartBlock.style.justifyContent = "flex-end";

    const barColor = progressRatio > 1 ? (settings.successColor || theme.positive) : (settings.progressColor || theme.accent);

    const track = document.createElement("div");
    track.style.cssText = `width:100%;height:5px;background:${theme.border};border-radius:999px;overflow:hidden;`;
    const fill = document.createElement("div");
    fill.style.cssText = `width:${displayRatio * 100}%;height:100%;background:${barColor};border-radius:999px;`;
    track.appendChild(fill);
    chartBlock.appendChild(track);
}
