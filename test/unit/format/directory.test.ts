import { Node, formatDirectoryTree } from "../../../lib/format/directory";

describe("Directory tree formatting unit tests", () => {
  test("prints simple directory structure", () => {
    const expected = `○ my-package
├── Sources
│   └── ● MyPackage
│       └── MyPackage.swift
└── Package.swift`;

    const output = formatDirectoryTree(simple, {
      useAnsiEscapeCodes: false,
    }).trim();
    expect(output).toBe(expected);
  });

  test("prints complex directory structure", () => {
    const expected = `○ my-package
├── Sources
│   ├── ● MyPackage
│   │   ├── Resources
│   │   │   ├── test.txt
│   │   │   └── test2.txt
│   │   └── MyPackage.swift
│   └── ● MyPackageTests
│       └── MyPackageTests.swift
└── Package.swift`;

    const output = formatDirectoryTree(complex, {
      useAnsiEscapeCodes: false,
    }).trim();
    expect(output).toBe(expected);
  });
});

const simple: Node = {
  type: "directory",
  name: "my-package",
  marker: "root",
  contents: {
    Sources: {
      type: "directory",
      name: "Sources",
      contents: {
        MyPackage: {
          type: "directory",
          name: "MyPackage",
          marker: "package",
          contents: {
            "MyPackage.swift": { type: "file", name: "MyPackage.swift" },
          },
        },
      },
    },
    "Package.swift": { type: "file", name: "Package.swift" },
  },
};

const complex: Node = {
  type: "directory",
  name: "my-package",
  marker: "root",
  contents: {
    Sources: {
      type: "directory",
      name: "Sources",
      contents: {
        MyPackage: {
          type: "directory",
          name: "MyPackage",
          marker: "package",
          contents: {
            Resources: {
              type: "directory",
              name: "Resources",
              contents: {
                "test.txt": { type: "file", name: "test.txt" },
                "test2.txt": { type: "file", name: "test2.txt" },
              },
            },
            "MyPackage.swift": { type: "file", name: "MyPackage.swift" },
          },
        },
        MyPackageTests: {
          type: "directory",
          name: "MyPackageTests",
          marker: "package",
          contents: {
            "MyPackageTests.swift": {
              type: "file",
              name: "MyPackageTests.swift",
            },
          },
        },
      },
    },
    "Package.swift": { type: "file", name: "Package.swift" },
  },
};
