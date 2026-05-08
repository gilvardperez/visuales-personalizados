import { KpiRenderData } from "./types";
import { VisualSettings } from "../settings";
import { appendTopSection, applyCardContainer, getViewport, renderNoData, resolveTheme } from "./_shared";

export function renderCalloutKpi(container: HTMLElement, data: KpiRenderData, settings: VisualSettings): void {
    if (!data) {
        renderNoData(container);
        return;
    }

    const viewport = getViewport(container);
    const theme = resolveTheme(settings, viewport);
    const card = applyCardContainer(container, settings, theme, "callout");
    card.style.setProperty("--kpi-accent-left", data.isDeltaPositive ? theme.positive : theme.negative);
    appendTopSection(card, data, settings, viewport, false, theme);
}
