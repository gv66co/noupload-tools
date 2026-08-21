/** @type {import('next').NextConfig} */
const isPages = process.env.GH_PAGES === '1';
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isPages ? '/noupload-tools' : '',
  assetPrefix: isPages ? '/noupload-tools/' : undefined,
};

module.exports = nextConfig;
