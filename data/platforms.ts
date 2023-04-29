export const platforms = {
  iOS: {
    name: "iOS",
    versions: [
      {
        version: "8.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "9.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "10.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "11.0",
        introduced: "5.0",
      },
      {
        version: "12.0",
        introduced: "5.0",
      },
      {
        version: "13.0",
        introduced: "5.1",
      },
      {
        version: "14.0",
        introduced: "5.3",
      },
      {
        version: "15.0",
        introduced: "5.5",
      },
      {
        version: "16.0",
        introduced: "5.7",
      },
    ],
  },
  macOS: {
    name: "macOS",
    versions: [
      {
        version: "10.10",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "10.11",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "10.12",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "10.13",
        introduced: "5.0",
      },
      {
        version: "10.14",
        introduced: "5.0",
      },
      {
        version: "10.15",
        introduced: "5.1",
      },
      {
        version: "11.0",
        introduced: "5.3",
      },
      {
        version: "12.0",
        introduced: "5.5",
      },
      {
        version: "13.0",
        introduced: "5.7",
      },
    ],
  },
  watchOS: {
    name: "watchOS",
    versions: [
      {
        version: "2.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "3.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "4.0",
        introduced: "5.0",
      },
      {
        version: "5.0",
        introduced: "5.0",
      },
      {
        version: "6.0",
        introduced: "5.1",
      },
      {
        version: "7.0",
        introduced: "5.3",
      },
      {
        version: "8.0",
        introduced: "5.5",
      },
      {
        version: "9.0",
        introduced: "5.7",
      },
    ],
  },
  tvOS: {
    name: "tvOS",
    versions: [
      {
        version: "9.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "10.0",
        introduced: "5.0",
        deprecated: "5.7",
      },
      {
        version: "11.0",
        introduced: "5.0",
      },
      {
        version: "12.0",
        introduced: "5.0",
      },
      {
        version: "13.0",
        introduced: "5.1",
      },
      {
        version: "14.0",
        introduced: "5.3",
      },
      {
        version: "15.0",
        introduced: "5.5",
      },
      {
        version: "16.0",
        introduced: "5.7",
      },
    ],
  },
} as const;
