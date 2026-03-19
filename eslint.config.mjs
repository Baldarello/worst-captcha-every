import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", "captcha-hell/**"],
  },
];

export default eslintConfig;
