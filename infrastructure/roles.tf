resource "aws_iam_role" "scheduler" {
  name = "cron-scheduler-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = ["scheduler.amazonaws.com"]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  managed_policy_arns = [aws_iam_policy.scheduler.arn]
}
resource "aws_iam_role" "mma-container" {
  name = "MMA-container"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = ["ecs-tasks.amazonaws.com"]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AWSOpsWorksCloudWatchLogs",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/AmazonTextractFullAccess",
    "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole",
    aws_iam_policy.ecs-run.arn,
  ]
  inline_policy {
    name = "iam-pass-role"
    policy = jsonencode(
      {
        Statement = [
          {
            Action   = "iam:PassRole"
            Effect   = "Allow"
            Resource = "*"
            Sid      = "VisualEditor0"
          },
        ]
        Version = "2012-10-17"
      }
    )
  }
}

resource "aws_iam_policy" "ecs-run" {
  name = "ecs-run"
  policy = jsonencode({
    Statement = [
      {
        Action = [
          "ecs:DescribeCapacityProviders",
          "ecs:DescribeClusters",
          "ecs:DescribeContainerInstances",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeTaskSets",
          "ecs:DescribeTasks",
          "ecs:GetTaskProtection",
          "ecs:ListAccountSettings",
          "ecs:ListAttributes",
          "ecs:ListClusters",
          "ecs:ListContainerInstances",
          "ecs:ListServices",
          "ecs:ListServicesByNamespace",
          "ecs:ListTagsForResource",
          "ecs:ListTaskDefinitionFamilies",
          "ecs:ListTaskDefinitions",
          "ecs:ListTasks",
          "ecs:RunTask",
          "ecs:TagResource",
          "ecs:UntagResource",
        ]
        Effect   = "Allow"
        Resource = "*"
        Sid      = "VisualEditor0"
      },
    ]
    Version = "2012-10-17"
  })
}

resource "aws_iam_policy" "scheduler" {
  name = "cron-scheduler-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # allow scheduler to execute the task
        Effect = "Allow",
        Action = [
          "ecs:RunTask"
        ]
        Resource = ["${aws_ecs_task_definition.mma-scraper.arn_without_revision}:*"]
      },
      { # allow scheduler to set the IAM roles of your task
        Effect = "Allow",
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_ecs_task_definition.mma-scraper.execution_role_arn,
          aws_ecs_task_definition.mma-scraper.task_role_arn,
        ]
      },
    ]
  })
}
