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
import { getInstalledSwiftVersion } from "../swift/cmd";
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

const minimumVersionChoices = async () => {
  const installedVersion = await getInstalledSwiftVersion();
  const maxVersionLength = Math.max(
    ...allSwiftVersions.map((v) => v.version.length)
  );

  const processed = allSwiftVersions
    .sort(versionCompareMapFn((v) => v.version))
    .map((version) => {
      const greaterThanAvailable =
        installedVersion != null && lessThan(installedVersion, version.version);

      return {
        version,
        available: !greaterThanAvailable,
        isInstalled: version.version === installedVersion,
      };
    });

  return {
    choices: processed.map(({ version, available, isInstalled }) => {
      const formattedReleaseDate = version.releaseDate.toLocaleDateString(
        undefined,
        {
          dateStyle: "short",
        }
      );
      const title = available
        ? `${version.version.padEnd(maxVersionLength, " ")} ${chalk.gray(
            `(Released ${formattedReleaseDate})`
          )}${isInstalled ? " [Installed]" : ""}`
        : version.version;

      return {
        title,
        disabled: !available,
        value: version.version,
      };
    }),
    initial: processed.findIndex(({ available }) => available),
  };
};

// Handle versions for each platform including which Swift version they were introduced for
// and which version they may have been deprecated in.
const platformVersionChoices = (
  platformInfo: PlatformInfo<Platform>,
  minimumSwiftVersion: SwiftVersion
): { choices: Choice[]; initial: number } => {
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

  const choicesWithVersionSupport = platformInfo.versions
    .sort(versionCompareMapFn((v) => v.version))
    .map((version) => {
      const deprecated =
        version.deprecated != null &&
        greaterThanOrEqual(minimumSwiftVersion, version.deprecated);
      const notAvailableYet = lessThan(minimumSwiftVersion, version.introduced);

      return {
        version,
        deprecated,
        notAvailableYet,
      };
    });

  return {
    choices: choicesWithVersionSupport.map((info) => {
      const { version, deprecated, notAvailableYet } = info;

      return {
        title: title(version, deprecated, notAvailableYet),
        value: version.version,
        disabled: deprecated || notAvailableYet,
      };
    }),
    initial: choicesWithVersionSupport.findIndex(
      ({ deprecated, notAvailableYet }) => !deprecated && !notAvailableYet
    ),
  };
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

  const { choices, initial } = await minimumVersionChoices();

  questions.push({
    type: "select",
    name: "minimumSwiftVersion",
    message: "Which version of Swift does your package target?",
    choices,
    initial,
  });

  let cancelled = false;
  const response = await prompts(questions, {
    onCancel: () => {
      cancelled = true;
    },
  });

  if (cancelled) {
    return { name: null, minimumSwiftVersion: null };
  }

  const pathComponents = (projectDir || process.cwd()).split("/");

  return {
    name: response.name || pathComponents[pathComponents.length - 1],
    minimumSwiftVersion: response.minimumSwiftVersion,
  };
};

const promptPlatforms = async () => {
  let cancelled = false;
  const response = await prompts(
    {
      type: "multiselect",
      name: "platforms",
      message: "Which platforms does your package support?",
      choices: allPlatforms.map((platform) => ({
        title: platform.name,
        value: platform.id,
      })),
      min: 1,
    },
    {
      onCancel: () => {
        cancelled = true;
      },
    }
  );

  if (cancelled) {
    return null;
  }

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
    const { choices, initial } = platformVersionChoices(
      platformInfo,
      minimumSwiftVersion
    );
    if (platformInfo != null) {
      let cancelled = false;
      const response = await prompts(
        {
          type: "select",
          name: "version",
          message: `Which minimum ${platformInfo.name} version do you want to support?`,
          initial,
          choices,
        },
        {
          onCancel: () => {
            cancelled = true;
          },
        }
      );

      if (cancelled) {
        return null;
      }

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
): Promise<LanguageOptions | null> => {
  switch (language) {
    case "cfamily":
    case "mixed": {
      let cancelled = false;
      const headerPathResponse = await prompts(
        {
          type: "text",
          name: "headerPath",
          message:
            "Where do you want to locate your C/Objective-C/C++ header files?",
          initial: "include",
        },
        {
          onCancel: () => {
            cancelled = true;
          },
        }
      );

      if (cancelled) {
        return null;
      }

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
  let cancelled = false;
  const response = await prompts(
    [
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
    ],
    {
      onCancel: () => {
        cancelled = true;
      },
    }
  );

  if (cancelled) {
    return null;
  }

  const productType = ProductType.parse(response.productType);
  const language = z
    .union([z.literal("swift"), z.literal("cfamily"), z.literal("mixed")])
    .parse(response.language);

  const languageOptions = await promptCIncludePath(language);
  if (languageOptions == null) {
    return null;
  }

  return { productType, language: languageOptions };
};

const promptMiscConfig = async () => {
  let cancelled = false;
  const response = await prompts(
    [
      {
        type: "toggle",
        name: "includeTests",
        message: "Include tests?",
        active: "Yes",
        inactive: "No",
        initial: true,
      },
      {
        type: "toggle",
        name: "initGitRepo",
        message: "Initialize git repo?",
        active: "Yes",
        inactive: "No",
        initial: true,
      },
    ],
    {
      onCancel: () => {
        cancelled = true;
      },
    }
  );

  if (cancelled) {
    return null;
  }

  const includeTests = z.boolean().parse(response.includeTests);
  const initGitRepo = z.boolean().parse(response.initGitRepo);

  return { includeTests, initGitRepo };
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
  if (platformConfig == null) {
    return null;
  }

  const targetConfig = await promptTargetConfig();
  if (targetConfig == null) {
    return null;
  }

  const miscConfig = await promptMiscConfig();
  if (miscConfig == null) {
    return null;
  }

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
