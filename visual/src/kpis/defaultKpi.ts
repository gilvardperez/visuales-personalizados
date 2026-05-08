import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, getViewport, renderNoData, resolveTheme, applyCardContainer } from "./_shared";

export function renderDefaultKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "default");
    appendTopSection(card, data, settings, viewport, false, theme);
}
