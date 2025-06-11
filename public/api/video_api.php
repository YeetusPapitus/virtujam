<?php
// public/api/video_api.php

header("Access-Control-Allow-Origin: *"); // In production, restrict this to your domain.
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database configuration (adjust these values)
$host     = "localhost";
$dbname   = "virtujam";
$username = "root";  // Change if needed
$password = "";      // Change if needed

// Establish a PDO connection.
try {
    $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// -------------------------
// GET: List all videos or a single video if '?id=' is provided
// -------------------------
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_GET["id"])) {
        // Return a single video with the given ID
        $stmt = $pdo->prepare("SELECT * FROM video WHERE IDVideo = :id");
        $stmt->execute([':id' => $_GET["id"]]);
        $video = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($video) {
            http_response_code(200);
            echo json_encode($video);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Video not found"]);
        }
    } else {
        // Return all videos
        $stmt = $pdo->prepare("SELECT * FROM video");
        $stmt->execute();
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($videos);
    }
    exit();
}

// -------------------------
// POST: This branch handles both creation and update 
// (Update requests use POST with a hidden _method field set to "PUT")
// -------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Check if this is an update request via method override
    if (isset($_POST["_method"]) && $_POST["_method"] === "PUT") {
        // ----- UPDATE (Edit) Request -----
        if (!isset($_GET["id"])) {
            http_response_code(400);
            echo json_encode(["message" => "Video ID is required"]);
            exit();
        }
        $id = $_GET["id"];
        
        // Since this is a multipart/form-data request, fields are in $_POST
        $title       = isset($_POST["Title"]) ? trim($_POST["Title"]) : "";
        $description = isset($_POST["Description"]) ? $_POST["Description"] : "";
        $videoURL    = isset($_POST["VideoURL"]) ? $_POST["VideoURL"] : "";
        $courseID    = isset($_POST["CourseID"]) ? $_POST["CourseID"] : "";
        
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["message" => "Title is required"]);
            exit();
        }
        
        // Process new thumbnail if provided; otherwise, keep the existing ImageURL (sent via hidden field)
        if (isset($_FILES["image"]) && $_FILES["image"]["error"] !== UPLOAD_ERR_NO_FILE) {
            $imageFile = $_FILES["image"];
            $allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!in_array($imageFile["type"], $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid image file type."]);
                exit();
            }
            $targetDir = __DIR__ . "/../../src/img/";
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $fileExtension = pathinfo($imageFile["name"], PATHINFO_EXTENSION);
            $newFileName   = "video_" . time() . "." . $fileExtension;
            $targetFile    = $targetDir . $newFileName;
            if (move_uploaded_file($imageFile["tmp_name"], $targetFile)) {
                // New thumbnail path
                $imageURL_value = "/src/img/" . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(["message" => "File upload failed"]);
                exit();
            }
        } else {
            // Retain existing ImageURL if no new file is provided
            $imageURL_value = isset($_POST["ImageURL"]) ? $_POST["ImageURL"] : null;
        }
        
        // Update the video record
        $stmt = $pdo->prepare("UPDATE video SET Title = :title, Description = :description, VideoURL = :videoURL, ImageURL = :imageURL, CourseID = :courseID WHERE IDVideo = :id");
        try {
            $stmt->execute([
                ':title'       => $title,
                ':description' => $description,
                ':videoURL'    => $videoURL,
                ':imageURL'    => $imageURL_value,
                ':courseID'    => $courseID,
                ':id'          => $id
            ]);
            http_response_code(200);
            echo json_encode(["message" => "Video updated successfully"]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error updating video: " . $e->getMessage()]);
        }
        exit();
    } else {
        // ----- NEW VIDEO Creation Branch -----
        // Process file upload if provided
        if (isset($_FILES["image"]) && $_FILES["image"]["error"] !== UPLOAD_ERR_NO_FILE) {
            $title       = isset($_POST["Title"]) ? $_POST["Title"] : "";
            $description = isset($_POST["Description"]) ? $_POST["Description"] : "";
            $videoURL    = isset($_POST["VideoURL"]) ? $_POST["VideoURL"] : "";
            $courseID    = isset($_POST["CourseID"]) ? $_POST["CourseID"] : "";
            
            if (empty($title)) {
                http_response_code(400);
                echo json_encode(["message" => "Title is required"]);
                exit();
            }
            
            $imageFile = $_FILES["image"];
            $allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!in_array($imageFile["type"], $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid image file type."]);
                exit();
            }
            $targetDir = __DIR__ . "/../../src/img/";
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $fileExtension = pathinfo($imageFile["name"], PATHINFO_EXTENSION);
            $newFileName   = "video_" . time() . "." . $fileExtension;
            $targetFile    = $targetDir . $newFileName;
            if (move_uploaded_file($imageFile["tmp_name"], $targetFile)) {
                $imageURL_value = "/src/img/" . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(["message" => "File upload failed"]);
                exit();
            }
        } else {
            // If no file is uploaded, expect JSON input.
            $data = json_decode(file_get_contents("php://input"), true);
            $title       = $data["Title"] ?? "";
            $description = $data["Description"] ?? "";
            $videoURL    = $data["VideoURL"] ?? "";
            $courseID    = $data["CourseID"] ?? "";
            $imageURL_value = $data["ImageURL"] ?? null;
        }
        
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["message" => "Title is required"]);
            exit();
        }
        
        // Insert new video record.
        $stmt = $pdo->prepare("INSERT INTO video (Title, Description, VideoURL, ImageURL, CourseID) VALUES (:title, :description, :videoURL, :imageURL, :courseID)");
        try {
            $stmt->execute([
                ':title'       => $title,
                ':description' => $description,
                ':videoURL'    => $videoURL,
                ':imageURL'    => $imageURL_value,
                ':courseID'    => $courseID
            ]);
            $newID = $pdo->lastInsertId();
            http_response_code(201);
            echo json_encode(["message" => "Video added successfully", "IDVideo" => $newID]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error adding video: " . $e->getMessage()]);
        }
        exit();
    }
}

// -------------------------
// DELETE: Remove a video (expects a query parameter "id")
// -------------------------
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["message" => "Video ID is required"]);
        exit();
    }
    $id = $_GET["id"];
    $stmt = $pdo->prepare("DELETE FROM video WHERE IDVideo = :id");
    try {
        $stmt->execute([':id' => $id]);
        http_response_code(200);
        echo json_encode(["message" => "Video deleted successfully"]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error deleting video: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
exit();
