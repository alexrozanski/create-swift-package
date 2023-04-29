import { z } from "zod";
import {
  SwiftVersion,
  type Platform,
  type PlatformVersion,
  type ProductType,
} from "./swift/types";

/**
 * Additional config types
 *
 * These aren't directly related to values in Package.swift itself.
 */
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

/* Public */

export type Config = {
  projectDir: string;
  name: string;
  platforms: PlatformWithVersion<Platform>[];
  productType: ProductType;
  language: LanguageOption;
  minimumSwiftVersion: SwiftVersion;
  includeTests: boolean;
};
