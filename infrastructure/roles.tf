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
}

resource "aws_iam_role_policy_attachment" "scheduler" {
  policy_arn = aws_iam_policy.scheduler.arn
  role       = aws_iam_role.scheduler.name
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
