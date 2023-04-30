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

function nodeDepth(node: Node): number {
  switch (node.type) {
    case "file":
      return 1;
    case "directory":
      return (
        1 + Math.max(...Object.values(node.contents).map((n) => nodeDepth(n)))
      );
  }
}

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
        const d1 = nodeDepth(a);
        const d2 = nodeDepth(b);
        return d1 < d2 ? 1 : d1 > d2 ? -1 : 0;
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
