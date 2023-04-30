import cxxUmbrella from "../../templates/cxx/umbrella.h.mustache";
import executableMainObjC from "../../templates/executable/main.m.mustache";
import executableMainSwift from "../../templates/executable/main.swift.mustache";
import gitignore from "../../templates/git/.gitignore.mustache";
import targetObjCHeader from "../../templates/target/Target.h.mustache";
import targetObjCImplementation from "../../templates/target/Target.m.mustache";
import targetSwift from "../../templates/target/target.swift.mustache";
import testCaseObjC from "../../templates/test/TestCase.m.mustache";
import testCaseSwift from "../../templates/test/testCase.swift.mustache";

import Mustache from "mustache";

export type Template =
  // Git
  | { template: "gitignore"; props: {} } // Doesn't need to be run through Mustache but this makes this easier
  // Cxx stuff
  | { template: "cxx/umbrella"; props: { targetName: string } }
  // Executables
  | { template: "executable/main/swift"; props: { targetName: string } }
  | {
      template: "executable/main/objCImplementation";
      props: { targetName: string };
    }
  // Libraries
  | { template: "library/main/swift"; props: { targetName: string } }
  | { template: "library/main/objCHeader"; props: { targetName: string } }
  | {
      template: "library/main/objCImplementation";
      props: { targetName: string };
    }
  // Supporting targets
  | { template: "supporting/main/swift"; props: { targetName: string } }
  | { template: "supporting/main/objCHeader"; props: { targetName: string } }
  | {
      template: "supporting/main/objCImplementation";
      props: { targetName: string };
    }
  // Test targets
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
    // Git
    case "gitignore":
      return gitignore;
    // Cxx
    case "cxx/umbrella":
      return cxxUmbrella;
    // Executables
    case "executable/main/swift":
      return executableMainSwift;
    case "executable/main/objCImplementation":
      return executableMainObjC;
    // Libraries
    case "library/main/swift":
      return targetSwift;
    case "library/main/objCHeader":
      return targetObjCHeader;
    case "library/main/objCImplementation":
      return targetObjCImplementation;
    // Supporting
    case "supporting/main/swift":
      return targetSwift;
    case "supporting/main/objCHeader":
      return targetObjCHeader;
    case "supporting/main/objCImplementation":
      return targetObjCImplementation;
    // Test targets
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
