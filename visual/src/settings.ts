"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

export type KpiVariant =
    | "default"
    | "area"
    | "bars"
    | "progress"
    | "bullet"
    | "donut"
    | "gauge"
    | "comparison";

export type LabelPosition = "top" | "bottom";
export type DisplayUnits = "auto" | "thousands" | "millions" | "billions";
export type ThemeMode = "light" | "dark" | "auto";
export type CardStyleMode = "flat" | "bordered" | "accent-left";
export type DeltaBadgeStyle = "text" | "badge" | "pill";

export interface VisualSettings {
    kpiVariant: KpiVariant;
    labelPosition: LabelPosition;
    valueColor: string;
    positiveColor: string;
    negativeColor: string;
    progressColor: string;
    successColor: string;
    valueFontSize: number;
    labelFontSize: number;
    displayUnits: DisplayUnits;
    decimalPlaces: number;
    showLastValueLabel: boolean;
    highlightLastPoint: boolean;
    highlightColor: string;
    chartHeight: number;
    barColor: string;
    lineColor: string;
    areaFillOpacity: number;
    showTitle: boolean;
    titleText: string;
    titleFontSize: number;
    deltaSuffix: string;
    comparisonSuffix: string;
    showComparisonValue: boolean;
    targetLineColor: string;
    bulletGoodColor: string;
    bulletMidColor: string;
    bulletBadColor: string;
    donutThickness: number;
    theme: ThemeMode;
    transparentBackground: boolean;
    cardStyle: CardStyleMode;
    cornerRadius: number;
    accentColor: string;
    borderColor: string;
    deltaBadgeStyle: DeltaBadgeStyle;
    deltaShowArrow: boolean;
    gaugeMinValue: number;
    gaugeMaxValue: number;
    gaugeRedThreshold: number;
    gaugeYellowThreshold: number;
}
const kpiVariants: powerbi.IEnumMember[] = [
    { value: "default", displayName: "Default" },
    { value: "area", displayName: "Area" },
    { value: "bars", displayName: "Bars" },
    { value: "progress", displayName: "Progress Bar" },
    { value: "bullet", displayName: "Bullet" },
    { value: "donut", displayName: "Donut" },
    { value: "gauge", displayName: "Gauge" },
    { value: "comparison", displayName: "Comparison" }
];
const allowedKpiVariants = new Set<KpiVariant>(kpiVariants.map((item) => item.value as KpiVariant));

const labelPositions: powerbi.IEnumMember[] = [
    { value: "top", displayName: "top" },
    { value: "bottom", displayName: "bottom" }
];

const displayUnits: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "auto" },
    { value: "thousands", displayName: "thousands" },
    { value: "millions", displayName: "millions" },
    { value: "billions", displayName: "billions" }
];

const themes: powerbi.IEnumMember[] = [
    { value: "light", displayName: "light" },
    { value: "dark", displayName: "dark" },
    { value: "auto", displayName: "auto" }
];

const cardStyles: powerbi.IEnumMember[] = [
    { value: "flat", displayName: "flat" },
    { value: "bordered", displayName: "bordered" },
    { value: "accent-left", displayName: "accent-left" }
];

const deltaBadgeStyles: powerbi.IEnumMember[] = [
    { value: "text", displayName: "text" },
    { value: "badge", displayName: "badge" },
    { value: "pill", displayName: "pill" }
];

class KpiStyleCardSettings extends FormattingSettingsCard {
    kpiVariant = new formattingSettings.ItemDropdown({
        name: "kpiVariant",
        displayName: "kpiVariant",
        items: kpiVariants,
        value: kpiVariants[0]
    });

    labelPosition = new formattingSettings.ItemDropdown({
        name: "labelPosition",
        displayName: "labelPosition",
        items: labelPositions,
        value: labelPositions[0]
    });

    name: string = "kpiStyle";
    displayName: string = "KPI Style";
    slices: Array<FormattingSettingsSlice> = [this.kpiVariant, this.labelPosition];
}

class ColorsCardSettings extends FormattingSettingsCard {
    valueColor = new formattingSettings.ColorPicker({
        name: "valueColor",
        displayName: "valueColor",
        value: { value: "#111827" }
    });

