/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DFX_NETWORK: "local",
    CANISTER_ID_ICP_HELLO_WORLD_RUST_BACKEND: "bd3sg-teaaa-aaaaa-qaaba-cai",
    CANISTER_ID_ICP_GPT2: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
  },
  output: "export",
  images: {
    unoptimized: true,
  },
  distDir: "out",
  trailingSlash: true,
  assetPrefix: "./",
  reactStrictMode: true,
};

export default nextConfig;
