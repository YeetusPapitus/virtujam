<?php
// public/api/admin_login.php

header("Access-Control-Allow-Origin: *"); // In production, restrict this to your domain.
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


// Handle OPTIONS (preflight) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Only POST requests allowed."]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// For demonstration, use hard-coded credentials
$validUsername = 'admin';
$validPassword = 'admin';  // In production, store a hashed password!

if ($username === $validUsername && $password === $validPassword) {
    // Generate a token (in a real scenario, consider using JWT or sessions).
    $token = bin2hex(random_bytes(16));
    
    // For session-based auth, you could start a PHP session here:
    // session_start();
    // $_SESSION['adminLoggedIn'] = true;
    
    http_response_code(200);
    echo json_encode(["message" => "Login successful", "token" => $token]);
} else {
    http_response_code(401);
    echo json_encode(["message" => "Invalid username or password"]);
}
