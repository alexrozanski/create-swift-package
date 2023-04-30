import { Writer } from "../file/writer";

/**
 * Simple Swift file AST.
 *
 * This is obviously not fully representative of a Swift file and is purely
 * focused on describing the contents of a Package.swift file, but this gives
 * us some structure and type-safety for generating Package.swift files, and also
 * gives us some flexibility if e.g. the Swift project decides to tweak parameter names
 * and formats.
 *
 */
export type SwiftFile = {
  headerComment: string;
  importedModules: string[];
  globalDeclarations: GlobalDeclaration[];
};

type GlobalDeclaration = {
  type: "let";
  // Exposing the name makes the ASTs we construct a bit more readable, even though in practice this will be `package`.
  name: string;
  // The only declaration we need to care about is an initializer, for e.g. let package = Package(...)
  initializer: Initializer;
};
export type Value = string | Initializer | Value[];
export type Argument = { name: string; value: Value };
export type Initializer = {
  type: "initializer";
  name: string;
  args: Argument[];
};

/* AST sugar functions */

export const decl = (
  type: "let",
  name: string,
  initializer: Initializer
): GlobalDeclaration => {
  return { type, name, initializer };
};

export const init = (name: string, args?: Argument[]): Initializer => {
  return { type: "initializer", name, args: args || [] };
};

export const arg = (name: string, value: Value): Argument => {
  return { name, value };
};

/* Writing */

const writeString = (value: string, writer: Writer) => {
  writer.append(`"${value}"`);
};

const writeArray = (array: Value[], writer: Writer) => {
  if (array.length === 0) {
    writer.append("[]");
  } else if (array.length === 1 && typeof array[0] === "string") {
    writer.append("[");
    writeValue(array[0], writer);
    writer.append("]");
  } else {
    writer.append("[");
    writer.indent();

    array.forEach((element, index) => {
      writer.appendLine();
      writeValue(element, writer);
      if (index !== array.length - 1) {
        writer.append(",");
      }
    });

    writer.outdent();
    writer.appendLine("]");
  }
};

const writeInitializer = (initializer: Initializer, writer: Writer) => {
  const { name, args } = initializer;

  if (args.length > 1) {
    writer.append(`${name}(`);
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
    writer.append(`${name}(`);
    writeValue(args[0].value, writer);
    writer.append(")");
  } else {
    writer.append(`${name}`);
  }
};

const writeValue = (value: Value, writer: Writer) => {
  if (typeof value === "string") {
    writeString(value, writer);
  } else if (Array.isArray(value)) {
    writeArray(value, writer);
  } else {
    switch (value.type) {
      case "initializer": {
        writeInitializer(value, writer);
        break;
      }
    }
  }
};

/* Public */

export const writeSwiftFile = (swiftFile: SwiftFile) => {
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
