from os import mkdir
from os.path import join
from asyncio import Semaphore, create_subprocess_exec, create_task, gather
from ..schema.tables import Image, Shows

DATASET_DIR = "./dataset"


def try_create_directory(path: str):
    try:
        mkdir(path)
    except FileExistsError:
        pass


limiter = Semaphore(20)


async def convert_image(source: str, destination: str):
    async with limiter:
        print(source, "->", destination)
        proc = await create_subprocess_exec("magick", source, destination)
        exit_code = await proc.wait()

        assert exit_code == 0


async def prepare_dataset():
    try_create_directory(DATASET_DIR)

    images = await Image.select(
        Image.file_path.as_alias("path"),
        Image.comic._.series._.show.as_alias("show"),
        Image.order.as_alias("order"),
    )

    for kind in ["validation", "train"]:
        try_create_directory(join(DATASET_DIR, kind))
        for show in [Shows.TOH, Shows.KOG]:
            try_create_directory(join(DATASET_DIR, kind, show.value))

    tasks = []

    for image in images:
        path: str = image["path"]
        show = image["show"]

        new_image_name = path.replace("/", "-").replace(".webp", ".png")

        dataset_to_use = "validation" if image["order"] == 0 else "train"

        new_image_path = join(DATASET_DIR, dataset_to_use, show, new_image_name)

        old_path = join("./results", path)

        tasks.append(create_task(convert_image(old_path, new_image_path)))

    await gather(*tasks)
