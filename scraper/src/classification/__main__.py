from .dataset import prepare_dataset
from sys import argv
import asyncio

from . import train_model


match argv[1]:
    case "dataset":
        asyncio.run(prepare_dataset())
    case "ml-train":
        train_model()
