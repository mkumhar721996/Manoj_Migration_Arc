from dataclasses import dataclass, field
from enum import Enum


class WorkItemState(Enum):
    SUBMITTED = "submitted"
    WORKTREE_CREATED = "worktree_created"
    IN_REVIEW = "in_review"
    NEEDS_REWORK = "needs_rework"
    REVIEWED_PASS = "reviewed_pass"
    PR_CREATED = "pr_created"


class WorkflowError(Exception):
    pass


@dataclass
class WorkItem:
    id: str
    state: WorkItemState = WorkItemState.SUBMITTED
    worktree_path: str = None
    review_count: int = 0
    pull_request_ref: str = None
    review_history: list = field(default_factory=list)


def create_worktree(item: WorkItem) -> WorkItem:
    if item.state != WorkItemState.SUBMITTED:
        raise WorkflowError(f"cannot create worktree from state {item.state}")
    item.worktree_path = f"worktrees/{item.id}"
    item.state = WorkItemState.WORKTREE_CREATED
    return item


def start_review(item: WorkItem) -> WorkItem:
    if item.state not in (WorkItemState.WORKTREE_CREATED, WorkItemState.NEEDS_REWORK):
        raise WorkflowError(f"cannot start review from state {item.state}")
    item.state = WorkItemState.IN_REVIEW
    item.review_count += 1
    return item


def complete_review(item: WorkItem, passed: bool) -> WorkItem:
    if item.state != WorkItemState.IN_REVIEW:
        raise WorkflowError(f"cannot complete review from state {item.state}")
    item.review_history.append(passed)
    item.state = WorkItemState.REVIEWED_PASS if passed else WorkItemState.NEEDS_REWORK
    return item


def resubmit_for_rework(item: WorkItem) -> WorkItem:
    if item.state != WorkItemState.NEEDS_REWORK:
        raise WorkflowError(f"cannot resubmit for rework from state {item.state}")
    return start_review(item)


def create_pull_request(item: WorkItem) -> WorkItem:
    if item.state != WorkItemState.REVIEWED_PASS:
        raise WorkflowError(f"cannot create pull request from state {item.state}")
    item.pull_request_ref = f"pr-{item.id}"
    item.state = WorkItemState.PR_CREATED
    return item
