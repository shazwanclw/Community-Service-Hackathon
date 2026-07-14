import { IssueRecord } from "@/lib/types";

export const issueCategoryLabels = {
  cleanliness: "Cleanliness",
  facility: "Facility",
  safety: "Safety",
  others: "Others",
} as const;

export type IssueCategory = keyof typeof issueCategoryLabels;

export function inferIssueCategory(issue: Pick<IssueRecord, "description" | "category">) {
  if (issue.category) {
    return issue.category;
  }

  const text = issue.description.toLowerCase();

  if (
    /trash|garbage|dirty|clean|rubbish|overflow|waste|bin|dump|sanitize/.test(text)
  ) {
    return "cleanliness" as const;
  }

  if (/lamp|drain|lift|elevator|bench|road|pothole|stair|pipe|facility/.test(text)) {
    return "facility" as const;
  }

  if (/danger|sharp|unsafe|hazard|fire|flood|broken|injury|risk|wire/.test(text)) {
    return "safety" as const;
  }

  return "others" as const;
}
