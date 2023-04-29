import chalk from "chalk";
import path from "path";
import prompts, { type Choice, type PromptObject } from "prompts";
import { z } from "zod";
import {
  Config,
  LanguageOptions,
  LanguageType,
  PlatformWithVersion,
  allLanguageTypes,
} from "../config";
import {
  Platform,
  ProductType,
  SwiftVersion,
  allPlatforms,
  allProductTypes,
  allSwiftVersions,
  getPlatformInfo,
  type PlatformInfo,
  type PlatformVersionInfo,
} from "../swift/types";
import { sanitizedDirectory } from "../util/fs";
import {
  greaterThanOrEqual,
  lessThan,
  versionCompareMapFn,
} from "../util/version";

/* Util */

const minimumVersionChoices = (): Choice[] => {
  return allSwiftVersions
    .sort(versionCompareMapFn((v) => v.version))
    .map((version) => ({
      title: `${version.version} ${chalk.gray(
        `(Released ${version.releaseDate.toLocaleDateString()})`
      )}`,
      value: version.version,
    }));
};

// Handle versions for each platform including which Swift version they were introduced for
// and which version they may have been deprecated in.
const platformVersionChoices = (
  platformInfo: PlatformInfo<Platform>,
  minimumSwiftVersion: SwiftVersion
): Choice[] => {
  const title = (
    version: PlatformVersionInfo,
    deprecated: boolean,
    notAvailableYet: boolean
  ) => {
    if (deprecated && version.deprecated) {
      return `${version.version} ${chalk.gray(
        `(Deprecated by Swift tools ${version.deprecated})`
      )}`;
    } else if (notAvailableYet) {
      return `${version.version} ${chalk.gray(
        `(Available from Swift tools ${version.introduced})`
      )}`;
    } else {
      return version.version;
    }
  };

  return platformInfo.versions
    .sort(versionCompareMapFn((v) => v.version))
    .map((version) => {
      const deprecated =
        version.deprecated != null &&
        greaterThanOrEqual(minimumSwiftVersion, version.deprecated);
      const notAvailableYet = lessThan(minimumSwiftVersion, version.introduced);

      return {
        title: title(version, deprecated, notAvailableYet),
        value: version.version,
        disabled: deprecated || notAvailableYet,
      };
    });
};

const productTypeChoices = (): Choice[] => {
  return allProductTypes.map((productType) => ({
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
  }));
};

const languageChoices = (): Choice[] => {
  return allLanguageTypes.map((languageType) => ({
    title: (() => {
      switch (languageType) {
        case "swift":
          return "Swift";
        case "cfamily":
          return "C/Objective-C/C++";
        case "mixed":
          return "Mixed";
      }
    })(),
    value: languageType,
  }));
};

/* Prompts */

const promptInitialConfig = async (projectDir?: string) => {
  let questions: PromptObject[] = [];
  if (projectDir == null) {
    questions.push({
      type: "text",
      name: "name",
      message: "What is your package named?",
      initial: "my-package",
    });
  }

  questions.push({
    type: "select",
    name: "minimumSwiftVersion",
    message: "Which version of Swift does your package target?",
    choices: minimumVersionChoices(),
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
  minimumSwiftVersion: SwiftVersion
) => {
  const platformVersions: PlatformWithVersion<Platform>[] = [];

  for (const platformId of platforms) {
    const platformInfo = getPlatformInfo(platformId);
    if (platformInfo != null) {
      const response = await prompts({
        type: "select",
        name: "version",
        message: `Which minimum ${platformInfo.name} version do you want to support?`,
        choices: platformVersionChoices(platformInfo, minimumSwiftVersion),
      });

      platformVersions.push({
        platform: platformId,
        minimumVersion: response.version,
      });
    }
  }

  return platformVersions;
};

const promptCIncludePath = async (
  language: LanguageType
): Promise<LanguageOptions> => {
  switch (language) {
    case "cfamily":
    case "mixed": {
      const headerPathResponse = await prompts({
        type: "text",
        name: "headerPath",
        message:
          "Where do you want to locate your C/Objective-C/C++ header files?",
        initial: "include",
      });

      const path = z.string().parse(headerPathResponse.headerPath);
      return language === "cfamily"
        ? { type: language, includePath: path }
        : { type: language, cIncludePath: path };
    }
    case "swift":
      return { type: "swift" };
  }
};

const promptTargetConfig = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "productType",
      message: "What does your package output?",
      choices: productTypeChoices(),
    },
    {
      type: "select",
      name: "language",
      message: "What languages does your target use?",
      choices: languageChoices(),
    },
  ]);

  const productType = ProductType.parse(response.productType);
  const language = z
    .union([z.literal("swift"), z.literal("cfamily"), z.literal("mixed")])
    .parse(response.language);

  const languageOptions = await promptCIncludePath(language);

  return { productType, language: languageOptions };
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

/* Public */

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
