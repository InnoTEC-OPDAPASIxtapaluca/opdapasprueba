<?php
class Database {
    private $host = "localhost";
    private $db_name = "odapas_prueba2";
    private $username = "root";
    private $password = "";
    private $conn;
    
    // Configuración para Google Sheets API
    private $google_sheets_api_url = "https://script.google.com/macros/s/AKfycbw7505JH6qHBZ5MrkWpK0_04Or89Rl6CDf765co-QyRI7MIUFv_xZN6CsQ6W1cXDEbSsg/exec";
    private $use_google_sheets = true; // Cambia a true para usar Google Sheets

    public function getConnection() {
        if ($this->use_google_sheets) {
            // Usar Google Sheets como fuente de datos
            return $this->getGoogleSheetsConnection();
        } else {
            // Usar MySQL tradicional
            return $this->getMySQLConnection();
        }
    }

    private function getMySQLConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Error de conexión MySQL: " . $exception->getMessage();
        }

        return $this->conn;
    }

    private function getGoogleSheetsConnection() {
        // Retornamos un objeto que simula la conexión pero usa Google Sheets
        return (object) [
            'api_url' => $this->google_sheets_api_url,
            'type' => 'google_sheets'
        ];
    }

    // Método para autenticar usuario con Google Sheets
    public function authenticateWithGoogleSheets($no_nomina, $password) {
        if (!$this->use_google_sheets) {
            return false;
        }

        $url = $this->google_sheets_api_url;
        
        // Preparar datos para la solicitud
        $postData = http_build_query([
            'action' => 'login',
            'no_nomina' => $no_nomina,
            'password' => $password
        ]);

        // Configurar opciones para cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        // Ejecutar la solicitud
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200 && $response) {
            $data = json_decode($response, true);
            if (isset($data['success']) && $data['success']) {
                return $data['user'];
            }
        }

        return false;
    }

    // Método para obtener usuario por ID o nómina
    public function getUserFromGoogleSheets($id = null, $no_nomina = null) {
        if (!$this->use_google_sheets) {
            return false;
        }

        $url = $this->google_sheets_api_url;
        
        $params = ['action' => 'get_user'];
        if ($id) $params['id'] = $id;
        if ($no_nomina) $params['no_nomina'] = $no_nomina;

        $url .= '?' . http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200 && $response) {
            $data = json_decode($response, true);
            if (isset($data['success']) && $data['success']) {
                return $data['user'];
            }
        }

        return false;
    }
}

// Ejemplo de uso en tu archivo de login
function loginUser($no_nomina, $password) {
    $database = new Database();
    
    // Si quieres usar Google Sheets, cambia $use_google_sheets a true
    $database->use_google_sheets = true; // Cambia esto según necesites
    
    if ($database->use_google_sheets) {
        // Autenticar con Google Sheets
        $user = $database->authenticateWithGoogleSheets($no_nomina, $password);
        
        if ($user) {
            // Iniciar sesión
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nombre'] = $user['nombre'];
            $_SESSION['user_role'] = $user['tipo_rol'];
            $_SESSION['user_area'] = $user['area'];
            
            return [
                'success' => true,
                'user' => $user
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ];
        }
    } else {
        // Usar MySQL tradicional
        $conn = $database->getConnection();
        
        // Tu código de login tradicional con MySQL aquí
        $query = "SELECT * FROM administracion WHERE no_nomina = :no_nomina AND activo = 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':no_nomina', $no_nomina);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificar contraseña (asegúrate de usar password_verify si usas bcrypt)
            if (password_verify($password, $user['password_hash'])) {
                // Eliminar hash de la contraseña por seguridad
                unset($user['password_hash']);
                
                // Iniciar sesión
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_nombre'] = $user['nombre'];
                $_SESSION['user_role'] = $user['tipo_rol'];
                $_SESSION['user_area'] = $user['area'];
                
                return [
                    'success' => true,
                    'user' => $user
                ];
            }
        }
        
        return [
            'success' => false,
            'message' => 'Credenciales incorrectas'
        ];
    }
}
?>

