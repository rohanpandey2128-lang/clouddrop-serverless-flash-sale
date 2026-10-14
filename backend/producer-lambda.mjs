import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION || "us-east-1" });
const QUEUE_URL = process.env.ORDER_QUEUE_URL;

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { userId, productId, quantity } = body;

        const orderPayload = {
            orderId: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId,
            productId,
            quantity: quantity || 1,
            timestamp: new Date().toISOString()
        };

        const command = new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(orderPayload),
            MessageGroupId: "FlashSaleGroup", // For FIFO queues
            MessageDeduplicationId: orderPayload.orderId
        });

        await sqs.send(command);

        return {
            statusCode: 202,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Order placed in queue successfully", orderId: orderPayload.orderId })
        };
    } catch (error) {
        console.error("Producer Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to queue order", details: error.message })
        };
    }
};