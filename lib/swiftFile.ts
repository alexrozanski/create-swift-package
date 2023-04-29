type GlobalDeclaration = {
  type: "let";
  name: string;
  initializer: Initializer;
};
export type Value = string | Initializer | Value[];
type Argument = { name: string; value: Value };
type Initializer = { type: "initializer"; className: string; args: Argument[] };

export type SwiftFile = {
  headerComment: string;
  importedModules: string[];
  globalDeclarations: GlobalDeclaration[];
};

type Line = { contents: string; indentation: number };

class Writer {
  lines: Line[];
  currentIndentation: number;

  constructor() {
    this.lines = [];
    this.currentIndentation = 0;
  }

  append(contents: string) {
    if (this.lines.length === 0) {
      this.lines.push({ contents, indentation: this.currentIndentation });
    } else {
      this.lines[this.lines.length - 1].contents += contents;
    }
  }

  appendLine(contents?: string) {
    this.lines.push({
      contents: contents || "",
      indentation: this.currentIndentation,
    });
  }

  indent() {
    this.currentIndentation++;
  }

  outdent() {
    this.currentIndentation = Math.max(this.currentIndentation - 1, 0);
  }

  stringContents() {
    return this.lines
      .map((line) => `${" ".repeat(line.indentation * 2)}${line.contents}`)
      .join("\n");
  }
}

export const decl = (
  type: "let",
  name: string,
  initializer: Initializer
): GlobalDeclaration => {
  return { type, name, initializer };
};

export const init = (className: string, args?: Argument[]): Initializer => {
  return { type: "initializer", className, args: args || [] };
};

export const arg = (name: string, value: Value): Argument => {
  return { name, value };
};

const writeValue = (value: Value, writer: Writer) => {
  if (typeof value === "string") {
    writer.append(`"${value}"`);
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      writer.append("[]");
    } else if (value.length === 1 && typeof value[0] === "string") {
      writer.append("[");
      writeValue(value[0], writer);
      writer.append("]");
    } else {
      writer.append("[");
      writer.indent();

      value.forEach((element, index) => {
        writer.appendLine();
        writeValue(element, writer);
        if (index !== value.length - 1) {
          writer.append(",");
        }
      });

      writer.outdent();
      writer.appendLine("]");
    }
  } else {
    switch (value.type) {
      case "initializer": {
        const { className, args } = value;

        if (args.length > 1) {
          writer.append(`${className}(`);
          writer.indent();

          args.forEach((arg, index) => {
            const { name, value } = arg;
            writer.appendLine(`${name}: `);
            writeValue(value, writer);
            if (index !== args.length - 1) {
              writer.append(",");
            }
          });

          writer.outdent();
          writer.appendLine(")");
        } else if (args.length === 1) {
          // Assume that single-value initializers have no labels
          writer.append(`${className}(`);
          writeValue(args[0].value, writer);
          writer.append(")");
        } else {
          writer.append(`${className}`);
        }
        break;
      }
    }
  }
};

export const write = (swiftFile: SwiftFile) => {
  const writer = new Writer();
  writer.appendLine(`// ${swiftFile.headerComment}`);
  swiftFile.importedModules.forEach((module) => {
    writer.appendLine(`import ${module}`);
  });

  writer.appendLine();
  writer.appendLine();

  swiftFile.globalDeclarations.forEach((declaration) => {
    const { type: symbolType, name, initializer } = declaration;
    writer.append(`${symbolType} ${name} = `);
    writeValue(initializer, writer);
  });

  writer.appendLine();

  return writer.stringContents();
};
