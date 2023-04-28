import chalk from "chalk";
import prompts, { PromptObject } from "prompts";
import { z } from "zod";
import {
  PlatformType,
  TargetType,
  allPlatforms,
  allSwiftVersions,
  allTargetTypes,
  getPlatform,
  type Platform,
} from "./swift";

const TargetLanguage = z.union([
  z.literal("swift"),
  z.literal("cfamily"),
  z.literal("mixed"),
]);
type TargetLanguage = z.TypeOf<typeof TargetLanguage>;
const allTargetLanguages: TargetLanguage[] = ["swift", "cfamily", "mixed"];

export type Config = {
  name?: string;
  platforms: { platform: Platform["id"]; minimumVersion: string }[];
  targetType: TargetType;
  targetLanguage: TargetLanguage;
  minimumSwiftVersion: string;
  includeTests: boolean;
};

const promptInitialConfig = async (
  projectDirectory?: string
): Promise<{ name?: string; platforms?: Platform["id"][] }> => {
  const nameQuestion: PromptObject = {
    type: "text",
    name: "name",
    message: "What is your package named?",
    initial: "my-package",
  };

  let questions: PromptObject[] = [];
  if (projectDirectory == null) {
    questions.push(nameQuestion);
  }

  questions.push({
    type: "multiselect",
    name: "platforms",
    message: "Which platforms does your    package support?",
    choices: allPlatforms.map((platform) => ({
      title: platform.name,
      value: platform.id,
    })),
    min: 1,
  });

  const response = await prompts(questions);
  const name = z.optional(z.string()).parse(response.name);
  const platforms = z.array(PlatformType).parse(response.platforms);

  return { name, platforms };
};

const promptPlatformVersions = async (platforms: Platform["id"][]) => {
  const platformVersions: {
    platform: Platform["id"];
    minimumVersion: string;
  }[] = [];

  for (const platformId of platforms) {
    const platform = getPlatform(platformId);
    if (platform != null) {
      const response = await prompts({
        type: "select",
        name: "version",
        message: `Which minimum ${platform.name} version do you want to support?`,
        choices: platform.versions.map((version) => ({
          title: version,
          value: version,
        })),
      });

      platformVersions.push({
        platform: platformId,
        minimumVersion: z.string().parse(response.version),
      });
    }
  }

  return platformVersions;
};

const promptTargetConfig = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "targetType",
      message: "What does your package output?",
      choices: allTargetTypes.map((target) => ({
        title: (() => {
          switch (target) {
            case "library":
              return "Library";
            case "executable":
              return "Executable";
            case "plugin":
              return "Plugin";
          }
        })(),
        value: target,
      })),
    },
    {
      type: "select",
      name: "language",
      message: "What languages does your target use?",
      choices: allTargetLanguages.map((targetLanguage) => ({
        title: (() => {
          switch (targetLanguage) {
            case "swift":
              return "Swift";
            case "cfamily":
              return "C/Objective-C/C++";
            case "mixed":
              return "Mixed";
          }
        })(),
        value: targetLanguage,
      })),
    },
  ]);

  const targetType = TargetType.parse(response.targetType);
  const targetLanguage = TargetLanguage.parse(response.language);

  return { targetType, targetLanguage };
};

const promptMiscConfig = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "minimumSwiftVersion",
      message: "Which version of Swift does your package target?",
      choices: allSwiftVersions.map((version) => ({
        title: `${version.version} ${chalk.gray(
          `(Released ${new Date(
            Date.parse(version.releaseDate)
          ).toLocaleDateString()})`
        )}`,
        value: version.version,
      })),
    },
    {
      type: "toggle",
      name: "includeTests",
      message: "Include tests?",
      active: "Yes",
      inactive: "No",
      initial: true,
    },
  ]);

  const minimumSwiftVersion = z.string().parse(response.minimumSwiftVersion);
  const includeTests = z.boolean().parse(response.includeTests);

  return { minimumSwiftVersion, includeTests };
};

export const promptConfig = async (
  projectDirectory?: string
): Promise<Config | null> => {
  const { name, platforms } = await promptInitialConfig(projectDirectory);
  if (platforms == null) {
    return null;
  }

  const platformConfig = await promptPlatformVersions(platforms);
  if (platformConfig.length == null) {
    return null;
  }

  const targetConfig = await promptTargetConfig();
  const miscConfig = await promptMiscConfig();

  return {
    name,
    platforms: platformConfig,
    ...targetConfig,
    ...miscConfig,
  };
};
