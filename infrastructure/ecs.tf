resource "aws_ecr_repository" "mma" {
  for_each             = toset(["scraper", "front"])
  name                 = each.key
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_lifecycle_policy" "mma" {
  for_each   = tomap(aws_ecr_repository.mma)
  repository = each.value.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 2
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}


resource "aws_ecs_cluster" "mma" {
  name = "mma"
}

resource "aws_ecs_cluster_capacity_providers" "mma" {
  cluster_name       = aws_ecs_cluster.mma.name
  capacity_providers = ["FARGATE"]
}


resource "aws_ecs_task_definition" "mma-front" {
  family                   = "mma-front"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.mma-container.arn
  task_role_arn            = aws_iam_role.mma-container.arn
  cpu                      = 1024
  memory                   = 3072
  container_definitions = jsonencode([{
    essential = true
    image     = "${aws_ecr_repository.mma["front"].repository_url}:latest"
    name      = "front"
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/front-mma",
        awslogs-create-group  = "true",
        awslogs-region        = "us-east-1",
        awslogs-stream-prefix = "ecs"
      }
    }
    environment = [
      {
        name  = "BUCKET"
        value = module.mma_images.bucket.id
      },
      {
        name  = "IMAGE_HOST"
        value = "https://${local.image_domain}"
      },
      {
        name  = "DESTINATION"
        value = module.mma_webroot.bucket.id
      },
    ]
  }])
}

resource "aws_ecs_task_definition" "mma-scraper" {
  family                   = "mma-scraper"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.mma-container.arn
  task_role_arn            = aws_iam_role.mma-container.arn
  cpu                      = 1024
  memory                   = 3072
  container_definitions = jsonencode([{
    essential = true
    image     = "${aws_ecr_repository.mma["scraper"].repository_url}:latest"
    name      = "scraper"
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/scraper-mma",
        awslogs-create-group  = "true",
        awslogs-region        = "us-east-1",
        awslogs-stream-prefix = "ecs"
      }
    }
    environment = [
      {
        name  = "SECRET"
        value = var.reddit_api_secret
      },
      {
        name  = "TUMBLR_API_KEY"
        value = var.tumblr_api_secret
      },
      {
        name  = "BUCKET"
        value = module.mma_images.bucket.id
      },
      {
        name  = "TASK_DEFINITION_ARN"
        value = aws_ecs_task_definition.mma-front.arn_without_revision
      },
      {
        name  = "CLUSTER_ARN"
        value = aws_ecs_cluster.mma.arn
      },
      {
        name  = "SUBNET"
        value = aws_subnet.mma.id
      }
    ]
  }])
}

resource "aws_scheduler_schedule" "mma-refresh" {
  name       = "mma-scrape-refresh"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = "cron(30 16,2 * * ? *)"
  schedule_expression_timezone = "Europe/Warsaw"

  target {
    arn      = aws_ecs_cluster.mma.arn
    role_arn = aws_iam_role.scheduler.arn

    ecs_parameters {
      task_definition_arn = aws_ecs_task_definition.mma-scraper.arn_without_revision
      launch_type         = "FARGATE"

      network_configuration {
        assign_public_ip = true
        security_groups  = []
        subnets          = [aws_subnet.mma.id]
      }
    }

    retry_policy {
      maximum_event_age_in_seconds = 300
      maximum_retry_attempts       = 1
    }
  }
}

# output variables for github CD
output "FRONT_TASK_ARN" {
  value = aws_ecs_task_definition.mma-front.arn
}

output "CLUSTER_ARN" {
  value = aws_ecs_cluster.mma.arn
}
