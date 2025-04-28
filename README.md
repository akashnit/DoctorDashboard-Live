# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Deployment Guide

## Deploying to Vercel

1. Install Vercel CLI (optional but recommended):
   ```bash
   npm install -g vercel
   ```

2. Build the project locally:
   ```bash
   npm run build
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```
   Or push to GitHub and connect your repository to Vercel.

4. Configure Environment Variables in Vercel:
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add all required environment variables from your `.env` file
   - Make sure to add both development and production variables

## Deploying to Netlify

1. Install Netlify CLI (optional but recommended):
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project locally:
   ```bash
   npm run build
   ```

3. Deploy to Netlify:
   ```bash
   netlify deploy
   ```
   Or push to GitHub and connect your repository to Netlify.

4. Configure Environment Variables in Netlify:
   - Go to your site settings
   - Navigate to "Build & deploy" > "Environment"
   - Add all required environment variables

## Deploying to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install gh-pages --save-dev
   ```

2. Add these scripts to your package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Configure the homepage in package.json:
   ```json
   "homepage": "https://yourusername.github.io/repo-name"
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Environment Configuration

## Setting Up Environment Variables

This project uses environment variables for configuration. Follow these steps to set up your environment:

1. Copy the example environment files:
   ```bash
   # For development
   cp .env.example .env
   
   # For production
   cp .env.production.example .env.production
   ```

2. Edit the `.env` file and fill in the appropriate values for your environment.

3. Never commit your actual `.env` files to version control. They are already included in `.gitignore`.

## Available Environment Variables

### API Configuration
- `VITE_API_URL`: Base URL for the API (e.g., http://localhost:8080/api/v1)

### Authentication
- `VITE_JWT_SECRET`: Secret key for JWT token generation
- `VITE_REFRESH_TOKEN_SECRET`: Secret key for refresh token generation
- `VITE_TOKEN_EXPIRY`: JWT token expiration time (e.g., 1h)
- `VITE_REFRESH_TOKEN_EXPIRY`: Refresh token expiration time (e.g., 7d)

### CORS Configuration
- `VITE_CORS_ORIGIN`: Allowed origin for CORS requests

### Feature Flags
- `VITE_ENABLE_ANALYTICS`: Enable/disable analytics
- `VITE_ENABLE_LOGGING`: Enable/disable logging

### Payment Gateway (if applicable)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for payments

### Email Configuration (if applicable)
- `VITE_SMTP_HOST`: SMTP server host
- `VITE_SMTP_PORT`: SMTP server port
- `VITE_SMTP_USER`: SMTP username
- `VITE_SMTP_PASS`: SMTP password
- `VITE_EMAIL_FROM`: Default sender email address

## Environment File Structure

- `.env.example`: Example configuration for development
- `.env.production.example`: Example configuration for production
- `.env`: Your local development configuration (not committed)
- `.env.production`: Your production configuration (not committed)

## Security Notes

1. Keep your environment files secure and never share them publicly
2. Use different secrets for development and production
3. Regularly rotate your secrets and tokens
4. Consider using a secrets management service for production environments

## Build Configuration

The project is configured to build with the following settings:

- Output directory: `dist`
- Base URL: Set in environment variables
- Build command: `npm run build`
- Install command: `npm install`

## Post-Deployment Checklist

1. Verify all environment variables are set correctly
2. Test the application's functionality
3. Check console for any errors
4. Verify API connections are working
5. Test authentication flows
6. Check responsive design on different devices
7. Verify all routes are working correctly

## Troubleshooting Deployment Issues

1. **Build Fails**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for any build-time errors in the console

2. **Environment Variables Not Working**
   - Verify variables are set in the deployment platform
   - Check variable names match exactly
   - Ensure variables are available at build time

3. **API Connection Issues**
   - Verify API URL is correct
   - Check CORS settings
   - Ensure API is accessible from the deployment domain

4. **Routing Issues**
   - Verify SPA routing configuration
   - Check for 404 errors
   - Ensure all routes are properly handled

# Backend Deployment Guide

## Deploying Backend to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Deploy the backend:
   ```bash
   vercel
   ```

4. Configure Environment Variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Secret for JWT token generation
     - `REFRESH_TOKEN_SECRET`: Secret for refresh tokens
     - `SMTP_*`: Email configuration (if using email features)
     - `STRIPE_SECRET_KEY`: Stripe secret key (if using payments)

## Deploying Backend to Heroku

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add MongoDB addon:
   ```bash
   heroku addons:create mongolab
   ```

5. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set REFRESH_TOKEN_SECRET=your_refresh_secret
   # Add other environment variables as needed
   ```

6. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

## Deploying Backend to DigitalOcean

1. Create a Droplet:
   - Choose Ubuntu 20.04 LTS
   - Select appropriate size
   - Choose your region

2. Connect to your Droplet:
   ```bash
   ssh root@your_droplet_ip
   ```

3. Install required software:
   ```bash
   apt update
   apt install nodejs npm nginx mongodb
   ```

4. Configure Nginx:
   ```bash
   # Create a new Nginx configuration
   nano /etc/nginx/sites-available/your-app
   
   # Add the following configuration
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # Enable the configuration
   ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

5. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

## Backend Environment Variables

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `REFRESH_TOKEN_SECRET`: Secret for refresh tokens
- `PORT`: Server port (default: 8080)

### Optional Variables
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `EMAIL_FROM`: Default sender email
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NODE_ENV`: Environment (development/production)

## Backend Security Checklist

1. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Configure proper user roles
   - Enable SSL/TLS for connections

2. **API Security**
   - Implement rate limiting
   - Enable CORS with proper origins
   - Use HTTPS
   - Validate all inputs
   - Implement proper error handling

3. **Authentication**
   - Use secure JWT secrets
   - Implement refresh token rotation
   - Set appropriate token expiration times
   - Store tokens securely

4. **Server Security**
   - Keep Node.js and dependencies updated
   - Use proper file permissions
   - Implement proper logging
   - Set up monitoring and alerts

## Backend Monitoring

1. **Logging**
   - Implement structured logging
   - Set up log rotation
   - Configure log levels appropriately

2. **Performance Monitoring**
   - Set up application metrics
   - Monitor response times
   - Track error rates
   - Monitor resource usage

3. **Error Tracking**
   - Implement error tracking service
   - Set up alerts for critical errors
   - Monitor API health

## Database Backup Strategy

1. **Regular Backups**
   - Set up automated backups
   - Store backups securely
   - Test backup restoration

2. **Backup Schedule**
   - Daily incremental backups
   - Weekly full backups
   - Monthly archive backups

3. **Backup Storage**
   - Use separate storage location
   - Implement encryption
   - Set retention policies
