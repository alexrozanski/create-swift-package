import { z } from "zod";
import { platforms } from "../data/platforms";
import { swiftVersions } from "../data/swift";

/* Platform */

export const Platform = Object.keys(platforms);
export type Platform = keyof typeof platforms;
export type PlatformVersion<P extends Platform> =
  (typeof platforms)[P]["versions"][number]["version"];

export type PlatformInfo<P extends Platform> = {
  id: P;
  name: string;
  versions: { version: string; introduced: string; deprecated?: string }[];
};

const platformInfo = (platform: Platform) => ({
  id: platform,
  name: platforms[platform].name,
  versions: platforms[platform].versions.slice(),
});

export const allPlatforms: PlatformInfo<Platform>[] = [
  platformInfo("iOS"),
  platformInfo("macOS"),
  platformInfo("watchOS"),
  platformInfo("tvOS"),
];

export function getPlatformInfo<P extends Platform>(
  platform: P
): PlatformInfo<P> {
  const { name, versions } = platforms[platform];
  return { id: platform, name, versions: versions.slice() };
}

/* Versions */

export type IOSVersion = PlatformVersion<"iOS">;
export type MacOSVersion = PlatformVersion<"macOS">;
export type WatchOSVersion = PlatformVersion<"watchOS">;
export type TVOSVersion = PlatformVersion<"tvOS">;

export type SwiftVersion = (typeof swiftVersions)[number]["version"];

export type SwiftVersionInfo = {
  version: SwiftVersion;
  releaseDate: Date;
  xcodeVersion: string;
};
export const allSwiftVersions: SwiftVersionInfo[] = swiftVersions
  .slice()
  .map((v) => ({
    version: v.version,
    releaseDate: new Date(Date.parse(v.releaseDate)),
    xcodeVersion: v.xcodeVersion,
  }));

/* Targets */

export const TargetType = z.union([
  z.literal("library"),
  z.literal("executable"),
  z.literal("plugin"),
]);
export type TargetType = z.TypeOf<typeof TargetType>;
export const allTargetTypes: TargetType[] = ["library", "executable", "plugin"];

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
