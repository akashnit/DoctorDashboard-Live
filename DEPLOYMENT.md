# ArogBharat Dashboard Deployment Guide

This document provides instructions for deploying the ArogBharat Dashboard application to different hosting environments.

## Build Files

The production build has been created in the `dist` directory. These files are ready to be deployed to any static hosting service.

## Deployment Options

### Option 1: Traditional Web Hosting (cPanel, Plesk, etc.)

1. **Upload Files**:
   - Upload all contents of the `dist` directory to your web server's public HTML directory (usually `public_html`, `www`, or `htdocs`).
   - Make sure to maintain the file structure, with the `assets` folder and all files in their correct locations.

2. **Configure Environment**:
   - Edit the `env-config.js` file on the server to set the correct API URL and other environment-specific variables.
   - Example: Change `window.ENV.API_URL` to point to your backend API server.

3. **Server Configuration**:
   - The included `.htaccess` file is configured for Apache servers.
   - If using Nginx, you'll need to add this configuration to your server block:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### Option 2: Cloud Hosting (Netlify, Vercel, AWS S3, etc.)

#### Netlify

1. **Create a new site**:
   - Log in to Netlify and click "New site from Git" or upload the `dist` folder directly.
   - If you've already built the app, use the "Deploy manually" option.

2. **Configure Environment Variables**:
   - Go to Site settings > Build & deploy > Environment
   - Add environment variables as needed.

3. **Configure Redirects**:
   - Create a `_redirects` file in the `dist` directory with the content:
   ```
   /* /index.html 200
   ```

#### Vercel

1. **Deploy using Vercel CLI**:
   ```
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Add environment variables under the "Environment Variables" section.

#### AWS S3 + CloudFront

1. **Create S3 Bucket**:
   - Create a new S3 bucket and configure it for static website hosting.
   - Upload all contents of the `dist` directory to the bucket.

2. **CloudFront Distribution**:
   - Create a CloudFront distribution pointing to your S3 bucket.
   - Configure error pages to redirect to `index.html` for client-side routing.

3. **Environment Configuration**:
   - Edit `env-config.js` before uploading to set the correct environment variables.

## Testing Your Deployment

After deploying, verify the following:

1. **Application Loads**: Visit the main URL and confirm the application loads without errors.
2. **Client-Side Routing**: Navigate to different routes within the application and refresh the page to ensure routing works.
3. **API Connection**: Verify the application successfully connects to your backend API.
4. **Static Assets**: Check that all images, CSS, and JavaScript load correctly.

## Troubleshooting

- **404 Errors on Refresh**: This usually indicates an issue with the server's rewrite rules. Check your `.htaccess` file or server configuration.
- **API Connection Issues**: Verify the API URL in `env-config.js` and check for CORS issues.
- **Missing Assets**: Ensure all files from the `dist` directory were properly uploaded with the correct structure.

## Updating Your Deployment

To update your deployment:

1. Run `npm run build` to create a new production build.
2. Replace the files on your server with the new contents of the `dist` directory.
3. If you've made changes to environment variables, update the `env-config.js` file on the server.

## Security Considerations

1. **HTTPS**: Always serve your application over HTTPS to protect user data.
2. **API Keys**: Don't store sensitive API keys in `env-config.js`. Use server-side authentication.
3. **Content Security Policy**: Consider adding a CSP header for additional security. 