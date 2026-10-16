"""
WebSocket /ws/progress — live progress channel.

REST is request/response: the client waits for one answer. A dashboard that
loads all three statewide surfaces (3 x 10,800 cells) benefits from *push*
feedback so the UI can show a progress bar instead of freezing. This WebSocket
streams JSON progress events while the server queries each service in turn,
then sends a final 'complete' event with a short summary.

Protocol (server -> client, one JSON object per message):
  {"stage": "start",   "total": 3}
  {"stage": "progress","service": "surgery", "pct": 33, "covered_pct": 81.3}
  ...
  {"stage": "complete","summary": {...}}
"""
import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..db import get_pool

router = APIRouter(tags=["progress"])

_SERVICES = ["surgery", "geriatrics", "emergency"]


@router.websocket("/ws/progress")
async def ws_progress(websocket: WebSocket):
    await websocket.accept()
    pool = get_pool()
    try:
        await websocket.send_json({"stage": "start", "total": len(_SERVICES)})
        summary = {}
        for i, service in enumerate(_SERVICES, start=1):
            # statewide CELL coverage % for this service (baseline scenario).
            # Reduce the cell x hospital expansion to the nearest hospital per
            # cell first (DISTINCT ON), then compute coverage — otherwise the
            # ratio is over cell-hospital pairs, not cells.
            async with pool.acquire() as conn:
                covered_pct = await conn.fetchval(
                    """
                    WITH nearest AS (
                        SELECT DISTINCT ON (grid_id) grid_id, accessible
                        FROM accessibility_results
                        WHERE service_group = $1 AND scenario_id = 0
                        ORDER BY grid_id, travel_time_min
                    )
                    SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE accessible = 1)
                           / NULLIF(COUNT(*), 0), 1)
                    FROM nearest;
                    """,
                    service,
                )
            summary[service] = float(covered_pct) if covered_pct is not None else None
            await websocket.send_json({
                "stage": "progress",
                "service": service,
                "pct": round(100 * i / len(_SERVICES)),
                "covered_pct": summary[service],
            })
            await asyncio.sleep(0.4)  # let the client render the bar between steps
        await websocket.send_json({"stage": "complete", "summary": summary})
    except WebSocketDisconnect:
        # client closed the tab — nothing to clean up, the pool is shared
        return
