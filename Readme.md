# 1. Run for Local Development (Hot Reload)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

# 2. Run for Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
# 3 logs the contanier
```bash
 docker logs oxium-resusable-componenents-worker-1 -f 
 ```
