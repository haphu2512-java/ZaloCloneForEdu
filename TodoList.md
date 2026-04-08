# TODO Gap List from README.md

Goal: compare README architecture vs current code, list missing parts, and execute the feasible items in this sprint.

## Still missing vs README (not done in this sprint)

- [ ] Dedicated search engine (Elasticsearch/Meilisearch), currently Mongo regex
- [ ] Production media storage (AWS S3/Cloudinary), currently local `backend/uploads`
- [ ] Notification queue/retry with Kafka/RabbitMQ
- [ ] Full monitoring stack (Prometheus/Grafana)
- [ ] Distributed rate limiting via Redis (current middleware is mainly in-memory)
- [ ] Advanced block policy on message/conversation layer
