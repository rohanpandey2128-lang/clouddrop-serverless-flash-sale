terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. DynamoDB Table for Inventory with Atomic Counter
resource "aws_dynamodb_table" "inventory" {
  name         = "FlashSaleInventory"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ProductID"

  attribute {
    name = "ProductID"
    type = "S"
  }
}

# 2. Dead-Letter Queue for failed orders
resource "aws_sqs_queue" "dlq" {
  name = "flash-sale-dlq.fifo"
  fifo_queue = true
}

# 3. Main SQS FIFO Queue
resource "aws_sqs_queue" "order_queue" {
  name                        = "flash-sale-orders.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 30

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}