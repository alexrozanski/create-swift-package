import {
  type Platform,
  type PlatformVersion,
  type TargetLanguage,
  type TargetType,
} from "./swift";

export type PlatformWithVersion<P extends Platform> = {
  platform: Platform;
  minimumVersion: PlatformVersion<P>;
};

export type Config = {
  name: string;
  platforms: PlatformWithVersion<Platform>[];
  targetType: TargetType;
  targetLanguage: TargetLanguage;
  minimumSwiftVersion: string;
  includeTests: boolean;
};
export { TargetLanguage };
