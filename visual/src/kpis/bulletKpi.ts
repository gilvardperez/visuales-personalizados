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
    appendTopSection(card, data, settings, viewport, false, theme);

    const targetValue = data.comparison && data.comparison > 0 ? data.comparison : data.value;
    const maxScale = Math.max(1, data.value, targetValue);
    const actualPercent = (Math.max(0, data.value) / maxScale) * 100;
    const targetPercent = (Math.max(0, targetValue) / maxScale) * 100;

    const chart = document.createElement("div");
    chart.className = "kpi-bullet";

    const bad = document.createElement("div");
    bad.className = "kpi-bullet-band";
    bad.style.width = "40%";
    bad.style.backgroundColor = settings.bulletBadColor;

    const mid = document.createElement("div");
    mid.className = "kpi-bullet-band";
    mid.style.width = "30%";
    mid.style.backgroundColor = settings.bulletMidColor;

    const good = document.createElement("div");
    good.className = "kpi-bullet-band";
    good.style.width = "30%";
    good.style.backgroundColor = settings.bulletGoodColor;

    const actual = document.createElement("div");
    actual.className = "kpi-bullet-actual";
    actual.style.width = `${Math.min(100, actualPercent)}%`;
    actual.style.backgroundColor = theme.accent;

    const target = document.createElement("div");
    target.className = "kpi-bullet-target";
    target.style.left = `${Math.min(100, targetPercent)}%`;
    target.style.backgroundColor = settings.targetLineColor;

    chart.appendChild(bad);
    chart.appendChild(mid);
    chart.appendChild(good);
    chart.appendChild(actual);
    chart.appendChild(target);

    card.appendChild(chart);
}
