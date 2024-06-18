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

# output variables for github CD
output "SUBNET_ID" {
  value = aws_subnet.mma.id
}
