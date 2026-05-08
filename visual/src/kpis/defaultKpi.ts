import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, clearAndCreateCard, getViewport, renderNoData } from "./_shared";

export function renderDefaultKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const card = clearAndCreateCard(container, "default");
    appendTopSection(card, data, settings, viewport);
}
