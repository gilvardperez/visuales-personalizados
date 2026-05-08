import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, clearAndCreateCard, getViewport, renderNoData } from "./_shared";

export function renderCalloutKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "callout");
    card.style.borderLeftColor = data.isDeltaPositive ? settings.positiveColor : settings.negativeColor;

    const section = appendTopSection(card, data, settings, viewport);
    section.delta.classList.add("kpi-callout-badge");
}
