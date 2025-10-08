from .dataset import prepare_dataset
from sys import argv
import asyncio

from . import run_inference, train_model


match argv[1]:
    case "dataset":
        asyncio.run(prepare_dataset())
    case "ml-train":
        train_model()

    case "ml-predict":
        run_inference(argv[2])
