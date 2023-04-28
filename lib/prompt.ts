import chalk from "chalk";
import prompts, { PromptObject } from "prompts";
import { z } from "zod";
import { Config, TargetLanguage, allTargetLanguages } from "./config";
import {
  PlatformType,
  TargetType,
  allPlatforms,
  allSwiftVersions,
  allTargetTypes,
  getPlatform,
  type Platform,
} from "./swift";
import { greaterThanOrEqual, lessThan, versionCompareMapFn } from "./version";

const promptInitialConfig = async (projectDirectory?: string) => {
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
    type: "select",
    name: "minimumSwiftVersion",
    message: "Which version of Swift does your package target?",
    choices: allSwiftVersions
      .sort(versionCompareMapFn((v) => v.version))
      .map((version) => ({
        title: `${version.version} ${chalk.gray(
          `(Released ${new Date(
            Date.parse(version.releaseDate)
          ).toLocaleDateString()})`
        )}`,
        value: version.version,
      })),
  });

  const response = await prompts(questions);
  const name = z.string().parse(response.name);
  const minimumSwiftVersion = z.string().parse(response.minimumSwiftVersion);

  return { name, minimumSwiftVersion };
};

const promptPlatforms = async () => {
  const response = await prompts({
    type: "multiselect",
    name: "platforms",
    message: "Which platforms does your package support?",
    choices: allPlatforms.map((platform) => ({
      title: platform.name,
      value: platform.id,
    })),
    min: 1,
  });

  const platforms = z.array(PlatformType).parse(response.platforms);
  return platforms;
};

const promptPlatformVersions = async (
  platforms: Platform["id"][],
  minimumSwiftVersion: string
) => {
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
        choices: platform.versions
          .sort(versionCompareMapFn((v) => v.version))
          .map((version, index) => {
            const deprecated =
              version.deprecated != null &&
              greaterThanOrEqual(minimumSwiftVersion, version.deprecated);
            const notAvailableYet = lessThan(
              minimumSwiftVersion,
              version.introduced
            );

            let title: string;
            if (deprecated && version.deprecated) {
              title = `${version.version} ${chalk.gray(
                `(Deprecated by Swift tools ${version.deprecated})`
              )}`;
            } else if (notAvailableYet) {
              title = `${version.version} ${chalk.gray(
                `(Available from Swift tools ${version.introduced})`
              )}`;
            } else {
              title = version.version;
            }

            return {
              title,
              value: version.version,
              disabled: deprecated || notAvailableYet,
            };
          }),
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
  const response = await prompts({
    type: "toggle",
    name: "includeTests",
    message: "Include tests?",
    active: "Yes",
    inactive: "No",
    initial: true,
  });

  const includeTests = z.boolean().parse(response.includeTests);

  return { includeTests };
};

export const promptConfig = async (
  projectDirectory?: string
): Promise<Config | null> => {
  const { name, minimumSwiftVersion } = await promptInitialConfig(
    projectDirectory
  );
  if (minimumSwiftVersion == null) {
    return null;
  }

  const platforms = await promptPlatforms();
  if (platforms == null) {
    return null;
  }

  const platformConfig = await promptPlatformVersions(
    platforms,
    minimumSwiftVersion
  );
  if (platformConfig.length == null) {
    return null;
  }

  const targetConfig = await promptTargetConfig();
  const miscConfig = await promptMiscConfig();

  return {
    name,
    platforms: platformConfig,
    minimumSwiftVersion,
    ...targetConfig,
    ...miscConfig,
  };
};
