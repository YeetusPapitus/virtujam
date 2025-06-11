<?php
// contact_api.php

// Set CORS headers for all requests.
header("Access-Control-Allow-Origin: *"); // Adjust this to be your domain in production.
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests beyond the preflight.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed. Use POST."]);
    exit();
}

// Read the JSON input.
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Fall back to $_POST (if data isn't JSON)
if (empty($data)) {
    $data = $_POST;
}

// Validate required fields.
if (empty($data['firstname']) || empty($data['lastname']) || empty($data['email']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. All fields are required."]);
    exit();
}

$firstname = $data['firstname'];
$lastname  = $data['lastname'];
$email     = $data['email'];
$message   = $data['message'];

// Update credentials for your database.
$host     = "localhost";
$dbname   = "virtujam";
$username = "root"; // Replace with your MySQL username.
$password = ""; // Replace with your MySQL password.

try {
    // Connect to the database using PDO.
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Prepare and execute SQL query to insert the contact data.
$sql = "INSERT INTO contact (FirstName, LastName, Email, Message) VALUES (:firstname, :lastname, :email, :message)";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([
        ':firstname' => $firstname,
        ':lastname'  => $lastname,
        ':email'     => $email,
        ':message'   => $message,
    ]);
    http_response_code(201);
    echo json_encode(["message" => "Message sent successfully!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error inserting data: " . $e->getMessage()]);
}