    positiveColor = new formattingSettings.ColorPicker({
        name: "positiveColor",
        displayName: "positiveColor",
        value: { value: "#10B981" }
    });

    negativeColor = new formattingSettings.ColorPicker({
        name: "negativeColor",
        displayName: "negativeColor",
        value: { value: "#EF4444" }
    });

    progressColor = new formattingSettings.ColorPicker({
        name: "progressColor",
        displayName: "progressColor",
        value: { value: "#2563EB" }
    });

    successColor = new formattingSettings.ColorPicker({
        name: "successColor",
        displayName: "successColor",
        value: { value: "#10B981" }
    });

    name: string = "colors";
    displayName: string = "Colors";
    slices: Array<FormattingSettingsSlice> = [
        this.valueColor,
        this.positiveColor,
        this.negativeColor,
        this.progressColor,
        this.successColor
    ];
}

class TextCardSettings extends FormattingSettingsCard {
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize",
        displayName: "valueFontSize",
        value: 34
    });

    labelFontSize = new formattingSettings.NumUpDown({
        name: "labelFontSize",
        displayName: "labelFontSize",
        value: 12
    });

    displayUnits = new formattingSettings.ItemDropdown({
        name: "displayUnits",
        displayName: "displayUnits",
        items: displayUnits,
        value: displayUnits[0]
    });

    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "decimalPlaces",
        value: 1,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 4 }
        }
    });

    name: string = "text";
    displayName: string = "Text";
    slices: Array<FormattingSettingsSlice> = [
        this.valueFontSize,
        this.labelFontSize,
        this.displayUnits,
        this.decimalPlaces
    ];
}

class MiniChartCardSettings extends FormattingSettingsCard {
    showLastValueLabel = new formattingSettings.ToggleSwitch({
        name: "showLastValueLabel",
        displayName: "showLastValueLabel",
        value: true
    });

    highlightLastPoint = new formattingSettings.ToggleSwitch({
        name: "highlightLastPoint",
        displayName: "highlightLastPoint",
        value: true
    });

    highlightColor = new formattingSettings.ColorPicker({
        name: "highlightColor",
        displayName: "highlightColor",
        value: { value: "#2563EB" }
    });

    chartHeight = new formattingSettings.NumUpDown({
        name: "chartHeight",
        displayName: "chartHeight",
        value: 60,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 20 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 200 }
        }
    });

    barColor = new formattingSettings.ColorPicker({
        name: "barColor",
        displayName: "barColor",
        value: { value: "#2563EB" }
    });

    lineColor = new formattingSettings.ColorPicker({
        name: "lineColor",
        displayName: "lineColor",
        value: { value: "#2563EB" }
    });

    areaFillOpacity = new formattingSettings.NumUpDown({
        name: "areaFillOpacity",
        displayName: "areaFillOpacity",
        value: 0.2,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 1 }
        }
    });

    useGradient = new formattingSettings.ToggleSwitch({
        name: "useGradient",
        displayName: "useGradient",
        value: false
    });

    name: string = "miniChart";
    displayName: string = "Mini Chart";
    slices: Array<FormattingSettingsSlice> = [
        this.showLastValueLabel,
        this.highlightLastPoint,
        this.highlightColor,
        this.chartHeight,
        this.barColor,
        this.lineColor,
        this.areaFillOpacity
    ];
}

class TitleSubtitleCardSettings extends FormattingSettingsCard {
    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "showTitle",
        value: false
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "titleText",
        placeholder: "",
        value: ""
    });

    titleFontSize = new formattingSettings.NumUpDown({
        name: "titleFontSize",
        displayName: "titleFontSize",
        value: 14
    });

    deltaSuffix = new formattingSettings.TextInput({
        name: "deltaSuffix",
        displayName: "deltaSuffix",
        placeholder: "",
        value: "vs PY"
    });

    comparisonSuffix = new formattingSettings.TextInput({
        name: "comparisonSuffix",
        displayName: "comparisonSuffix",
        placeholder: "",
        value: "año anterior"
    });

    showComparisonValue = new formattingSettings.ToggleSwitch({
        name: "showComparisonValue",
        displayName: "showComparisonValue",
        value: true
    });

    name: string = "titleSubtitle";
    displayName: string = "Title & Subtitle";
    slices: Array<FormattingSettingsSlice> = [
        this.showTitle,
        this.titleText,
        this.titleFontSize,
        this.deltaSuffix,
        this.comparisonSuffix,
        this.showComparisonValue
    ];
}

