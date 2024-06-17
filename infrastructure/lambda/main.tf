data "archive_file" "python_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/../../${var.lambda_source_file_path}"
  output_path = "${var.lambda_name}.zip"
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.lambda_name}-exec-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}


resource "aws_lambda_function" "random_comic" {
  function_name    = var.lambda_name
  filename         = data.archive_file.python_lambda_package.output_path
  source_code_hash = data.archive_file.python_lambda_package.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.12"
  handler          = "lambda_function.lambda_handler"
  timeout          = 10
}

resource "aws_lambda_function_url" "random_comic" {
  function_name      = aws_lambda_function.random_comic.function_name
  authorization_type = "NONE"
}

