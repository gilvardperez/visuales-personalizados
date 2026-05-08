import * as d3 from "d3";
import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderBulletKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "bullet");
    appendTopSection(card, data, settings, viewport, theme, {
        subtitleOverride: `Meta: ${data.comparisonText ?? "estimada"}`,
        suppressComparisonSubtitle: true
    });

    const target = data.comparison && data.comparison > 0 ? data.comparison : Math.max(1, data.value * 1.5);
    const maxScale = Math.max(1, data.value, target) * 1.2;
    const valueRatio = Math.max(0, Math.min(1, data.value / maxScale));
    const targetRatio = Math.max(0, Math.min(1, target / maxScale));

    const host = document.createElement("div");
    host.className = "kpi-chart-host";
    card.appendChild(host);

    const width = Math.max(160, viewport.width - 32);
    const height = Math.max(44, Math.floor(viewport.height * 0.22));

    const svg = d3.select(host)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    const y = Math.floor(height / 2) - 8;
    const trackHeight = 16;
    const valueHeight = 10;

    const zones = [
        { from: 0, to: 0.4, color: settings.bulletBadColor },
        { from: 0.4, to: 0.75, color: settings.bulletMidColor },
        { from: 0.75, to: 1, color: settings.bulletGoodColor }
    ];

    zones.forEach((zone) => {
        svg.append("rect")
            .attr("x", zone.from * width)
            .attr("y", y)
            .attr("width", Math.max(1, (zone.to - zone.from) * width))
            .attr("height", trackHeight)
            .attr("fill", zone.color);
    });

    svg.append("rect")
        .attr("x", 0)
        .attr("y", y + (trackHeight - valueHeight) / 2)
        .attr("width", Math.max(1, valueRatio * width))
        .attr("height", valueHeight)
        .attr("rx", 3)
        .attr("fill", settings.progressColor || theme.accent);

    svg.append("line")
        .attr("x1", targetRatio * width)
        .attr("x2", targetRatio * width)
        .attr("y1", y - 4)
        .attr("y2", y + trackHeight + 4)
        .attr("stroke", settings.targetLineColor)
        .attr("stroke-width", 2);
}