class BulletDonutCardSettings extends FormattingSettingsCard {
    targetLineColor = new formattingSettings.ColorPicker({
        name: "targetLineColor",
        displayName: "targetLineColor",
        value: { value: "#111827" }
    });

    bulletGoodColor = new formattingSettings.ColorPicker({
        name: "bulletGoodColor",
        displayName: "bulletGoodColor",
        value: { value: "#D1FAE5" }
    });

    bulletMidColor = new formattingSettings.ColorPicker({
        name: "bulletMidColor",
        displayName: "bulletMidColor",
        value: { value: "#FEF3C7" }
    });

    bulletBadColor = new formattingSettings.ColorPicker({
        name: "bulletBadColor",
        displayName: "bulletBadColor",
        value: { value: "#FEE2E2" }
    });

    donutThickness = new formattingSettings.NumUpDown({
        name: "donutThickness",
        displayName: "donutThickness",
        value: 14,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 4 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 40 }
        }
    });

    gaugeMinValue = new formattingSettings.NumUpDown({
        name: "gaugeMinValue",
        displayName: "gaugeMinValue",
        value: 0
    });

    gaugeMaxValue = new formattingSettings.NumUpDown({
        name: "gaugeMaxValue",
        displayName: "gaugeMaxValue",
        value: 100
    });

    gaugeRedThreshold = new formattingSettings.NumUpDown({
        name: "gaugeRedThreshold",
        displayName: "gaugeRedThreshold",
        value: 50
    });

    gaugeYellowThreshold = new formattingSettings.NumUpDown({
        name: "gaugeYellowThreshold",
        displayName: "gaugeYellowThreshold",
        value: 80
    });

    name: string = "bulletDonut";
    displayName: string = "Bullet/Donut";
    slices: Array<FormattingSettingsSlice> = [
        this.targetLineColor,
        this.bulletGoodColor,
        this.bulletMidColor,
        this.bulletBadColor,
        this.donutThickness,
        this.gaugeMinValue,
        this.gaugeMaxValue,
        this.gaugeRedThreshold,
        this.gaugeYellowThreshold
    ];
}

class ThemeCardSettings extends FormattingSettingsCard {
    theme = new formattingSettings.ItemDropdown({
        name: "theme",
        displayName: "theme",
        items: themes,
        value: themes[0]
    });

    transparentBackground = new formattingSettings.ToggleSwitch({
        name: "transparentBackground",
        displayName: "transparentBackground",
        value: false
    });

    name: string = "theme";
    displayName: string = "Theme";
    slices: Array<FormattingSettingsSlice> = [this.theme, this.transparentBackground];
}

class CardStyleCardSettings extends FormattingSettingsCard {
    cardStyle = new formattingSettings.ItemDropdown({
        name: "cardStyle",
        displayName: "cardStyle",
        items: cardStyles,
        value: cardStyles[1]
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "cornerRadius",
        value: 12,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 32 }
        }
    });

    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor",
        displayName: "accentColor",
        value: { value: "#2563EB" }
    });

    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "borderColor",
        value: { value: "#E5E7EB" }
    });

    name: string = "cardStyle";
    displayName: string = "Card Style";
    slices: Array<FormattingSettingsSlice> = [this.cardStyle, this.cornerRadius, this.accentColor, this.borderColor];
}

class DeltaStyleCardSettings extends FormattingSettingsCard {
    deltaBadgeStyle = new formattingSettings.ItemDropdown({
        name: "deltaBadgeStyle",
        displayName: "deltaBadgeStyle",
        items: deltaBadgeStyles,
        value: deltaBadgeStyles[1]
    });

    deltaShowArrow = new formattingSettings.ToggleSwitch({
        name: "deltaShowArrow",
        displayName: "deltaShowArrow",
        value: true
    });

