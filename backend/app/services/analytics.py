from __future__ import annotations

import math
from collections import defaultdict
from datetime import date

from app.models.entities import Trade


def std_dev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / (len(values) - 1)
    return math.sqrt(variance)


def summarize_analytics(trades: list[Trade], initial_balance: float) -> dict:
    if not trades:
        return {
            "total_pnl": 0,
            "win_rate": 0,
            "avg_win": 0,
            "avg_loss": 0,
            "profit_factor": 0,
            "expectancy": 0,
            "sharpe": 0,
            "sortino": 0,
            "calmar": 0,
            "max_drawdown": 0,
            "max_drawdown_pct": 0,
            "discipline_score": 100,
            "trade_count": 0,
            "trading_days": 0,
            "equity_curve": [],
            "daily": [],
            "dow_data": [],
            "symbol_data": [],
            "tag_data": [],
            "rolling": [],
            "r_histogram": [],
            "mae_mfe_chart": [],
            "overtrading_days": [],
            "revenge_count": 0,
            "max_win_streak": 0,
            "max_loss_streak": 0,
            "current_streak": 0,
            "current_streak_type": None,
            "avg_r": 0,
        }

    ordered = sorted(trades, key=lambda trade: trade.date)
    wins = [trade for trade in trades if trade.status == "win"]
    losses = [trade for trade in trades if trade.status == "loss"]
    total_pnl = sum(trade.pnl for trade in trades)
    win_rate = (len(wins) / len(trades)) * 100 if trades else 0
    avg_win = sum(trade.pnl for trade in wins) / len(wins) if wins else 0
    avg_loss = abs(sum(trade.pnl for trade in losses) / len(losses)) if losses else 0
    profit_factor = avg_win / avg_loss if avg_loss else (99 if avg_win > 0 else 0)
    expectancy = (len(wins) / len(trades) * avg_win) - (len(losses) / len(trades) * avg_loss) if trades else 0

    running = initial_balance
    equity_curve = []
    daily_map: dict[str, float] = defaultdict(float)
    for trade in ordered:
        running += trade.pnl
        key = trade.date.isoformat()
        daily_map[key] += trade.pnl
        equity_curve.append({"date": key, "equity": round(running, 2), "pnl": trade.pnl})

    daily = [{"date": key, "pnl": round(value, 2)} for key, value in sorted(daily_map.items())]
    daily_values = [item["pnl"] for item in daily]
    mean_daily = sum(daily_values) / len(daily_values) if daily_values else 0
    sharpe = (mean_daily / std_dev(daily_values) * math.sqrt(252)) if len(daily_values) >= 5 and std_dev(daily_values) else 0
    downside = [value for value in daily_values if value < 0]
    sortino = (mean_daily / std_dev(downside) * math.sqrt(252)) if len(daily_values) >= 5 and downside and std_dev(downside) else 0

    peak = initial_balance
    equity = initial_balance
    max_dd = 0.0
    max_dd_pct = 0.0
    for trade in ordered:
        equity += trade.pnl
        peak = max(peak, equity)
        dd = equity - peak
        dd_pct = ((equity - peak) / peak) * 100 if peak else 0
        if dd < max_dd:
            max_dd = dd
            max_dd_pct = dd_pct

    trading_days = len(daily)
    annualized_return = (total_pnl / initial_balance) * (252 / trading_days) * 100 if initial_balance and trading_days else 0
    calmar = annualized_return / abs(max_dd_pct) if max_dd_pct else 0

    by_symbol: dict[str, dict] = defaultdict(lambda: {"pnl": 0.0, "count": 0, "wins": 0})
    by_tag: dict[str, dict] = defaultdict(lambda: {"pnl": 0.0, "count": 0, "wins": 0})
    for trade in trades:
        item = by_symbol[trade.underlying]
        item["pnl"] += trade.pnl
        item["count"] += 1
        item["wins"] += 1 if trade.status == "win" else 0
        for tag in trade.tags:
            tag_item = by_tag[tag.name]
            tag_item["pnl"] += trade.pnl
            tag_item["count"] += 1
            tag_item["wins"] += 1 if trade.status == "win" else 0

    symbol_data = sorted(
        [
            {
                "symbol": symbol,
                "pnl": round(values["pnl"], 2),
                "count": values["count"],
                "wr": round(values["wins"] / values["count"] * 100),
            }
            for symbol, values in by_symbol.items()
        ],
        key=lambda item: item["pnl"],
        reverse=True,
    )
    tag_data = sorted(
        [
            {
                "tag": tag,
                "pnl": round(values["pnl"], 2),
                "count": values["count"],
                "wr": round(values["wins"] / values["count"] * 100),
            }
            for tag, values in by_tag.items()
        ],
        key=lambda item: item["pnl"],
        reverse=True,
    )

    day_count_map: dict[str, int] = defaultdict(int)
    revenge_by_day: dict[str, list[Trade]] = defaultdict(list)
    for trade in ordered:
        key = trade.date.isoformat()
        day_count_map[key] += 1
        revenge_by_day[key].append(trade)
    counts = list(day_count_map.values())
    mean_count = sum(counts) / len(counts) if counts else 0
    threshold = max(mean_count + 1.5 * std_dev([float(count) for count in counts]), mean_count + 2)
    overtrading_days = [{"date": key, "count": value} for key, value in sorted(day_count_map.items(), key=lambda item: item[1], reverse=True) if value > threshold]
    revenge_count = 0
    for day_trades in revenge_by_day.values():
        seen_loss = False
        for trade in sorted(day_trades, key=lambda item: item.entry_time or ""):
            if seen_loss:
                revenge_count += 1
            seen_loss = trade.status == "loss"
    discipline_score = max(0, round(100 - min(40, len(overtrading_days) * 8) - min(25, revenge_count * 5)))

    mae_trades = [trade for trade in ordered if trade.mae is not None and trade.mfe is not None]
    mae_mfe_chart = [
        {"trade": index + 1, "mae": round(trade.mae or 0, 2), "mfe": round(trade.mfe or 0, 2), "pnl": trade.pnl, "symbol": trade.underlying}
        for index, trade in enumerate(mae_trades[-20:])
    ]

    dow_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dow_map: dict[int, dict] = defaultdict(lambda: {"pnl": 0.0, "count": 0, "wins": 0})
    for trade in ordered:
        weekday = date.fromisoformat(trade.date.isoformat()).weekday() + 1
        target = dow_map[weekday]
        target["pnl"] += trade.pnl
        target["count"] += 1
        target["wins"] += 1 if trade.status == "win" else 0
    dow_data = [
        {
            "day": dow_names[weekday],
            "pnl": round(dow_map[weekday]["pnl"], 2),
            "count": dow_map[weekday]["count"],
            "wr": round(dow_map[weekday]["wins"] / dow_map[weekday]["count"] * 100) if dow_map[weekday]["count"] else 0,
        }
        for weekday in range(1, 6)
    ]

    max_win_streak = max_loss_streak = current_streak = 0
    current_streak_type: str | None = None
    streak_type: str | None = None
    for trade in ordered:
        next_type = "win" if trade.status == "win" else "loss" if trade.status == "loss" else "breakeven"
        if next_type == "breakeven":
            current_streak = 0
            streak_type = None
            current_streak_type = None
            continue
        if streak_type == next_type:
            current_streak += 1
        else:
            current_streak = 1
            streak_type = next_type
        current_streak_type = streak_type
        if streak_type == "win":
            max_win_streak = max(max_win_streak, current_streak)
        else:
            max_loss_streak = max(max_loss_streak, current_streak)

    r_histogram: list[dict] = []
    avg_r = 0.0
    if avg_loss:
        r_buckets: dict[str, int] = {}
        r_values: list[float] = []
        for trade in trades:
            r_value = round(trade.pnl / avg_loss, 2)
            r_values.append(r_value)
            bucket = "<=-3R" if r_value <= -3 else ">=3R" if r_value >= 3 else f"{math.floor(r_value)}R" if r_value < 0 else f"+{math.floor(r_value)}R"
            r_buckets[bucket] = r_buckets.get(bucket, 0) + 1
        avg_r = round(sum(r_values) / len(r_values), 2) if r_values else 0.0
        bucket_order = ["<=-3R", "-3R", "-2R", "-1R", "+0R", "+1R", "+2R", ">=3R"]
        r_histogram = [
            {"bucket": bucket, "count": r_buckets[bucket], "positive": bucket.startswith("+") and bucket != "+0R"}
            for bucket in bucket_order
            if bucket in r_buckets
        ]

    return {
        "total_pnl": round(total_pnl, 2),
        "win_rate": round(win_rate, 2),
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "profit_factor": round(profit_factor, 2),
        "expectancy": round(expectancy, 2),
        "sharpe": round(sharpe, 2),
        "sortino": round(sortino, 2),
        "calmar": round(calmar, 2),
        "max_drawdown": round(max_dd, 2),
        "max_drawdown_pct": round(max_dd_pct, 2),
        "discipline_score": discipline_score,
        "trade_count": len(trades),
        "trading_days": trading_days,
        "equity_curve": equity_curve,
        "daily": daily,
        "dow_data": dow_data,
        "symbol_data": symbol_data,
        "tag_data": tag_data,
        "rolling": [],
        "r_histogram": r_histogram,
        "mae_mfe_chart": mae_mfe_chart,
        "overtrading_days": overtrading_days,
        "revenge_count": revenge_count,
        "max_win_streak": max_win_streak,
        "max_loss_streak": max_loss_streak,
        "current_streak": current_streak,
        "current_streak_type": current_streak_type,
        "avg_r": avg_r,
    }
