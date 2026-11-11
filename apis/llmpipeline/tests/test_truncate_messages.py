from types import SimpleNamespace

from app.features.langgraph.checkpoint.persistence import rows_after_user_turns


def _rows(*roles):
    return [SimpleNamespace(id=index, role=role) for index, role in enumerate(roles)]


def test_regenerate_drops_last_turn_including_its_user_row():
    rows = _rows("user", "assistant", "assistant", "user", "assistant", "tool", "assistant")
    assert [row.id for row in rows_after_user_turns(rows, 1)] == [3, 4, 5, 6]


def test_edit_first_message_drops_everything():
    rows = _rows("user", "assistant", "user", "assistant")
    assert [row.id for row in rows_after_user_turns(rows, 0)] == [0, 1, 2, 3]


def test_keeping_all_turns_drops_nothing():
    assert rows_after_user_turns(_rows("user", "assistant"), 1) == []
