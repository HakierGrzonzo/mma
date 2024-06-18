from logging import getLogger
from os import environ
import boto3

logger = getLogger(__name__)

CLUSTER_ARN = environ.get("CLUSTER_ARN")
TASK_DEFINITION_ARN = environ.get("TASK_DEFINITION_ARN")


def trigger_frontend_regen():
    if CLUSTER_ARN is None or TASK_DEFINITION_ARN is None:
        raise Exception("Cluster and task not specified")
    client = boto3.client("ecs")
    logger.info("Triggering Frontend task")
    client.run_task(
        cluster=CLUSTER_ARN,
        count=1,
        launchType="FARGATE",
        taskDefinition=TASK_DEFINITION_ARN,
        networkConfiguration={
            "awsvpcConfiguration": {
                "subnets": [],
                "securityGroups": [],
                "assignPublicIp": "ENABLED",
            }
        },
    )
