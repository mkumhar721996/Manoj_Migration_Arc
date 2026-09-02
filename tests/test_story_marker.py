import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.story_marker import get_story_marker


class TestStoryMarker(unittest.TestCase):
    def test_get_story_marker_returns_id(self):
        self.assertEqual(get_story_marker(), "MANOJ-MIGRATION-ARC-STORY-010")


if __name__ == "__main__":
    unittest.main()