    name: string = "deltaStyle";
    displayName: string = "Delta Style";
    slices: Array<FormattingSettingsSlice> = [this.deltaBadgeStyle, this.deltaShowArrow];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    kpiStyleCard = new KpiStyleCardSettings();
    colorsCard = new ColorsCardSettings();
    textCard = new TextCardSettings();
    miniChartCard = new MiniChartCardSettings();
    titleSubtitleCard = new TitleSubtitleCardSettings();
    bulletDonutCard = new BulletDonutCardSettings();
    themeCard = new ThemeCardSettings();
    cardStyleCard = new CardStyleCardSettings();
    deltaStyleCard = new DeltaStyleCardSettings();

    cards = [
        this.kpiStyleCard,
        this.themeCard,
        this.cardStyleCard,
        this.deltaStyleCard,
        this.colorsCard,
        this.textCard,
        this.miniChartCard,
        this.titleSubtitleCard,
        this.bulletDonutCard
    ];
}

export function getVisualSettings(model: VisualFormattingSettingsModel): VisualSettings {
    const selectedVariant = model.kpiStyleCard.kpiVariant.value.value as KpiVariant;
    return {
        kpiVariant: allowedKpiVariants.has(selectedVariant) ? selectedVariant : "default",
        labelPosition: model.kpiStyleCard.labelPosition.value.value as LabelPosition,
        valueColor: model.colorsCard.valueColor.value.value,
        positiveColor: model.colorsCard.positiveColor.value.value,
        negativeColor: model.colorsCard.negativeColor.value.value,
        progressColor: model.colorsCard.progressColor.value.value,
        successColor: model.colorsCard.successColor.value.value,
        valueFontSize: Math.max(10, model.textCard.valueFontSize.value),
        labelFontSize: Math.max(10, model.textCard.labelFontSize.value),
        displayUnits: model.textCard.displayUnits.value.value as DisplayUnits,
        decimalPlaces: Math.max(0, Math.min(4, Math.round(model.textCard.decimalPlaces.value))),
        showLastValueLabel: model.miniChartCard.showLastValueLabel.value,
        highlightLastPoint: model.miniChartCard.highlightLastPoint.value,
        highlightColor: model.miniChartCard.highlightColor.value.value,
        chartHeight: Math.max(20, Math.min(200, model.miniChartCard.chartHeight.value)),
        barColor: model.miniChartCard.barColor.value.value,
        lineColor: model.miniChartCard.lineColor.value.value,
        areaFillOpacity: Math.max(0, Math.min(1, model.miniChartCard.areaFillOpacity.value)),
        showTitle: model.titleSubtitleCard.showTitle.value,
        titleText: model.titleSubtitleCard.titleText.value,
        titleFontSize: Math.max(8, model.titleSubtitleCard.titleFontSize.value),
        deltaSuffix: model.titleSubtitleCard.deltaSuffix.value,
        comparisonSuffix: model.titleSubtitleCard.comparisonSuffix.value,
        showComparisonValue: model.titleSubtitleCard.showComparisonValue.value,
        targetLineColor: model.bulletDonutCard.targetLineColor.value.value,
        bulletGoodColor: model.bulletDonutCard.bulletGoodColor.value.value,
        bulletMidColor: model.bulletDonutCard.bulletMidColor.value.value,
        bulletBadColor: model.bulletDonutCard.bulletBadColor.value.value,
        donutThickness: Math.max(4, Math.min(40, model.bulletDonutCard.donutThickness.value)),
        theme: model.themeCard.theme.value.value as ThemeMode,
        transparentBackground: model.themeCard.transparentBackground.value,
        cardStyle: model.cardStyleCard.cardStyle.value.value as CardStyleMode,
        cornerRadius: Math.max(0, Math.min(32, Math.round(model.cardStyleCard.cornerRadius.value))),
        accentColor: model.cardStyleCard.accentColor.value.value,
        borderColor: model.cardStyleCard.borderColor.value.value,
        deltaBadgeStyle: model.deltaStyleCard.deltaBadgeStyle.value.value as DeltaBadgeStyle,
        deltaShowArrow: model.deltaStyleCard.deltaShowArrow.value,
        gaugeMinValue: model.bulletDonutCard.gaugeMinValue.value,
        gaugeMaxValue: model.bulletDonutCard.gaugeMaxValue.value,
        gaugeRedThreshold: model.bulletDonutCard.gaugeRedThreshold.value,
        gaugeYellowThreshold: model.bulletDonutCard.gaugeYellowThreshold.value
    };
}
