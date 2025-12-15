export type Locale = "en" | "zh";

export type MessageKey =
  | "appTitle"
  | "appSubtitle"
  | "cecApprovedBattery"
  | "snapshot"
  | "clear"
  | "searchPlaceholder"
  | "noMatches"
  | "scrollToLoadMore"
  | "usable"
  | "unknown"
  | "select"
  | "systemParameters"
  | "installationDate"
  | "installationDateHint"
  | "usableCapacity"
  | "stcCapHint"
  | "advancedPrice"
  | "hideAdvanced"
  | "defaultPriceHint"
  | "stcPrice"
  | "activeRule"
  | "estimatedRebate"
  | "calculationBreakdown"
  | "rate"
  | "baseFactor"
  | "formula"
  | "trendTitle"
  | "trendSubtitle"
  | "trendBasedOn"
  | "trendTip"
  | "rulesSummary"
  | "rulesTitleFactors"
  | "rulesTitleTaper"
  | "period"
  | "factor"
  | "phase1Title"
  | "phase2Title"
  | "phase1Rule1"
  | "phase1Rule2"
  | "phase2Rule1"
  | "phase2Rule2"
  | "phase2Rule3"
  | "phase2Rule4"
  | "sources";

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    appTitle: "Cheaper Home Batteries rebate calculator",
    appSubtitle: "Based on DCCEEW proposed schedule (2025–2030)",
    cecApprovedBattery: "CEC approved battery",
    snapshot: "Snapshot",
    clear: "Clear",
    searchPlaceholder: "Search manufacturer or model…",
    noMatches: "No matches",
    scrollToLoadMore: "Scroll to load more…",
    usable: "Usable",
    unknown: "Unknown",
    select: "Select",
    systemParameters: "System parameters",
    installationDate: "Installation date",
    installationDateHint: "Use the electrical compliance certificate signed date.",
    usableCapacity: "Usable capacity (kWh)",
    stcCapHint: "STCs are only available for the first 50 kWh.",
    advancedPrice: "Advanced (STC price)",
    hideAdvanced: "Hide advanced",
    defaultPriceHint: "Default is {price} AUD per STC (excluding GST).",
    stcPrice: "STC price",
    activeRule: "Active",
    estimatedRebate: "Estimated rebate",
    calculationBreakdown: "Calculation breakdown",
    rate: "Rate",
    baseFactor: "Base STC factor",
    formula: "Formula",
    trendTitle: "Rebate trend forecast",
    trendSubtitle: "Same capacity, different dates",
    trendBasedOn: "Based on {kwh} kWh usable capacity.",
    trendTip: "Tip: the STC factor declines every 6 months in the proposed schedule.",
    rulesSummary: "View full STC factor table and tapering rules",
    rulesTitleFactors: "Proposed STC factor",
    rulesTitleTaper: "Tapering rules",
    period: "Period",
    factor: "Factor",
    phase1Title: "Phase 1 (before 1 May 2026)",
    phase2Title: "Phase 2 (from 1 May 2026)",
    phase1Rule1: "0–50 kWh: 100% factor",
    phase1Rule2: ">50 kWh usable: no additional STCs (cap at 50 kWh)",
    phase2Rule1: "0–14 kWh: 100% factor",
    phase2Rule2: "14–28 kWh: 60% factor",
    phase2Rule3: "28–50 kWh: 15% factor",
    phase2Rule4: ">50 kWh usable: 0% (no additional STCs)",
    sources: "Sources",
  },
  zh: {
    appTitle: "澳洲家庭电池补贴计算器",
    appSubtitle: "基于 DCCEEW 最新规则（2025–2030）",
    cecApprovedBattery: "CEC 批准电池型号",
    snapshot: "快照日期",
    clear: "清除",
    searchPlaceholder: "搜索品牌/型号…",
    noMatches: "没有匹配结果",
    scrollToLoadMore: "继续向下滚动加载更多…",
    usable: "可用容量",
    unknown: "未知",
    select: "选择",
    systemParameters: "系统参数",
    installationDate: "预计安装日期",
    installationDateHint: "以电气合规证书（Certificate of Electrical Compliance）签署日期为准。",
    usableCapacity: "电池可用容量 (kWh)",
    stcCapHint: "STC 只按前 50kWh 可用容量计算，超过部分不产生 STC。",
    advancedPrice: "高级设置（STC 价格）",
    hideAdvanced: "收起高级设置",
    defaultPriceHint: "默认 STC 单价 {price} AUD（不含 GST）。",
    stcPrice: "STC 单价",
    activeRule: "当前生效规则",
    estimatedRebate: "预计补贴金额",
    calculationBreakdown: "计算详情",
    rate: "系数效率",
    baseFactor: "基础 STC 系数",
    formula: "计算公式",
    trendTitle: "补贴趋势预测（如果不现在安装…）",
    trendSubtitle: "同一容量，不同日期",
    trendBasedOn: "根据您输入的 {kwh} kWh 电池可用容量。",
    trendTip: "提示：按拟议规则，STC 系数每 6 个月下降一次。",
    rulesSummary: "查看完整 STC 系数表与规则详情",
    rulesTitleFactors: "STC 系数递减表（Proposed STC Factor）",
    rulesTitleTaper: "容量递减规则（Tapering Rules）",
    period: "时期",
    factor: "系数",
    phase1Title: "第一阶段（2026年5月1日之前）",
    phase2Title: "第二阶段（2026年5月1日起）",
    phase1Rule1: "0–50 kWh：100% 系数",
    phase1Rule2: ">50 kWh：不再增加补贴（按 50kWh 封顶）",
    phase2Rule1: "0–14 kWh：100% 系数",
    phase2Rule2: "14–28 kWh：60% 系数",
    phase2Rule3: "28–50 kWh：15% 系数",
    phase2Rule4: ">50 kWh：0%（不增加补贴）",
    sources: "数据来源",
  },
};

export function t(locale: Locale, key: MessageKey, params?: Record<string, string | number>) {
  let s = messages[locale][key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}



