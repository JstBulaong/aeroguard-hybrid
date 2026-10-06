<?php
require 'config.php';
$b = body();
$username = trim($b['username'] ?? ''); $password = $b['password'] ?? '';
if ($username === '' || $password === '') fail('Username and password required.');
$st = $pdo->prepare('SELECT * FROM users WHERE username = ?');
$st->execute([$username]);
$u = $st->fetch();
if (!$u || !password_verify($password, $u['password_hash'])) fail('Incorrect username or password.');
unset($u['password_hash']);
out(['success' => true, 'message' => 'Logged in.', 'user' => $u]);
