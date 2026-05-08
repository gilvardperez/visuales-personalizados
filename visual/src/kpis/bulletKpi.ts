import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import {
    appendTopSectionInline,
    applyCardContainer,
    buildChartBlock,
    clamp,
    formatValue,
    getViewport,
    renderNoData,
    resolveTheme
} from "./_shared";

export function renderBulletKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "bullet");

    const suffix = settings.comparisonSuffix.trim();
    const metaLabel = data.comparison !== null && data.comparisonText
        ? `Meta: ${data.comparisonText}${suffix ? ` ${suffix}` : ""}`
        : "";

    appendTopSectionInline(card, data, settings, viewport, theme, metaLabel);

    const target = data.comparison && data.comparison > 0 ? data.comparison : Math.max(1, data.value * 1.5);
    const domainMax = Math.max(data.value, target) * 1.2;
    const valueRatio = clamp(data.value / domainMax, 0, 1);
    const targetRatio = clamp(target / domainMax, 0, 1);

    const chartBlock = buildChartBlock(card);
    chartBlock.style.justifyContent = "center";

    const bulletH = 28;
    const svgH = bulletH + 18; // room for scale below
    const width = Math.max(80, viewport.width - 28);

    const svg = d3.select(chartBlock)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${svgH}`)
        .attr("width", "100%")
        .attr("height", svgH);

    // Three background zones: red / yellow / green
    const zones = [
        { from: 0, to: 0.4, color: settings.bulletBadColor },
        { from: 0.4, to: 0.75, color: settings.bulletMidColor },
        { from: 0.75, to: 1, color: settings.bulletGoodColor }
    ];

    zones.forEach((zone) => {
        svg.append("rect")
            .attr("x", zone.from * width)
            .attr("y", 0)
            .attr("width", Math.max(1, (zone.to - zone.from) * width))
            .attr("height", bulletH)
            .attr("fill", zone.color);
    });

    // Value bar (narrower, centered vertically)
    const valueBarH = Math.floor(bulletH * 0.45);
    const valueBarY = (bulletH - valueBarH) / 2;
    svg.append("rect")
        .attr("x", 0)
        .attr("y", valueBarY)
        .attr("width", Math.max(1, valueRatio * width))
        .attr("height", valueBarH)
        .attr("rx", 2)
        .attr("fill", settings.progressColor || theme.accent);

    // Target marker
    svg.append("line")
        .attr("x1", targetRatio * width)
        .attr("x2", targetRatio * width)
        .attr("y1", -3)
        .attr("y2", bulletH + 3)
        .attr("stroke", settings.targetLineColor)
        .attr("stroke-width", 2);

    // Scale labels below
    const labelY = svgH - 2;
    svg.append("text")
        .attr("x", 0).attr("y", labelY)
        .attr("text-anchor", "start")
        .attr("font-size", 9).attr("fill", theme.textSecondary).attr("font-weight", 600)
        .text("0");

    const midVal = domainMax * 0.5;
    svg.append("text")
        .attr("x", width * 0.5).attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("font-size", 9).attr("fill", theme.textSecondary).attr("font-weight", 600)
        .text(formatValue(midVal, settings));

    svg.append("text")
        .attr("x", targetRatio * width).attr("y", labelY)
        .attr("text-anchor", targetRatio > 0.85 ? "end" : "middle")
        .attr("font-size", 9).attr("fill", theme.textSecondary).attr("font-weight", 600)
        .text(`Meta ${data.comparisonText ?? formatValue(target, settings)}`);
}

