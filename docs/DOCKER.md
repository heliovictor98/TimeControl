# Docker — TimeControl

## Subir o ambiente completo

Na raiz do projeto:

```bash
docker compose up -d --build
```

- **Frontend:** http://localhost:4201  
- **Backend (API), acesso direto:** http://localhost:3001 (no host; dentro do Docker a API continua na porta 3000)  
- **PostgreSQL:** localhost:5432 (usuário `timecontrol`, senha `timecontrol_secret`, database `timecontrol`)

As portas no host são **4201** (frontend) e **3001** (backend) para não conflitar com `ng serve` (4200) e `npm start` do backend (3000) rodando local.

## Parar o ambiente

- **Parar e manter os dados:**  
  ```bash
  docker compose down
  ```
  Na próxima `docker compose up`, o banco e todos os registros continuam iguais.

- **Parar e apagar o banco (e todos os registros):**  
  ```bash
  docker compose down -v
  ```
  O `-v` remove os volumes. Na próxima subida o PostgreSQL começa vazio.

## Persistência dos dados

- Os registros (projetos, demandas, registros de tempo) ficam no **PostgreSQL** dentro do container.
- O PostgreSQL grava em um **volume Docker** (`postgres_data`), mapeado para `/var/lib/postgresql/data`. Esse volume fica no disco do seu computador e **não** é removido quando você para os containers.

**Resumo:**

| Ação                         | Dados do banco      |
|-----------------------------|---------------------|
| `docker compose up` / `down` (sem `-v`) | **Preservados**     |
| `docker compose down -v`     | **Apagados**        |

Para inspecionar o volume no disco: `docker volume ls` e `docker volume inspect timecontrol_postgres_data`.

## Tabelas do banco

Com o backend rodando **sem** `NODE_ENV=production` (caso padrão no `docker-compose`), o TypeORM sobe com `synchronize: true` e cria o schema `dbtimecontrol` e as tabelas na primeira conexão. Não é necessário rodar scripts SQL manualmente.

## Acesso na rede local (outros PCs em casa)

Os containers expõem as portas em **todas as interfaces** (`0.0.0.0`), então o app já pode ser acessado de outros PCs na mesma rede.

1. **Descubra o IP do PC onde o Docker está rodando** (no próprio PC):
   - Linux: `ip addr` ou `hostname -I`
   - O valor costuma ser algo como `192.168.0.10` ou `192.168.1.100`.

2. **Nos outros PCs** (celular, outro notebook, etc.), no navegador use:
   - **http://\<IP-do-servidor\>:4201**  
   Exemplo: `http://192.168.1.100:4201`  
   Toda a aplicação (frontend e chamadas à API) funciona por essa URL; o Nginx do container encaminha `/api` para o backend internamente.

3. **Firewall:** Se não abrir, libere as portas **4201** (frontend) e, se precisar de acesso direto à API, **3001** no firewall do PC que está rodando o Docker.

## Não consegue acessar pela rede? (Não foi possível conectar)

Se no outro PC o navegador mostra "Não foi possível conectar" ao acessar `http://<IP>:4201`, faça no **PC onde o Docker está rodando**:

1. **Confirmar que os containers estão de pé e que a porta responde:**
   ```bash
   docker compose ps
   curl -I http://127.0.0.1:4201
   curl -I http://192.168.1.100:4201   # use o IP que você está usando
   ```
   Se `curl` em 127.0.0.1 funcionar e no IP da rede não, o bloqueio costuma ser **firewall**.

2. **Liberar as portas no firewall (Linux):**
   - **UFW:**  
     `sudo ufw allow 4201/tcp`  
     `sudo ufw allow 3001/tcp`  
     `sudo ufw reload`  
     (e confira com `sudo ufw status`)
   - **firewalld:**  
     `sudo firewall-cmd --add-port=4201/tcp --permanent`  
     `sudo firewall-cmd --add-port=3001/tcp --permanent`  
     `sudo firewall-cmd --reload`

3. **Confirmar o IP da máquina:**  
   `hostname -I` ou `ip addr` — use o endereço da interface da sua rede (ex.: 192.168.1.x). Não use 127.0.0.1.

4. **Garantir que o outro PC está na mesma rede** (mesmo Wi‑Fi ou mesmo switch) e que não há outro firewall/proxy no meio.
