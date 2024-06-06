from logging import getLogger
import boto3

logger = getLogger(__name__)


def trigger_frontend_regen():
    client = boto3.client("ecs")
    logger.info("Triggering Frontend task")
    client.run_task(
        cluster="arn:aws:ecs:us-east-1:767397670578:cluster/mma-test",
        count=1,
        launchType="FARGATE",
        taskDefinition="arn:aws:ecs:us-east-1:767397670578:task-definition/front-mma",
        networkConfiguration={
            "awsvpcConfiguration": {
                "subnets": [
                    "subnet-00c5cd223fe861889",
                ],
                "securityGroups": [
                    "sg-0d0cabbabacb7842f",
                ],
                "assignPublicIp": "ENABLED",
            }
        },
    )
