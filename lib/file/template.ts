import cxxUmbrella from "../../templates/cxx/umbrella.h.mustache";
import executableMainSwift from "../../templates/executable/main.swift.mustache";
import gitignore from "../../templates/git/.gitignore.mustache";
import libraryMainSwift from "../../templates/library/main.swift.mustache";
import testCaseSwift from "../../templates/test/testCase.swift.mustache";

import Mustache from "mustache";

export type Template =
  | { template: "gitignore"; props: {} } // Doesn't need to be run through Mustache but this makes this easier
  | { template: "cxx/umbrella"; props: { targetName: string } }
  | { template: "swift/executable/main"; props: { targetName: string } }
  | { template: "swift/library/main"; props: { targetName: string } }
  | { template: "swift/plugin/main"; props: { targetName: string } }
  | { template: "swift/supporting/main"; props: { targetName: string } }
  | { template: "swift/test/testCase"; props: { targetName: string } };

// Use imports so we don't have to mess around with files on disk, and they all get bundled into the distribution.
const getTemplateContents = (template: Template) => {
  switch (template.template) {
    case "gitignore":
      return gitignore;
    case "cxx/umbrella":
      return cxxUmbrella;
    case "swift/executable/main":
      return executableMainSwift;
    case "swift/library/main":
      return libraryMainSwift;
    case "swift/plugin/main":
      return "";
    case "swift/supporting/main":
      return "";
    case "swift/test/testCase":
      return testCaseSwift;
  }
};

export const evaluateTemplate = (template: Template) => {
  const contents = getTemplateContents(template);
  const { props } = template;
  return Mustache.render(contents, props);
};
