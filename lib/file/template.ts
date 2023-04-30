import cxxUmbrella from "../../templates/cxx/umbrella.h.mustache";
import executableMainSwift from "../../templates/executable/main.swift.mustache";
import gitignore from "../../templates/git/.gitignore.mustache";
import libraryMainSwift from "../../templates/library/main.swift.mustache";
import testCaseObjC from "../../templates/test/TestCase.m.mustache";
import testCaseSwift from "../../templates/test/testCase.swift.mustache";

import Mustache from "mustache";

export type Template =
  | { template: "gitignore"; props: {} } // Doesn't need to be run through Mustache but this makes this easier
  | { template: "cxx/umbrella"; props: { targetName: string } }
  | { template: "executable/main/swift"; props: { targetName: string } }
  | { template: "library/main/swift"; props: { targetName: string } }
  | { template: "plugin/main/swift"; props: { targetName: string } }
  | { template: "supporting/main/swift"; props: { targetName: string } }
  | {
      template: "test/testCase/swift";
      props: { targetName: string; productType: string };
    }
  | {
      template: "test/testCase/objC";
      props: { targetName: string; productType: string };
    };

// Use imports so we don't have to mess around with files on disk, and they all get bundled into the distribution.
const getTemplateContents = (template: Template) => {
  switch (template.template) {
    case "gitignore":
      return gitignore;
    case "cxx/umbrella":
      return cxxUmbrella;
    case "executable/main/swift":
      return executableMainSwift;
    case "library/main/swift":
      return libraryMainSwift;
    case "plugin/main/swift":
      return "";
    case "supporting/main/swift":
      return "";
    case "test/testCase/swift":
      return testCaseSwift;
    case "test/testCase/objC":
      return testCaseObjC;
  }
};

export const evaluateTemplate = (template: Template) => {
  const contents = getTemplateContents(template);
  const { props } = template;
  return Mustache.render(contents, props);
};
