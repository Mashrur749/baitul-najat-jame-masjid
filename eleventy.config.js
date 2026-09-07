export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "dist/site.css": "site.css" });
  eleventyConfig.addPassthroughCopy({ "dist/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "brand/logo": "logo" });
  eleventyConfig.addWatchTarget("brand/tokens.json");
  eleventyConfig.addWatchTarget("src/css/");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
