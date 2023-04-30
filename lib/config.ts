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

export type LanguageOptions =
  | { type: "swift" }
  | { type: "cfamily"; includePath?: string }
  | { type: "mixed"; cIncludePath?: string };
export type LanguageType = LanguageOptions["type"];
export const allLanguageTypes: LanguageType[] = ["swift", "cfamily", "mixed"];

/* Public */

export type Config = {
  projectDir: string;
  name: string;
  platforms: PlatformWithVersion<Platform>[];
  productType: ProductType;
  language: LanguageOptions;
  minimumSwiftVersion: SwiftVersion;
  includeTests: boolean;
  initGitRepo: boolean;
};

export const cIncludePath = (languageOptions: LanguageOptions) => {
  switch (languageOptions.type) {
    case "cfamily":
      return languageOptions.includePath;
    case "mixed":
      return languageOptions.cIncludePath;
    case "swift":
      return null;
  }
};
