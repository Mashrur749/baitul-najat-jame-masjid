import { registerAll } from "./scripts/filters.mjs";

export default function (eleventyConfig) {
  registerAll((n, f) => eleventyConfig.addFilter(n, f));

  eleventyConfig.addPassthroughCopy({ "dist/site.css": "site.css" });
  eleventyConfig.addPassthroughCopy({ "dist/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "brand/logo": "logo" });
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/video");
  eleventyConfig.addWatchTarget("brand/tokens.json");
  eleventyConfig.addWatchTarget("src/css/");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
