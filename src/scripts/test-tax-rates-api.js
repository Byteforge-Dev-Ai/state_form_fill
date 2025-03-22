const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const AUTH_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const TAX_RATES_ENDPOINT = `${BASE_URL}/v1/tax-rates`;

// Login credentials
const credentials = {
  email: "admin2@example.com",
  password: "admin123"
};

// Test function
async function testTaxRatesAPI() {
  try {
    // Step 1: Login to get auth token
    console.log('Logging in...');
    const loginResponse = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('Login response status:', loginResponse.status);
    
    // Log the raw response for debugging
    const rawLoginResponse = await loginResponse.text();
    console.log('Raw login response:', rawLoginResponse);
    
    // Try parsing the response as JSON
    let tokenData;
    try {
      tokenData = JSON.parse(rawLoginResponse);
      console.log('Login response parsed as JSON:', tokenData);
    } catch (e) {
      console.error('Failed to parse login response as JSON');
      return;
    }
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${JSON.stringify(tokenData)}`);
    }
    
    const token = tokenData.token;
    if (!token) {
      throw new Error('No token in response');
    }
    
    console.log('Login successful, token received');
    
    // Step 2: Test GET /api/v1/tax-rates
    console.log('\nTesting GET /api/v1/tax-rates');
    const getRatesResponse = await fetch(TAX_RATES_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('GET tax rates response status:', getRatesResponse.status);
    
    // Log the raw response for debugging
    const rawGetRatesResponse = await getRatesResponse.text();
    console.log('Raw GET tax rates response (first 500 chars):', rawGetRatesResponse.substring(0, 500));
    
    if (!getRatesResponse.ok) {
      throw new Error(`GET tax rates failed with status ${getRatesResponse.status}`);
    }
    
    // Try parsing the response as JSON
    let taxRatesData;
    try {
      taxRatesData = JSON.parse(rawGetRatesResponse);
      console.log('Tax rates response parsed as JSON');
    } catch (e) {
      console.error('Failed to parse tax rates response as JSON');
      return;
    }
    
    console.log('Current tax rate:', JSON.stringify(taxRatesData.current_rate, null, 2));
    console.log(`Found ${taxRatesData.previous_rates.length} previous tax rates`);
    
    // Step 3: Test GET /api/v1/tax-rates/effective-on/:date
    const testDate = '2023-06-01';
    console.log(`\nTesting GET /api/v1/tax-rates/effective-on/${testDate}`);
    const getEffectiveResponse = await fetch(`${TAX_RATES_ENDPOINT}/effective-on/${testDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (getEffectiveResponse.status === 404) {
      console.log(`No tax rate found for date: ${testDate}`);
    } else if (!getEffectiveResponse.ok) {
      const error = await getEffectiveResponse.json();
      throw new Error(`GET effective tax rate failed: ${JSON.stringify(error)}`);
    } else {
      const effectiveRateData = await getEffectiveResponse.json();
      console.log('Tax rate effective on date:', JSON.stringify(effectiveRateData, null, 2));
    }
    
    // Step 4: Test POST /api/v1/tax-rates (create new tax rate)
    // Only run this if you want to create a new rate - commenting out by default
    /*
    console.log('\nTesting POST /api/v1/tax-rates');
    const newTaxRate = {
      rate: 0.0650,
      multiplier: 1.18,
      effective_from: '2025-01-01'
    };
    
    const createRateResponse = await fetch(TAX_RATES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTaxRate)
    });
    
    if (!createRateResponse.ok) {
      const error = await createRateResponse.json();
      throw new Error(`POST tax rate failed: ${JSON.stringify(error)}`);
    }
    
    const newRateData = await createRateResponse.json();
    console.log('Created new tax rate:', JSON.stringify(newRateData, null, 2));
    */
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during API testing:', error.message);
  }
}

// Run the test
testTaxRatesAPI(); 