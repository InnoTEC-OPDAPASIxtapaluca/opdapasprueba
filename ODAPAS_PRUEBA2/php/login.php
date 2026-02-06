<?php
header('Content-Type: application/json');
require_once 'conexion.php';

session_start();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->area) || !isset($data->tipo_rol) || !isset($data->no_nomina) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

// Determinar qué tabla consultar según el área
$tablas_areas = [
    'recursos_humanos' => 'recursos_humanos',
    'finanzas' => 'finanzas',
    'tecnologia' => 'tecnologia',
    'servicio_social' => 'servicio_social',
    'administracion' => 'administracion'
];

if (!isset($tablas_areas[$data->area])) {
    echo json_encode(["success" => false, "message" => "Área no válida"]);
    exit;
}

$tabla = $tablas_areas[$data->area];

// Consultar usuario
$query = "SELECT * FROM $tabla WHERE no_nomina = :no_nomina AND tipo_rol = :tipo_rol AND activo = 1";
$stmt = $db->prepare($query);
$stmt->bindParam(":no_nomina", $data->no_nomina);
$stmt->bindParam(":tipo_rol", $data->tipo_rol);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar contraseña (en producción usar password_hash/password_verify)
    // Para prueba, usamos contraseña simple "123456"
    if ($data->password === "123456" || password_verify($data->password, $usuario['password_hash'])) {
        
        // Registrar log de acceso
        $ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        
        $log_query = "INSERT INTO logs_acceso (no_nomina, area, tipo_rol, ip_address, user_agent) 
                      VALUES (:no_nomina, :area, :tipo_rol, :ip, :ua)";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->bindParam(":no_nomina", $data->no_nomina);
        $log_stmt->bindParam(":area", $data->area);
        $log_stmt->bindParam(":tipo_rol", $data->tipo_rol);
        $log_stmt->bindParam(":ip", $ip);
        $log_stmt->bindParam(":ua", $user_agent);
        $log_stmt->execute();
        
        // Crear sesión
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['no_nomina'] = $usuario['no_nomina'];
        $_SESSION['nombre'] = $usuario['nombre'];
        $_SESSION['apellido_paterno'] = $usuario['apellido_paterno'];
        $_SESSION['apellido_materno'] = $usuario['apellido_materno'];
        $_SESSION['tipo_rol'] = $usuario['tipo_rol'];
        $_SESSION['area'] = $usuario['area'];
        
echo json_encode([
    "success" => true,
    "message" => "Login exitoso",
    "usuario" => [
        "nombre" => $usuario['nombre'],
        "apellido_paterno" => $usuario['apellido_paterno'],
        "apellido_materno" => $usuario['apellido_materno'],
        "no_nomina" => $usuario['no_nomina'],
        "tipo_rol" => $usuario['tipo_rol'],
        "area" => $usuario['area']
    ]
]);
    } else {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
?>