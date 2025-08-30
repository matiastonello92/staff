// Test script per la funzione send-invitation
const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2NTI5MzA5LCJpYXQiOjE3NTY1MjU3MDksImlzcyI6Imh0dHBzOi8vandjbG1kaXZ1d2dmanJ3dmd0aWEuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoibWF0aWFzQHBlY29yYW5lZ3JhLmZyIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJ";

const testPayload = {
  email: "mario.rossi@example.com",
  firstName: "Mario",
  lastName: "Rossi", 
  roles: [
    {
      roleId: "550e8400-e29b-41d4-a716-446655440013", // Chef de Cuisine
      locationId: "550e8400-e29b-41d4-a716-446655440001" // Menton
    }
  ],
  notes: "Test invitation for Chef de Cuisine at Menton",
  expiresInDays: 7
};

console.log("🚀 Testing send-invitation Edge Function...");
console.log("📧 Payload:", JSON.stringify(testPayload, null, 2));

fetch("https://jwchmdivuwgfjrwvgtia.supabase.co/functions/v1/send-invitation", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": token
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log("📊 Response Status:", response.status);
  console.log("📊 Response Headers:", Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log("📨 Response Body:", data);
  try {
    const json = JSON.parse(data);
    console.log("✅ Parsed JSON:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("⚠️ Response is not JSON");
  }
})
.catch(error => {
  console.error("❌ Error:", error);
});
