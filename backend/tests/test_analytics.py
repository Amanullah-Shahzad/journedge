from datetime import date

from app.models.entities import Trade
from app.services.analytics import summarize_analytics


def test_analytics_summary_basic():
    trades = [
        Trade(
            user_id="u1",
            duplicate_key="a",
            date=date(2026, 5, 30),
            symbol="AAPL",
            underlying="AAPL",
            type="stock",
            direction="long",
            quantity=1,
            entry_price=100,
            exit_price=110,
            commission=0,
            fees=0,
            pnl=10,
            status="win",
            tags=[],
        ),
        Trade(
            user_id="u1",
            duplicate_key="b",
            date=date(2026, 5, 31),
            symbol="MSFT",
            underlying="MSFT",
            type="stock",
            direction="long",
            quantity=1,
            entry_price=100,
            exit_price=95,
            commission=0,
            fees=0,
            pnl=-5,
            status="loss",
            tags=[],
        ),
    ]
    summary = summarize_analytics(trades, 1000)
    assert summary["total_pnl"] == 5
    assert summary["win_rate"] == 50.0
    assert summary["trade_count"] == 2


def test_analytics_formulas():
    trades = [
        Trade(user_id="u1", duplicate_key="a", date=date(2026, 5, 26), symbol="AAPL", underlying="AAPL", type="stock", direction="long", quantity=1, entry_price=100, exit_price=200, commission=0, fees=0, pnl=100, status="win", tags=[]),
        Trade(user_id="u1", duplicate_key="b", date=date(2026, 5, 27), symbol="MSFT", underlying="MSFT", type="stock", direction="long", quantity=1, entry_price=100, exit_price=50, commission=0, fees=0, pnl=-50, status="loss", tags=[]),
        Trade(user_id="u1", duplicate_key="c", date=date(2026, 5, 28), symbol="NVDA", underlying="NVDA", type="stock", direction="long", quantity=1, entry_price=100, exit_price=125, commission=0, fees=0, pnl=25, status="win", tags=[]),
        Trade(user_id="u1", duplicate_key="d", date=date(2026, 5, 29), symbol="AMD", underlying="AMD", type="stock", direction="long", quantity=1, entry_price=100, exit_price=25, commission=0, fees=0, pnl=-75, status="loss", tags=[]),
        Trade(user_id="u1", duplicate_key="e", date=date(2026, 5, 30), symbol="META", underlying="META", type="stock", direction="long", quantity=1, entry_price=100, exit_price=150, commission=0, fees=0, pnl=50, status="win", tags=[]),
    ]
    summary = summarize_analytics(trades, 1000)
    assert summary["total_pnl"] == 50
    assert summary["win_rate"] == 60.0
    assert summary["profit_factor"] == 0.93
    assert summary["expectancy"] == 10.0
    assert summary["avg_win"] == 58.33
    assert summary["avg_loss"] == 62.5
    assert summary["max_drawdown"] == -100.0
    assert summary["max_drawdown_pct"] == -9.09
    assert summary["avg_r"] == 0.16


def test_analytics_streaks_and_r_histogram():
    trades = [
        Trade(user_id="u1", duplicate_key="a", date=date(2026, 5, 26), symbol="AAPL", underlying="AAPL", type="stock", direction="long", quantity=1, entry_price=100, exit_price=110, commission=0, fees=0, pnl=10, status="win", tags=[]),
        Trade(user_id="u1", duplicate_key="b", date=date(2026, 5, 27), symbol="MSFT", underlying="MSFT", type="stock", direction="long", quantity=1, entry_price=100, exit_price=115, commission=0, fees=0, pnl=15, status="win", tags=[]),
        Trade(user_id="u1", duplicate_key="c", date=date(2026, 5, 28), symbol="NVDA", underlying="NVDA", type="stock", direction="long", quantity=1, entry_price=100, exit_price=95, commission=0, fees=0, pnl=-5, status="loss", tags=[]),
        Trade(user_id="u1", duplicate_key="d", date=date(2026, 5, 29), symbol="AMD", underlying="AMD", type="stock", direction="long", quantity=1, entry_price=100, exit_price=92, commission=0, fees=0, pnl=-8, status="loss", tags=[]),
        Trade(user_id="u1", duplicate_key="e", date=date(2026, 5, 30), symbol="META", underlying="META", type="stock", direction="long", quantity=1, entry_price=100, exit_price=90, commission=0, fees=0, pnl=-10, status="loss", tags=[]),
    ]
    summary = summarize_analytics(trades, 1000)
    assert summary["max_win_streak"] == 2
    assert summary["max_loss_streak"] == 3
    assert summary["current_streak"] == 3
    assert summary["current_streak_type"] == "loss"
    assert summary["r_histogram"]
