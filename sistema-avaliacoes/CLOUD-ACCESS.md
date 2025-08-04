# 🌐 Acesso em Ambiente Cloud

## 🚨 Problema: URLs não acessíveis via localhost

Se após o deploy bem-sucedido você não consegue acessar:
- http://localhost:4200 (Frontend)
- http://localhost:8081 (API)
- http://localhost:8081/health (Health)

## ☁️ Solução para Ambiente Cloud

### 1. **Deploy Cloud Otimizado**
```bash
cd sistema-avaliacoes
./deploy.sh cloud
```

### 2. **URLs Alternativas**
Substitua `localhost` por:
- **IP do Host**: `hostname -I` ou `ifconfig`
- **Domínio Cloud**: Seu domínio fly.dev ou similar
- **IP Público**: IP público da instância

### 3. **Verificar Conectividade**
```bash
./check-access.sh
```

## 🔧 Configurações Cloud Específicas

### Frontend (Angular)
- ✅ Bind em `0.0.0.0:4200`
- ✅ `--disable-host-check` para aceitar qualquer host
- ✅ `--poll=2000` para ambientes cloud

### API (Nginx + PHP)
- ✅ CORS configurado para `*` (desenvolvimento)
- ✅ Health check em `/health`
- ✅ Bind em `0.0.0.0:80` (exposto como 8081)

### Portas Expostas
| Serviço | Porta Interna | Porta Externa | URL |
|---------|---------------|---------------|-----|
| Frontend | 4200 | 4200 | http://HOST:4200 |
| API | 80 | 8081 | http://HOST:8081 |
| Database | 5432 | 5433 | HOST:5433 |
| Redis | 6379 | 6380 | HOST:6380 |
| Adminer | 8080 | 8083 | http://HOST:8083 |

## 🎯 Identificar seu HOST

### Método 1: IP da Máquina
```bash
hostname -I | awk '{print $1}'
# ou
ifconfig | grep 'inet ' | grep -v 127.0.0.1
```

### Método 2: IP Público (se cloud)
```bash
curl ifconfig.me
```

### Método 3: Domínio Cloud
Se você está no fly.dev, Heroku, etc:
- Use o domínio fornecido pela plataforma
- Ex: `https://your-app.fly.dev:4200`

## 🐳 Verificar Containers

### Status dos Containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Logs dos Serviços
```bash
# Frontend
docker-compose -f docker-compose.cloud.yml logs -f frontend-dev

# API
docker-compose -f docker-compose.cloud.yml logs -f nginx-api-dev

# Backend
docker-compose -f docker-compose.cloud.yml logs -f backend-dev
```

## ⚡ Quick Fix

### Se ainda não funcionar:
1. **Parar containers existentes**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Usar configuração cloud**:
   ```bash
   ./deploy.sh cloud
   ```

3. **Verificar acessibilidade**:
   ```bash
   ./check-access.sh
   ```

4. **Testar URLs alternativas**:
   - `http://0.0.0.0:4200`
   - `http://[SEU_IP]:4200`
   - `http://[SEU_DOMINIO]:4200`

## 🔒 Configuração de Firewall

Se estiver em uma VM ou cloud, verifique:
- Portas 4200, 8081, 5433 estão abertas
- Security groups permitem tráfego HTTP
- Firewall local não está bloqueando

## 📞 Suporte

Se o problema persistir:
1. Execute `./diagnose-containers.sh`
2. Verifique logs: `docker-compose logs`
3. Teste conectividade interna: `docker exec -it container_name sh`
