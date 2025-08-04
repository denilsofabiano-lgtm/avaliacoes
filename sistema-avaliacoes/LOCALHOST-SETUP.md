# 🏠 Configuração para Localhost (127.0.0.1)

## 🎯 Problema: Portas não aparecendo no nmap

Se você executou `nmap localhost` e as portas 4200 e 8081 não aparecem, mesmo com containers rodando, use esta configuração específica para localhost.

## ✅ Solução Completa

### 1. **Limpar Conflitos (Recomendado)**
```bash
./clean-ports.sh
```

### 2. **Deploy Local**
```bash
./deploy.sh local
```

### 3. **Verificar Acesso**
```bash
./check-localhost.sh
```

## 🔧 Configuração Específica Local

### docker-compose.local.yml
- ✅ **Port binding**: `127.0.0.1:4200:4200` (específico para localhost)
- ✅ **Network isolada**: `avaliacoes-local-network`
- ✅ **Containers nomeados**: `*-local` para evitar conflitos
- ✅ **CORS configurado**: Para `http://localhost:4200`

### Diferenças das outras configurações:
| Arquivo | Uso | Port Binding |
|---------|-----|--------------|
| docker-compose.dev.yml | Desenvolvimento geral | `4200:4200` |
| docker-compose.cloud.yml | Ambiente cloud | `4200:4200` |
| **docker-compose.local.yml** | **Localhost específico** | **`127.0.0.1:4200:4200`** |

## 🌐 URLs de Acesso

Após deploy local bem-sucedido:
- ✅ **Frontend**: http://localhost:4200
- ✅ **API**: http://localhost:8081
- ✅ **Health Check**: http://localhost:8081/health
- ✅ **Debug Info**: http://localhost:8081/debug
- ✅ **Database**: localhost:5433
- ✅ **Adminer**: http://localhost:8083

## 🔍 Verificação de Portas

### nmap após deploy local:
```bash
nmap -p 4200,8081,5433,6380,8083 localhost
```

**Resultado esperado:**
```
PORT     STATE SERVICE
4200/tcp open  unknown
8081/tcp open  unknown
5433/tcp open  unknown
6380/tcp open  unknown
8083/tcp open  unknown
```

### netstat alternativo:
```bash
netstat -tuln | grep -E ':(4200|8081|5433|6380|8083)'
```

## 🐳 Comandos Docker Úteis

### Ver containers locais:
```bash
docker-compose -f docker-compose.local.yml ps
```

### Logs específicos:
```bash
# Frontend
docker-compose -f docker-compose.local.yml logs -f frontend-local

# API
docker-compose -f docker-compose.local.yml logs -f nginx-api-local

# Backend
docker-compose -f docker-compose.local.yml logs -f backend-local
```

### Parar ambiente local:
```bash
docker-compose -f docker-compose.local.yml down
```

## 🚨 Troubleshooting

### Se as portas ainda não aparecem:

1. **Verificar Docker Desktop**:
   - Abra Docker Desktop
   - Vá em Settings > Resources > Port Forwarding
   - Certifique-se que está habilitado

2. **Verificar conflitos**:
   ```bash
   ./clean-ports.sh
   ```

3. **Firewall/Antivírus**:
   - Permita Docker Desktop no firewall
   - Adicione exceção para portas 4200, 8081

4. **WSL2 (Windows)**:
   ```bash
   # No WSL2, pode precisar de:
   netsh interface portproxy add v4tov4 listenport=4200 listenaddress=0.0.0.0 connectport=4200 connectaddress=127.0.0.1
   ```

5. **macOS**:
   ```bash
   # Verificar se Docker Desktop está usando bridge network
   docker network ls | grep bridge
   ```

### Se containers não iniciam:

1. **Verificar recursos**:
   - Docker Desktop precisa de pelo menos 4GB RAM
   - Verificar espaço em disco

2. **Rebuild completo**:
   ```bash
   ./clean-ports.sh
   docker system prune -f
   ./deploy.sh local
   ```

## 📊 Monitoramento

### Status em tempo real:
```bash
watch -n 2 "docker-compose -f docker-compose.local.yml ps && echo && nmap -p 4200,8081 localhost"
```

### Logs em tempo real:
```bash
docker-compose -f docker-compose.local.yml logs -f --tail=50
```

## ✅ Checklist Final

- [ ] Docker Desktop está rodando
- [ ] Executou `./clean-ports.sh`
- [ ] Executou `./deploy.sh local`
- [ ] `nmap localhost` mostra portas 4200 e 8081
- [ ] http://localhost:4200 abre frontend
- [ ] http://localhost:8081/health retorna "healthy"
- [ ] Logs não mostram erros críticos

## 🆘 Se nada funcionar

Execute o diagnóstico completo:
```bash
./check-localhost.sh > diagnostico.txt 2>&1
cat diagnostico.txt
```

Envie o arquivo `diagnostico.txt` para análise do problema.
