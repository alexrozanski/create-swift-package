declare module "*.yml" {
  const content: { [key: string]: any };
  export default content;
}
declare module "*.mustache" {
  const content: string;
  export default content;
}
