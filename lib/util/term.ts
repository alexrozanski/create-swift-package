export const clearLines = (n: number) => {
  for (let i = 0; i < n; i++) {
    process.stdout.write("\r");
    // Clear the current line
    process.stdout.write("\u001b[2K");

    // Move the cursor up one line
    if (i < n - 1) {
      process.stdout.write("\u001b[1A");
    }
  }
};
