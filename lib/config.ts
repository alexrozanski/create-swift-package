import { z } from "zod";
import { Platform, TargetType } from "./swift";

export const TargetLanguage = z.union([
  z.literal("swift"),
  z.literal("cfamily"),
  z.literal("mixed"),
]);
export type TargetLanguage = z.TypeOf<typeof TargetLanguage>;
export const allTargetLanguages: TargetLanguage[] = [
  "swift",
  "cfamily",
  "mixed",
];

export type Config = {
  name: string;
  platforms: { platform: Platform["id"]; minimumVersion: string }[];
  targetType: TargetType;
  targetLanguage: TargetLanguage;
  minimumSwiftVersion: string;
  includeTests: boolean;
};
