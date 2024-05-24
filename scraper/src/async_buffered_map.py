import asyncio
from typing import AsyncGenerator, Callable, Coroutine, Generic, TypeVar

Tin = TypeVar("Tin")
Tout = TypeVar("Tout")


class AsyncBufferedMap(Generic[Tin, Tout]):
    def __init__(
        self,
        func: Callable[[Tin], Coroutine[None, None, Tout]],
        arg_gen: AsyncGenerator[Tin, None],
    ) -> None:
        self._predicate = func
        self._queue = asyncio.Queue()
        asyncio.create_task(self._consume_gen(arg_gen))

    async def _consume_gen(self, arg_gen: AsyncGenerator[Tin, None]):
        async for arg in arg_gen:
            task = asyncio.create_task(self._predicate(arg))
            await self._queue.put((False, task))
        await self._queue.put((True, None))

    def __aiter__(self):
        return self

    async def __anext__(self) -> Tout:
        is_complete, task = await self._queue.get()
        if is_complete:
            raise StopAsyncIteration()
        return await task
