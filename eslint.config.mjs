import next from "eslint-config-next";

// eslint-config-next exports a native flat-config array that already
// includes core-web-vitals + typescript rules and global ignores
// (.next/**, out/**, next-env.d.ts).
const eslintConfig = [...next];

export default eslintConfig;
