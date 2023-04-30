import chalk from "chalk";

export type DirectoryNode = {
  type: "directory";
  name: string;
  marker?: "root" | "package";
  contents: Record<string, Node>;
};
export type Node = DirectoryNode | { type: "file"; name: string };

const isRoot = (node: Node) =>
  node.type === "directory" && node.marker === "root";

const isPackage = (node: Node) =>
  node.type === "directory" && node.marker === "package";

export const formatDirectoryTree = (
  root: Node,
  options?: { useAnsiEscapeCodes?: boolean }
) => {
  const useAnsiEscapeCodes = (options || { useAnsiEscapeCodes: true })
    .useAnsiEscapeCodes;

  const formatNode = (
    node: Node,
    level: number = 0,
    isLast = false,
    prefix = ""
  ) => {
    const marker =
      level === 0
        ? "○"
        : node.type === "directory" && node.marker === "package"
        ? " ●"
        : "";

    var output = "";
    const start = level > 0 ? (isLast ? `${prefix}└──` : `${prefix}├──`) : "";
    output += `${start}${marker} ${
      useAnsiEscapeCodes
        ? isPackage(node)
          ? chalk.bold.cyan(node.name)
          : isRoot(node)
          ? chalk.bold(node.name)
          : node.name
        : node.name
    }\n`;
    if (node.type === "directory") {
      const entries = Object.entries(node.contents);
      // Sort so that directory nodes are listed first.
      entries.sort(([_, a], [__, b]) => {
        if (
          (a.type === "directory" && b.type === "directory") ||
          (a.type === "file" && b.type === "file")
        ) {
          return a.name.length < b.name.length
            ? -1
            : a.name.length > b.name.length
            ? 1
            : 0;
        } else if (a.type === "directory" && b.type === "file") {
          return -1;
        } else if (a.type === "file" && b.type === "directory") {
          return 1;
        } else {
          return 0;
        }
      });
      entries.forEach(([key, child], index) => {
        output += formatNode(
          child,
          level + 1,
          index === entries.length - 1,
          level > 0 ? (isLast ? `${prefix}    ` : `│   ${prefix}`) : prefix
        );
      });
    }
    return output;
  };

  return formatNode(root);
};
