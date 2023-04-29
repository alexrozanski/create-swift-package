/**
 * File writer
 *
 * Writes lines of text to a buffer to be converted to a string later.
 * Manages the current write context incl. indentation.
 */
type Line = { contents: string; indentation: number };

export class Writer {
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
