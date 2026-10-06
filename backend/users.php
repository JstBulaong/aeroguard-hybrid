<?php
// Users CRUD: GET (read), POST (create), PUT (update), DELETE (delete).
require 'config.php';
$method = $_SERVER['REQUEST_METHOD'];
$b = body();

if ($method === 'GET') {
  $rows = $pdo->query('SELECT user_id,username,full_name,user_type,email,phone,building,created_at FROM users ORDER BY user_id')->fetchAll();
  out(['success' => true, 'data' => $rows]);
}

if ($method === 'POST') {
  create_user($pdo, $b);
  out(['success' => true, 'message' => 'Account created.']);
}

if ($method === 'PUT') {
  $id = (int)($b['user_id'] ?? 0);
  if (!$id) fail('user_id required.');
  if ($err = check_user($b, false)) fail($err);
  $st = $pdo->prepare('SELECT 1 FROM users WHERE (username = ? OR email = ?) AND user_id <> ?');
  $st->execute([trim($b['username']), trim($b['email']), $id]);
  if ($st->fetch()) fail('Username or email already taken.');
  $pdo->prepare('UPDATE users SET full_name=?, username=?, user_type=?, email=?, phone=?, building=? WHERE user_id=?')
      ->execute([trim($b['full_name']), trim($b['username']), $b['user_type'], trim($b['email']),
                 trim($b['phone'] ?? '') ?: null, trim($b['building'] ?? '') ?: null, $id]);
  if (($b['password'] ?? '') !== '')
    $pdo->prepare('UPDATE users SET password_hash=? WHERE user_id=?')->execute([password_hash($b['password'], PASSWORD_BCRYPT), $id]);
  out(['success' => true, 'message' => 'Account updated.']);
}

if ($method === 'DELETE') {
  $id = (int)($b['user_id'] ?? 0);
  if (!$id) fail('User ID is required.');
  $pdo->prepare('DELETE FROM users WHERE user_id = ?')->execute([$id]);
  out(['success' => true, 'message' => 'User deleted.']);
}

fail('Unsupported method.');
