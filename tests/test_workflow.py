import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.workflow import (
    WorkflowError,
    WorkItem,
    WorkItemState,
    complete_review,
    create_pull_request,
    create_worktree,
    resubmit_for_rework,
    start_review,
)


class TestWorkflowAC1WorktreeCreation(unittest.TestCase):
    def test_submitting_work_item_creates_worktree(self):
        item = WorkItem(id="STORY-1")

        create_worktree(item)

        self.assertEqual(item.state, WorkItemState.WORKTREE_CREATED)
        self.assertIsNotNone(item.worktree_path)

    def test_worktree_cannot_be_created_twice(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)

        with self.assertRaises(WorkflowError):
            create_worktree(item)


class TestWorkflowAC2ReviewAfterWorktree(unittest.TestCase):
    def test_review_is_performed_after_worktree_created(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)

        start_review(item)

        self.assertEqual(item.state, WorkItemState.IN_REVIEW)

    def test_review_cannot_start_before_worktree_created(self):
        item = WorkItem(id="STORY-1")

        with self.assertRaises(WorkflowError):
            start_review(item)


class TestWorkflowAC3ReworkBeforeReReview(unittest.TestCase):
    def test_failed_review_sends_item_to_rework_not_back_to_review(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)
        start_review(item)

        complete_review(item, passed=False)

        self.assertEqual(item.state, WorkItemState.NEEDS_REWORK)

    def test_pr_cannot_be_created_while_awaiting_rework(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)
        start_review(item)
        complete_review(item, passed=False)

        with self.assertRaises(WorkflowError):
            create_pull_request(item)


class TestWorkflowAC4ReworkedItemIsReReviewed(unittest.TestCase):
    def test_resubmitting_reworked_item_triggers_new_review(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)
        start_review(item)
        complete_review(item, passed=False)

        resubmit_for_rework(item)

        self.assertEqual(item.state, WorkItemState.IN_REVIEW)
        self.assertEqual(item.review_count, 2)


class TestWorkflowAC5PassingReviewCreatesPullRequest(unittest.TestCase):
    def test_passing_review_creates_pull_request(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)
        start_review(item)

        complete_review(item, passed=True)
        create_pull_request(item)

        self.assertEqual(item.state, WorkItemState.PR_CREATED)
        self.assertIsNotNone(item.pull_request_ref)

    def test_pr_cannot_be_created_before_review_passes(self):
        item = WorkItem(id="STORY-1")
        create_worktree(item)

        with self.assertRaises(WorkflowError):
            create_pull_request(item)


if __name__ == "__main__":
    unittest.main()
