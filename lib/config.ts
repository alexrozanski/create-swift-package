import { z } from "zod";
import { type Platform, type PlatformVersion, type ProductType } from "./swift";

export type PlatformWithVersion<P extends Platform> = {
  platform: Platform;
  minimumVersion: PlatformVersion<P>;
};

export const LanguageOption = z.union([
  z.literal("swift"),
  z.literal("cfamily"),
  z.literal("mixed"),
]);
export type LanguageOption = z.TypeOf<typeof LanguageOption>;
export const allLanguageOptions: LanguageOption[] = [
  "swift",
  "cfamily",
  "mixed",
];

export type Config = {
  projectDir: string;
  name: string;
  platforms: PlatformWithVersion<Platform>[];
  productType: ProductType;
  language: LanguageOption;
  minimumSwiftVersion: string;
  includeTests: boolean;
};
