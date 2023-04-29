import { Config } from "../../lib/config";
import { ProductType } from "../../lib/swift";
import { TargetLanguage } from "../../lib/target";

export const makeConfig = (props: {
  name: string;
  productType: ProductType;
  language: TargetLanguage;
  includeTests: boolean;
}): Config => {
  const { name, productType, language, includeTests } = props;
  return {
    projectDir: "",
    name,
    platforms: [{ platform: "macOS", minimumVersion: "11.0" }],
    productType: productType,
    language: language,
    minimumSwiftVersion: "5.4",
    includeTests: includeTests,
  };
};
