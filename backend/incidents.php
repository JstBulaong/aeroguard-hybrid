<?php
// Incident reports (transaction): GET list, POST new report, PUT remarks / resolve.
require 'config.php';
$method = $_SERVER['REQUEST_METHOD'];
$b = body();

if ($method === 'GET') {
  $rows = $pdo->query('SELECT * FROM incidents ORDER BY created_at DESC, incident_id DESC LIMIT 100')->fetchAll();
  out(['success' => true, 'data' => $rows]);
}

if ($method === 'POST') {
  if (empty($b['device_id']) || empty($b['threat_level'])) fail('Device ID and threat level required.');
  if (!in_array($b['threat_level'], ['Gray', 'Yellow', 'Orange', 'Red'], true)) fail('Invalid threat level.');
  $pdo->prepare('INSERT INTO incidents (device_id,threat_level,pm25_value,pm10_value,temperature,humidity,confidence,location,response_action) VALUES (?,?,?,?,?,?,?,?,?)')
      ->execute([(int)$b['device_id'], $b['threat_level'], $b['pm25_value'] ?? null, $b['pm10_value'] ?? null,
                 $b['temperature'] ?? null, $b['humidity'] ?? null, $b['confidence'] ?? null,
                 $b['location'] ?? null, $b['response_action'] ?? null]);
  out(['success' => true, 'message' => 'Incident logged.', 'incident_id' => (int)$pdo->lastInsertId()]);
}

if ($method === 'PUT') {
  $id = (int)($b['incident_id'] ?? 0);
  if (!$id) fail('incident_id required.');
  if (array_key_exists('response_action', $b)) {
    $pdo->prepare('UPDATE incidents SET response_action=? WHERE incident_id=?')->execute([$b['response_action'], $id]);
    out(['success' => true, 'message' => 'Remarks saved.']);
  }
  $pdo->prepare('UPDATE incidents SET resolved=1, resolved_at=NOW() WHERE incident_id=?')->execute([$id]);
  out(['success' => true, 'message' => 'Incident resolved.']);
}

fail('Unsupported method.');
