import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, clearAndCreateCard, getViewport, renderNoData } from "./_shared";

export function renderBulletKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "bullet");
    appendTopSection(card, data, settings, viewport);

    const ratio = Math.max(0, data.progressRatio ?? 0);
    const clampedRatio = Math.min(1.4, ratio);

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
    actual.style.width = `${Math.min(100, clampedRatio * 100)}%`;
    actual.style.backgroundColor = settings.progressColor;

    const target = document.createElement("div");
    target.className = "kpi-bullet-target";
    target.style.left = `${Math.min(100, (data.comparison && data.comparison !== 0 ? 1 : clampedRatio) * 100)}%`;
    target.style.backgroundColor = settings.targetLineColor;

    chart.appendChild(bad);
    chart.appendChild(mid);
    chart.appendChild(good);
    chart.appendChild(actual);
    chart.appendChild(target);

    card.appendChild(chart);
}
