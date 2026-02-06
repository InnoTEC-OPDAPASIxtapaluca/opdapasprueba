<?php
require_once 'conexion.php';

$database = new Database();
$db = $database->getConnection();

// Contraseña por defecto (en producción usar password_hash)
$password_default = password_hash("123456", PASSWORD_DEFAULT);

// Datos de prueba para cada área
$datos_prueba = [
    'recursos_humanos' => [
        ['Juan', 'Pérez', 'Gómez', 'RH001', 'jefe'],
        ['María', 'López', 'Hernández', 'RH002', 'empleado'],
        ['Carlos', 'García', 'Martínez', 'RH003', 'empleado']
    ],
    'finanzas' => [
        ['Ana', 'Rodríguez', 'Sánchez', 'FIN001', 'jefe'],
        ['Pedro', 'Martínez', 'González', 'FIN002', 'empleado'],
        ['Laura', 'Díaz', 'Ramírez', 'FIN003', 'empleado']
    ],
    'tecnologia' => [
        ['Roberto', 'Sánchez', 'Torres', 'TEC001', 'jefe'],
        ['Patricia', 'Castro', 'Vargas', 'TEC002', 'empleado'],
        ['Jorge', 'Mendoza', 'Ruiz', 'TEC003', 'empleado']
    ],
    'servicio_social' => [
        ['Gabriela', 'Ortiz', 'Flores', 'SS001', 'jefe'],
        ['Fernando', 'Ríos', 'Cruz', 'SS002', 'empleado'],
        ['Sofía', 'Morales', 'Álvarez', 'SS003', 'empleado']
    ],
    'administracion' => [
        ['Miguel', 'Vega', 'Reyes', 'ADM001', 'jefe'],
        ['Carmen', 'Guerrero', 'Mendoza', 'ADM002', 'empleado'],
        ['Ricardo', 'Navarro', 'Silva', 'ADM003', 'empleado']
    ]
];

foreach ($datos_prueba as $area => $empleados) {
    $tabla = $area;
    
    foreach ($empleados as $empleado) {
        $query = "INSERT INTO $tabla (nombre, apellido_paterno, apellido_materno, no_nomina, tipo_rol, password_hash, area) 
                  VALUES (:nombre, :ap, :am, :nomina, :rol, :pass, :area)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":nombre", $empleado[0]);
        $stmt->bindParam(":ap", $empleado[1]);
        $stmt->bindParam(":am", $empleado[2]);
        $stmt->bindParam(":nomina", $empleado[3]);
        $stmt->bindParam(":rol", $empleado[4]);
        $stmt->bindParam(":pass", $password_default);
        $stmt->bindParam(":area", $area);
        
        try {
            $stmt->execute();
            echo "Insertado: {$empleado[0]} {$empleado[1]} en {$area}<br>";
        } catch(PDOException $e) {
            echo "Error en {$area}: " . $e->getMessage() . "<br>";
        }
    }
}

echo "<br>Datos de prueba insertados exitosamente!";
?>