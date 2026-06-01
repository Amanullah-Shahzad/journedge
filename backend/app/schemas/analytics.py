from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_pnl: float
    win_rate: float
    avg_win: float
    avg_loss: float
    profit_factor: float
    expectancy: float
    sharpe: float
    sortino: float
    calmar: float
    max_drawdown: float
    max_drawdown_pct: float
    discipline_score: int
    trade_count: int
    trading_days: int
    equity_curve: list[dict]
    daily: list[dict]
    dow_data: list[dict]
    symbol_data: list[dict]
    tag_data: list[dict]
    rolling: list[dict]
    r_histogram: list[dict]
    mae_mfe_chart: list[dict]
    overtrading_days: list[dict]
    revenge_count: int
