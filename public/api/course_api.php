<?php
// public/api/course_api.php

header("Access-Control-Allow-Origin: *"); // For production, restrict this to your domain.
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration (adjust these values)
$host     = "localhost";
$dbname   = "virtujam";
$username = "root";  // Replace with your DB username
$password = "";      // Replace with your DB password

// Establish a PDO connection.
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// -------------------------
// GET: List all courses or a single course if '?id=' is provided
// -------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Return a single course with the given ID
        $stmt = $pdo->prepare(
            "SELECT c.IDCourse, c.Title, c.ImageID, i.ImageURL 
             FROM course c 
             LEFT JOIN Image i ON c.ImageID = i.IDImage 
             WHERE c.IDCourse = :id"
        );
        $stmt->execute([':id' => $_GET['id']]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($course) {
            http_response_code(200);
            echo json_encode($course);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Course not found"]);
        }
    } else {
        // Return all courses
        $stmt = $pdo->prepare(
            "SELECT c.IDCourse, c.Title, c.ImageID, i.ImageURL 
             FROM course c 
             LEFT JOIN Image i ON c.ImageID = i.IDImage"
        );
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($courses);
    }
    exit();
}

// -------------------------
// POST: Handles both creation and update (via _method override)
// -------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check for _method override to update (edit) an existing course.
    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
        // UPDATE (edit) branch
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Course ID is required"]);
            exit();
        }
        $id = $_GET['id'];
        
        // For multipart/form-data, Title should be in $_POST.
        $title = isset($_POST['Title']) ? trim($_POST['Title']) : '';
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["message" => "Title is required"]);
            exit();
        }
        
        // Check if a new image file is provided.
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            $imageFile = $_FILES['image'];
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($imageFile['type'], $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid image file type."]);
                exit();
            }
            $targetDir = __DIR__ . "/../../src/img/";
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $fileExtension = pathinfo($imageFile['name'], PATHINFO_EXTENSION);
            $newFileName = "course_" . time() . "." . $fileExtension;
            $targetFile = $targetDir . $newFileName;
            if (move_uploaded_file($imageFile['tmp_name'], $targetFile)) {
                $imageURL = "/src/img/" . $newFileName;
                // Insert new record into the Image table.
                $stmtImage = $pdo->prepare("INSERT INTO Image (ImageURL) VALUES (:imageURL)");
                $stmtImage->execute([':imageURL' => $imageURL]);
                $imageID = $pdo->lastInsertId();
            } else {
                http_response_code(500);
                echo json_encode(["message" => "File upload failed"]);
                exit();
            }
        } else {
            // If no new file is uploaded, retain the existing image ID sent as hidden field.
            $imageID = isset($_POST['ImageID']) ? $_POST['ImageID'] : null;
        }
        
        // Update the existing course.
        $stmt = $pdo->prepare("UPDATE course SET Title = :title, ImageID = :imageID WHERE IDCourse = :id");
        try {
            $stmt->execute([':title' => $title, ':imageID' => $imageID, ':id' => $id]);
            http_response_code(200);
            echo json_encode(["message" => "Course updated successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error updating course: " . $e->getMessage()]);
        }
        exit();
    } else {
        // NEW COURSE creation branch
        // Determine if an image file is uploaded (multipart/form-data)
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            // Retrieve Title from the form fields
            $title = isset($_POST['Title']) ? $_POST['Title'] : '';
            if (empty($title)) {
                http_response_code(400);
                echo json_encode(["message" => "Title is required"]);
                exit();
            }
            
            // Process the file upload.
            $imageFile = $_FILES['image'];
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($imageFile['type'], $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid image file type."]);
                exit();
            }
            
            $targetDir = __DIR__ . "/../../src/img/";
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            
            $fileExtension = pathinfo($imageFile['name'], PATHINFO_EXTENSION);
            $newFileName = "course_" . time() . "." . $fileExtension;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($imageFile['tmp_name'], $targetFile)) {
                $imageURL = "/src/img/" . $newFileName;
                // Insert record in the Image table.
                $stmtImage = $pdo->prepare("INSERT INTO Image (ImageURL) VALUES (:imageURL)");
                $stmtImage->execute([':imageURL' => $imageURL]);
                $newImageID = $pdo->lastInsertId();
                $imageID = $newImageID;
            } else {
                http_response_code(500);
                echo json_encode(["message" => "File upload failed"]);
                exit();
            }
        } else {
            // If no file upload, expect JSON input.
            $data = json_decode(file_get_contents("php://input"), true);
            $title = $data['Title'] ?? '';
            $imageID = $data['ImageID'] ?? null;
        }
        
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["message" => "Title is required"]);
            exit();
        }
        
        // Insert new course record.
        $stmt = $pdo->prepare("INSERT INTO course (Title, ImageID) VALUES (:title, :imageID)");
        try {
            $stmt->execute([':title' => $title, ':imageID' => $imageID]);
            $newCourseID = $pdo->lastInsertId();
            http_response_code(201);
            echo json_encode(["message" => "Course added successfully", "IDCourse" => $newCourseID]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error adding course: " . $e->getMessage()]);
        }
        exit();
    }
}

// -------------------------
// DELETE: Remove a course (expects a query parameter "id")
// -------------------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Course ID is required"]);
        exit();
    }
    $id = $_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM course WHERE IDCourse = :id");
    try {
        $stmt->execute([':id' => $id]);
        http_response_code(200);
        echo json_encode(["message" => "Course deleted successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error deleting course: " . $e->getMessage()]);
    }
    exit();
}

// If the request method is not handled, return 405.
http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
exit();

?>