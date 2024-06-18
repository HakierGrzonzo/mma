resource "aws_ecr_repository" "mma-scraper" {
  name                 = "scraper"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "mma-front" {
  name                 = "front"
  image_tag_mutability = "MUTABLE"
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
  execution_role_arn       = "arn:aws:iam::767397670578:role/MMA-container"
  task_role_arn            = "arn:aws:iam::767397670578:role/MMA-container"
  cpu                      = 1024
  memory                   = 3072
  container_definitions = jsonencode([{
    essential = true
    image     = "${aws_ecr_repository.mma-front.repository_url}:latest"
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

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_internet_gateway" "mma" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "mma" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_route_table" "mma" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table_association" "mma-main" {
  subnet_id      = aws_subnet.mma.id
  route_table_id = aws_route_table.mma.id
}

resource "aws_route" "internet" {
  route_table_id         = aws_route_table.mma.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.mma.id
}

resource "aws_ecs_task_definition" "mma-scraper" {
  family                   = "mma-scraper"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = "arn:aws:iam::767397670578:role/MMA-container"
  task_role_arn            = "arn:aws:iam::767397670578:role/MMA-container"
  cpu                      = 1024
  memory                   = 3072
  container_definitions = jsonencode([{
    essential = true
    image     = "${aws_ecr_repository.mma-scraper.repository_url}:latest"
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

  schedule_expression          = "cron(30 17,22 * * ? *)" # run every 30 minutes
  schedule_expression_timezone = "Europe/Warsaw"

  target {
    arn = aws_ecs_cluster.mma.arn # arn of the ecs cluster to run on
    # role that allows scheduler to start the task (explained later)
    role_arn = aws_iam_role.scheduler.arn

    ecs_parameters {
      # trimming the revision suffix here so that schedule always uses latest revision
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

output "subnet_id" {
  value = aws_subnet.mma.id
}
output "front_task_arn" {
  value = aws_ecs_task_definition.mma-front.arn
}
output "cluster_arn" {
  value = aws_ecs_cluster.mma.arn
}
