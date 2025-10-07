#!/bin/bash

echo "Desplegando IASPMAL 2026..."

cd ~/iaspmal_2026

echo "Deteniendo contenedor..."
docker compose -f docker-compose.prod.yml down

echo "Limpiando imágenes antiguas..."
docker image prune -f

echo "Construyendo nueva imagen..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "Iniciando contenedor..."
docker compose -f docker-compose.prod.yml up -d

echo "Despliegue completado"
echo "Aplicación disponible en: http://148.113.174.23"

docker compose -f docker-compose.prod.yml logs --tail=30
