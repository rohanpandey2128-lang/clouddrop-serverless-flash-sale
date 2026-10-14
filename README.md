 # ⚡ CloudDrop: Enterprise Serverless Flash-Sale Engine

> A high-throughput, event-driven cloud architecture built to handle massive traffic spikes (10,000+ concurrent requests) with **Zero Overselling** and **Zero Infrastructure Management**.

---

## 🏗️ System Architecture Diagram

```text
[ Users / Flash Mob ] 
       │
       ▼ (HTTP POST)
[ API Gateway ] ──(Rate Limit & Token Bucket)──► [ AWS Lambda: Order Producer ]
                                                        │
                                                        ▼ (Asynchronous Publish)
                                              [ Amazon SQS Queue ] ──► (Dead-Letter Queue for Failures)
                                                        │
                                                        ▼ (Batch Processing)
                                              [ AWS Lambda: Order Consumer ]
                                                        │
                                                        ▼ (Atomic Conditional Write)
                                            [ DynamoDB: FlashSaleInventory ]