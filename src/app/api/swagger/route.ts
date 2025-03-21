import { NextResponse } from 'next/server';
import { swaggerOptions } from '@/lib/swagger';

// This is a server-side route that serves the Swagger UI HTML
export async function GET() {
  try {
    // Create a custom HTML page with Swagger UI
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NC Cigar Form Filler API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.2/swagger-ui.css" />
  <style>
    .custom-auth-wrapper {
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #dee2e6;
    }
    .custom-auth-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .form-row {
      display: flex;
      flex-direction: column;
    }
    .form-row label {
      margin-bottom: 4px;
      font-weight: bold;
    }
    .form-row input {
      padding: 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
    }
    .auth-button {
      padding: 8px 16px;
      background-color: #49cc90;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 8px;
    }
    .auth-button:hover {
      background-color: #3eba7f;
    }
    .auth-status {
      margin-top: 8px;
      padding: 8px;
      border-radius: 4px;
    }
    .auth-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .auth-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div id="custom-auth" class="custom-auth-wrapper">
    <h3>API Authentication</h3>
    <div class="custom-auth-form">
      <div class="form-row">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Enter your email">
      </div>
      <div class="form-row">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password">
      </div>
      <button id="login-button" class="auth-button">Login</button>
      <div id="auth-success" class="auth-status auth-success hidden">Authentication successful! Token has been applied.</div>
      <div id="auth-error" class="auth-status auth-error hidden"></div>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Initialize Swagger UI
      window.ui = SwaggerUIBundle({
        url: "/api/docs",
        dom_id: '#swagger-ui',
        deepLinking: false,
        defaultModelsExpandDepth: -1,
        validatorUrl: null,
        displayRequestDuration: true,
        requestSnippetsEnabled: true,
        tryItOutEnabled: true,
        persistAuthorization: true,
        withCredentials: true,
        urls: null,
        operationsSorter: 'alpha',
        tagsSorter: 'alpha',
        configUrl: null,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      
      // Add custom login functionality
      document.getElementById('login-button').addEventListener('click', async function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authSuccess = document.getElementById('auth-success');
        const authError = document.getElementById('auth-error');
        
        // Reset status messages
        authSuccess.classList.add('hidden');
        authError.classList.add('hidden');
        
        if (!email || !password) {
          authError.textContent = 'Please enter both email and password';
          authError.classList.remove('hidden');
          return;
        }
        
        try {
          // Make login request
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            authError.textContent = data.message || 'Authentication failed';
            authError.classList.remove('hidden');
            return;
          }
          
          // Apply token to Swagger UI
          const token = data.token;
          window.ui.preauthorizeApiKey("BearerAuth", token);
          window.ui.preauthorizeApiKey("ApiKeyAuth", \`Bearer \${token}\`);
          
          // Show success message
          authSuccess.classList.remove('hidden');
          
          // Store token in localStorage for persistence
          localStorage.setItem('swagger_auth_token', token);
          
        } catch (error) {
          console.error('Authentication error:', error);
          authError.textContent = 'Error during authentication';
          authError.classList.remove('hidden');
        }
      });
      
      // Check for existing token in localStorage
      const savedToken = localStorage.getItem('swagger_auth_token');
      if (savedToken) {
        window.ui.preauthorizeApiKey("BearerAuth", savedToken);
        window.ui.preauthorizeApiKey("ApiKeyAuth", \`Bearer \${savedToken}\`);
        document.getElementById('auth-success').classList.remove('hidden');
      }
    };
  </script>
</body>
</html>
    `;
    
    return new NextResponse(swaggerHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 