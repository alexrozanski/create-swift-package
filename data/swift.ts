/*
 * Extracted from the releases page on https://github.com/apple/swift with:
 *
 * `curl https://api.github.com/repos/apple/swift/releases | jq '[.[] | {version: (.tag_name | sub("swift-";"") | sub("-RELEASE";"")), releaseDate: (.published_at | strptime("%Y-%m-%dT%H:%M:%SZ") | strftime("%d %b %y"))}]'`
 */
export const swiftVersions = [
  {
    version: "5.8",
    releaseDate: "30 Mar 23",
  },
  {
    version: "5.7.3",
    releaseDate: "19 Jan 23",
  },
  {
    version: "5.7.2",
    releaseDate: "14 Dec 22",
  },
  {
    version: "5.7.1",
    releaseDate: "03 Nov 22",
  },
  {
    version: "5.7",
    releaseDate: "12 Sep 22",
  },
  {
    version: "5.6.3",
    releaseDate: "02 Sep 22",
  },
  {
    version: "5.6.2",
    releaseDate: "20 Jun 22",
  },
  {
    version: "5.6.1",
    releaseDate: "09 Apr 22",
  },
  {
    version: "5.6",
    releaseDate: "14 Mar 22",
  },
  {
    version: "5.5.3",
    releaseDate: "10 Feb 22",
  },
  {
    version: "5.5.2",
    releaseDate: "14 Dec 21",
  },
  {
    version: "5.5.1",
    releaseDate: "26 Oct 21",
  },
  {
    version: "5.5",
    releaseDate: "21 Sep 21",
  },
  {
    version: "5.4.3",
    releaseDate: "09 Sep 21",
  },
  {
    version: "5.4.2",
    releaseDate: "29 Jun 21",
  },
  {
    version: "5.4.1",
    releaseDate: "25 May 21",
  },
  {
    version: "5.4",
    releaseDate: "26 Apr 21",
  },
] as const;
