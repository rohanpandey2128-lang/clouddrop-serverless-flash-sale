 import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.INVENTORY_TABLE_NAME;

export const handler = async (event) => {
    for (const record of event.Records) {
        try {
            const order = JSON.parse(record.body);
            const { orderId, productId, quantity } = order;

            // Atomic Conditional Write to prevent overselling
            const params = {
                TableName: TABLE_NAME,
                Key: { ProductID: productId },
                UpdateExpression: "SET Stock = Stock - :qty",
                ConditionExpression: "Stock >= :qty",
                ExpressionAttributeValues: {
                    ":qty": quantity
                }
            };

            await dynamoDb.send(new UpdateCommand(params));
            console.log(`Successfully processed order ${orderId}. Stock decremented by ${quantity}.`);

        } catch (error) {
            if (error.name === "ConditionalCheckFailedException") {
                console.warn(`Order rejected: Out of stock or insufficient inventory.`);
            } else {
                console.error(`Error processing order:`, error);
                throw error; // Triggers SQS retry / DLQ
            }
        }
    }
    return { status: "Batch processed successfully" };
};