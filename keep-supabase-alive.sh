#!/bin/bash
# Script para mantener Supabase activo con una consulta simple cada día

curl -s -X GET 'https://rvpovifwugksrsmgabcj.supabase.co/rest/v1/symposiums?select=id&limit=1' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cG92aWZ3dWdrc3JzbWdhYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUwODYsImV4cCI6MjA3NTM2MTA4Nn0.Qyqsj8uoMinKkx5DrmiFaZpEJtzj3ZH_HnciDZNv1r0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cG92aWZ3dWdrc3JzbWdhYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUwODYsImV4cCI6MjA3NTM2MTA4Nn0.Qyqsj8uoMinKkx5DrmiFaZpEJtzj3ZH_HnciDZNv1r0" \
  > /dev/null 2>&1

# Log para verificar que se ejecutó
echo "$(date): Supabase keep-alive executed" >> /home/ubuntu/dockerdata/iaspmal_2026/keep-alive.log
