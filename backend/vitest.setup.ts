process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/agribharat_test";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.JWT_SECRET ??= "test-secret-must-be-at-least-32-characters-long-123456";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.PORT ??= "5000";
process.env.ML_SERVICE_URL ??= "http://localhost:8000";
process.env.ML_TIMEOUT_MS ??= "30000";
process.env.CHATBOT_SERVICE_URL ??= "http://localhost:8001";
