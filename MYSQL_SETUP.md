# Configuração MySQL (Alternativa ao SQLite)

Se preferir usar MySQL em vez de SQLite, siga estes passos:

## 1. Instalar MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server php-mysql

# macOS
brew install mysql
brew services start mysql

# Windows: Baixar MySQL Installer
```

## 2. Criar banco de dados
```sql
mysql -u root -p

CREATE DATABASE sistema_avaliacoes;
CREATE USER 'avaliacoes_user'@'localhost' IDENTIFIED BY 'avaliacoes_password';
GRANT ALL PRIVILEGES ON sistema_avaliacoes.* TO 'avaliacoes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Atualizar .env no backend
Edite `sistema-avaliacoes-api/.env`:
```env
# Comentar SQLite
# DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"

# Descomentar MySQL
DATABASE_URL="mysql://avaliacoes_user:avaliacoes_password@127.0.0.1:3306/sistema_avaliacoes?serverVersion=8.0.32&charset=utf8mb4"
```

## 4. Executar setup
```bash
npm run setup
```
