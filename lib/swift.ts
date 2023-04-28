import { z } from "zod";
import platforms from "../data/platform.yml";
import swiftVersions from "../data/swift.yml";

// Types

export const PlatformType = z.union([
  z.literal("iOS"),
  z.literal("macOS"),
  z.literal("watchOS"),
  z.literal("tvOS"),
]);

const PlatformVersion = z.object({
  version: z.string(),
  introduced: z.string(),
  deprecated: z.optional(z.string()),
});
export type PlatformVersion = z.TypeOf<typeof PlatformVersion>;
const Platform = z.object({
  id: PlatformType,
  name: z.string(),
  versions: z.array(PlatformVersion),
});
export type Platform = z.TypeOf<typeof Platform>;

export const TargetType = z.union([
  z.literal("library"),
  z.literal("executable"),
  z.literal("plugin"),
]);
export type TargetType = z.TypeOf<typeof TargetType>;
export const allTargetTypes: TargetType[] = ["library", "executable", "plugin"];

const SwiftVersion = z.object({
  version: z.string(),
  releaseDate: z.string(),
  xcodeVersion: z.string(),
});
export type SwiftVersion = z.TypeOf<typeof SwiftVersion>;

// Loaders

export const allPlatforms = (() => {
  return z
    .object({
      platforms: z.array(Platform),
    })
    .parse(platforms).platforms;
})();

export const getPlatform = (id: string) => {
  return allPlatforms.filter((platform) => platform.id === id)[0];
};

export const allSwiftVersions = (() => {
  return z
    .object({
      swiftVersions: z.array(SwiftVersion),
    })
    .parse(swiftVersions).swiftVersions;
})();
