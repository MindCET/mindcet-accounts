import asyncio
from pathlib import Path

import edge_tts


TEXT = (
    "לא תאמינו מה מצאתי היום. "
    "קלוד קוד ורימושן עובדים יחד, "
    "ובכמה רגעים אפשר להפוך רעיון לסרטון אמיתי. "
    "הכול בעברית, עם כתוביות ותנועה, "
    "וזה מרגיש כמו מוצר מוכן."
)


async def main() -> None:
    output = Path(__file__).resolve().parents[1] / "public" / "voiceover" / "hebrew-discovery.mp3"
    output.parent.mkdir(parents=True, exist_ok=True)

    communicator = edge_tts.Communicate(
        text=TEXT,
        voice="he-IL-AvriNeural",
        rate="-3%",
        pitch="+0Hz",
    )
    await communicator.save(str(output))
    print(f"Wrote {output}")


if __name__ == "__main__":
    asyncio.run(main())
