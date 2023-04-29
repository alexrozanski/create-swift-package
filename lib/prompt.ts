import chalk from "chalk";
import path from "path";
import prompts, { PromptObject } from "prompts";
import { z } from "zod";
import {
  Config,
  LanguageOption,
  PlatformWithVersion,
  allLanguageOptions,
} from "./config";
import {
  Platform,
  ProductType,
  allPlatforms,
  allProductTypes,
  allSwiftVersions,
  getPlatformInfo,
} from "./swift";
import { greaterThanOrEqual, lessThan, versionCompareMapFn } from "./version";

const promptInitialConfig = async (projectDir?: string) => {
  const nameQuestion: PromptObject = {
    type: "text",
    name: "name",
    message: "What is your package named?",
    initial: "my-package",
  };

  let questions: PromptObject[] = [];
  if (projectDir == null) {
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
          `(Released ${version.releaseDate.toLocaleDateString()})`
        )}`,
        value: version.version,
      })),
  });

  const response = await prompts(questions);
  const pathComponents = (projectDir || process.cwd()).split("/");

  return {
    name: response.name || pathComponents[pathComponents.length - 1],
    minimumSwiftVersion: response.minimumSwiftVersion,
  };
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

  const platforms = z
    .array(
      z.union([
        z.literal("macOS"),
        z.literal("iOS"),
        z.literal("watchOS"),
        z.literal("tvOS"),
      ])
    )
    .parse(response.platforms);
  return platforms;
};

const promptPlatformVersions = async (
  platforms: Platform[],
  minimumSwiftVersion: string
) => {
  const platformVersions: PlatformWithVersion<Platform>[] = [];

  for (const platformId of platforms) {
    const platformInfo = getPlatformInfo(platformId);
    if (platformInfo != null) {
      const response = await prompts({
        type: "select",
        name: "version",
        message: `Which minimum ${platformInfo.name} version do you want to support?`,
        choices: platformInfo.versions
          .sort(versionCompareMapFn((v) => v.version))
          .map((version) => {
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
        minimumVersion: response.version,
      });
    }
  }

  return platformVersions;
};

const promptTargetConfig = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "productType",
      message: "What does your package output?",
      choices: allProductTypes.map((productType) => ({
        title: (() => {
          switch (productType) {
            case "library":
              return "Library";
            case "executable":
              return "Executable";
            case "plugin":
              return "Plugin";
          }
        })(),
        value: productType,
      })),
    },
    {
      type: "select",
      name: "language",
      message: "What languages does your target use?",
      choices: allLanguageOptions.map((languageOption) => ({
        title: (() => {
          switch (languageOption) {
            case "swift":
              return "Swift";
            case "cfamily":
              return "C/Objective-C/C++";
            case "mixed":
              return "Mixed";
          }
        })(),
        value: languageOption,
      })),
    },
  ]);

  const productType = ProductType.parse(response.productType);
  const language = LanguageOption.parse(response.language);

  return { productType, language };
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

const sanitizedDirectory = (filePath: string) => {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/_+/g, "-");

  return path.join(dirName, sanitizedFileName);
};

export const promptConfig = async (
  projectDir?: string
): Promise<Config | null> => {
  const { name, minimumSwiftVersion } = await promptInitialConfig(projectDir);
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
    projectDir:
      projectDir || sanitizedDirectory(path.join(process.cwd(), name)),
    name,
    platforms: platformConfig,
    minimumSwiftVersion,
    ...targetConfig,
    ...miscConfig,
  };
};
