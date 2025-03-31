#!/bin/bash
# Monitoring Stack Setup Script

# Create network
docker network create monitoring

# Start containers
docker run -d --name=prometheus \
  --network=monitoring \
  -p 9090:9090 \
  -v ~/prometheus-data:/prometheus \
  -v ~/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

docker run -d --name=node_exporter \
  --network=monitoring \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  quay.io/prometheus/node-exporter:latest \
  --path.rootfs=/host

docker run -d --name=cadvisor \
  --network=monitoring \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest

docker run -d --name=grafana \
  --network=monitoring \
  -p 3000:3000 \
  grafana/grafana-oss
