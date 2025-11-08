<?php
// PHP Backend for Email Subscription
// File: api.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_file = 'subscribers.db';

// Create SQLite connection
try {
    $db = new PDO('sqlite:' . $db_file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create table if not exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT
        )
    ");
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($method) {
    case 'POST':
        if ($action === 'subscribe' || !$action) {
            handleSubscribe($db);
        }
        break;
        
    case 'GET':
        if ($action === 'list') {
            handleGetSubscribers($db);
        } elseif ($action === 'count') {
            handleGetCount($db);
        }
        break;
        
    case 'DELETE':
        if ($action === 'delete') {
            handleDeleteSubscriber($db);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

// Handle subscribe
function handleSubscribe($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = isset($data['email']) ? trim($data['email']) : '';
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please provide a valid email address'
        ]);
        return;
    }
    
    // Get client info
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    
    try {
        $stmt = $db->prepare("INSERT INTO subscribers (email, ip_address, user_agent) VALUES (?, ?, ?)");
        $stmt->execute([$email, $ipAddress, $userAgent]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! We\'ll notify you when we launch! 🚀',
            'subscriberId' => $db->lastInsertId()
        ]);
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
            echo json_encode([
                'success' => false,
                'message' => 'This email is already subscribed!'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save email. Please try again.'
            ]);
        }
    }
}

// Handle get subscribers
function handleGetSubscribers($db) {
    try {
        $stmt = $db->query("SELECT id, email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC");
        $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'count' => count($subscribers),
            'subscribers' => $subscribers
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch subscribers'
        ]);
    }
}

// Handle get count
function handleGetCount($db) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM subscribers");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'count' => (int)$result['count']
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to get count'
        ]);
    }
}

// Handle delete subscriber
function handleDeleteSubscriber($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = isset($data['email']) ? trim($data['email']) : '';
    
    if (empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Email is required'
        ]);
        return;
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM subscribers WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Subscriber deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Subscriber not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete subscriber'
        ]);
    }
}
?>
