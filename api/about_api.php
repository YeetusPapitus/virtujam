<?php
// public/api/about_api.php

header("Access-Control-Allow-Origin: *"); // In production, restrict to your domain.
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration (update these with your credentials)
$host     = "localhost";
$dbname   = "virtujam";
$username = "root"; // Replace with your database username
$password = ""; // Replace with your database password

// Establish the PDO connection.
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// ------------------
// GET Request: Fetch About content
// ------------------
// Handle GET requests: fetch the About content with the joined Image URL
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Join About with Image table to get ImageURL from Image where applicable.
    $stmt = $pdo->prepare(
        "SELECT a.IDAbout, a.Title, a.Text, a.ImageID, i.ImageURL 
        FROM About a 
        LEFT JOIN Image i ON a.ImageID = i.IDImage 
        WHERE a.IDAbout = 1 LIMIT 1"
    );
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "About content not found"]);
    }
    exit();
}


// ------------------
// POST Request: Insert or update About content and process image upload if provided
// ------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Determine if this is a multipart form upload with a file.
    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        // Data comes in via multipart/form-data.
        $title = isset($_POST['Title']) ? $_POST['Title'] : '';
        $text  = isset($_POST['Text']) ? $_POST['Text'] : '';
        
        // Process the image file.
        $imageFile = $_FILES['image'];
        
        // Allowed MIME types (add more if needed)
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($imageFile['type'], $allowedMimeTypes)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid image file type."]);
            exit();
        }
        
        // Define the target directory.
        // Adjust the path based on your project structure.
        // Here we assume that this file is in /public/api and that the target folder is /src/img relative to the project root.
        $targetDir = __DIR__ . "/../../src/img/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        
        // Create a unique filename using the current timestamp.
        $fileExtension = pathinfo($imageFile['name'], PATHINFO_EXTENSION);
        $newFileName   = "about_" . time() . "." . $fileExtension;
        $targetFile    = $targetDir . $newFileName;
        
        // Move the uploaded file.
        if (move_uploaded_file($imageFile['tmp_name'], $targetFile)) {
            // Construct the URL for the image.
            // This assumes that your /src/img folder is accessible via the URL path /src/img/
            $imageURL = "/src/img/" . $newFileName;
            
            // Insert a new record into the Image table.
            $sql_image = "INSERT INTO Image (ImageURL) VALUES (:imageURL)";
            $stmt_image = $pdo->prepare($sql_image);
            $stmt_image->execute([':imageURL' => $imageURL]);
            
            // Get the newly inserted Image ID.
            $newImageID = $pdo->lastInsertId();
            $imageID = $newImageID;
        } else {
            http_response_code(500);
            echo json_encode(["message" => "File upload failed."]);
            exit();
        }
    } else {
        // If no file was sent, assume that JSON data was submitted.
        $data = json_decode(file_get_contents("php://input"), true);
        $title = $data['Title'] ?? '';
        $text  = $data['Text'] ?? '';
        $imageID = $data['ImageID'] ?? null;
    }
    
    // Validate that Title and Text are provided.
    if (empty($title) || empty($text)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing Title or Text"]);
        exit();
    }
    
    // Upsert the About content (for IDAbout = 1).
    $sql = "INSERT INTO About (IDAbout, Title, Text, ImageID)
            VALUES (1, :title, :text, :imageID)
            ON DUPLICATE KEY UPDATE
                Title   = VALUES(Title),
                Text    = VALUES(Text),
                ImageID = VALUES(ImageID)";
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute([
            ':title'   => $title,
            ':text'    => $text,
            ':imageID' => $imageID
        ]);
        http_response_code(200);
        echo json_encode(["message" => "About content updated successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Update failed: " . $e->getMessage()]);
    }
    exit();
}

// If method is neither GET nor POST, return 405.
http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
exit();
