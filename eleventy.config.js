import { registerAll } from "./scripts/filters.mjs";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  registerAll((n, f) => eleventyConfig.addFilter(n, f));

  eleventyConfig.addPassthroughCopy({ "dist/site.css": "site.css" });
  eleventyConfig.addPassthroughCopy({ "dist/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "brand/logo": "logo" });
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/video");
  eleventyConfig.addPassthroughCopy("src/_headers");

  // Every <img> in the output becomes <picture> with WebP + JPEG at five widths, written to
  // /img/ under content-hashed names. Build-time only, no runtime JS. Mark an <img> with
  // `eleventy:ignore` to leave it alone (the lettering SVG).
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [320, 480, 640, 960, 1280],
    urlPath: "/img/",
    outputDir: "_site/img/",
    svgShortCircuit: true,
    sharpWebpOptions: { quality: 72 },
    htmlOptions: { imgAttributes: { decoding: "async" } },
  });
  eleventyConfig.addWatchTarget("brand/tokens.json");
  eleventyConfig.addWatchTarget("src/css/");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
