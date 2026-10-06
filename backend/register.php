<?php
require 'config.php';
create_user($pdo, body());
out(['success' => true, 'message' => 'Account created. You can now log in.']);
