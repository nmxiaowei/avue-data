export default function createCssCompat() {
  return {
    name: "avue-css-compat",
    enforce: "pre",
    transform(code, id) {
      if (!/multiDiffEditor[\\/]style\.css(?:\?|$)/.test(id)) return null;

      const nextCode = code.replace(/(\n[ \t]*)a(\s*\{)/g, "$1:is(a)$2");
      if (nextCode === code) return null;

      return {
        code: nextCode,
        map: null,
      };
    },
  };
}
