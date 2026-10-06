<?php
// Shared setup: CORS, JSON helpers, database connection, user creation.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function out(array $d): void { echo json_encode($d); exit; }
function fail(string $m): void { out(['success' => false, 'message' => $m]); }
function body(): array { return json_decode(file_get_contents('php://input'), true) ?? []; }

// Any uncaught error is returned as JSON so the app can show it.
set_exception_handler(fn($e) => fail('Server error: ' . $e->getMessage()));

$pdo = new PDO('mysql:host=localhost;dbname=aeroguard;charset=utf8mb4', 'root', '', [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

const ROLES = ['Admin', 'Security', 'DRRM', 'Faculty'];

// Validates a user payload; returns an error message or null.
function check_user(array $b, bool $needPassword): ?string {
  if (trim($b['full_name'] ?? '') === '') return 'Full name is required.';
  $u = trim($b['username'] ?? '');
  if (strlen($u) < 4 || !preg_match('/^[A-Za-z0-9_]+$/', $u)) return 'Username must be 4+ characters: letters, numbers, underscore.';
  if (!in_array($b['user_type'] ?? '', ROLES, true)) return 'Role is required.';
  if (!filter_var(trim($b['email'] ?? ''), FILTER_VALIDATE_EMAIL)) return 'Please enter a valid email address.';
  $p = trim($b['phone'] ?? '');
  if ($p !== '' && !preg_match('/^09\d{9}$/', $p)) return 'Phone must start with 09 and be 11 digits.';
  $pw = $b['password'] ?? '';
  if (($needPassword || $pw !== '') && strlen($pw) < 8) return 'Password must be at least 8 characters.';
  return null;
}

// Creates an account (used by register.php and POST users.php).
function create_user(PDO $pdo, array $b): void {
  if ($err = check_user($b, true)) fail($err);
  $st = $pdo->prepare('SELECT 1 FROM users WHERE username = ? OR email = ?');
  $st->execute([trim($b['username']), trim($b['email'])]);
  if ($st->fetch()) fail('Username or email already exists.');
  $pdo->prepare('INSERT INTO users (username,password_hash,full_name,user_type,email,phone,building) VALUES (?,?,?,?,?,?,?)')
      ->execute([
        trim($b['username']), password_hash($b['password'], PASSWORD_BCRYPT), trim($b['full_name']),
        $b['user_type'], trim($b['email']), trim($b['phone'] ?? '') ?: null, trim($b['building'] ?? '') ?: null,
      ]);
}
