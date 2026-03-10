
import { PIECE_SIZE, SPINE_HEIGHT, SPINE_OFFSET, SPINE_WIDTH } from "./const.js";
import { Piece } from "./piece.js";

export function draw_piece_path(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, piece: Piece) {
    const half = PIECE_SIZE / 2;
    const padding = Math.max(SPINE_HEIGHT, SPINE_WIDTH) + 10;
    
    // ctx.save();
    // 캔버스 중앙으로 이동 (여백 고려)
    ctx.translate(half + padding, half + padding);
    // ctx.translate(piece.)
    ctx.beginPath();

    // 꼭짓점 정의 (이미 piece 데이터에 계산되어 들어옴)
    const c0 = piece.corners[0]; // 좌상
    const c1 = piece.corners[1]; // 우상
    const c2 = piece.corners[2]; // 우하
    const c3 = piece.corners[3]; // 좌하

    // 1. 위쪽 변 (c0 -> c1)
    ctx.moveTo(c0[0], c0[1]);
    if (piece.spine_dir[0] !== 0) {
        const midX = (c0[0] + c1[0]) / 2;
        const midY = (c0[1] + c1[1]) / 2;
        ctx.lineTo(midX - SPINE_WIDTH / 2, midY);
        ctx.bezierCurveTo(
            midX - SPINE_WIDTH / 2 - SPINE_OFFSET, midY - SPINE_HEIGHT * piece.spine_dir[0],
            midX + SPINE_WIDTH / 2 + SPINE_OFFSET, midY - SPINE_HEIGHT * piece.spine_dir[0],
            midX + SPINE_WIDTH / 2, midY
        );
    }
    ctx.lineTo(c1[0], c1[1]);

    // 2. 오른쪽 변 (c1 -> c2)
    if (piece.spine_dir[1] !== 0) {
        const midX = (c1[0] + c2[0]) / 2;
        const midY = (c1[1] + c2[1]) / 2;
        ctx.lineTo(midX, midY - SPINE_WIDTH / 2);
        ctx.bezierCurveTo(
            midX + SPINE_HEIGHT * piece.spine_dir[1], midY - SPINE_WIDTH / 2 - SPINE_OFFSET,
            midX + SPINE_HEIGHT * piece.spine_dir[1], midY + SPINE_WIDTH / 2 + SPINE_OFFSET,
            midX, midY + SPINE_WIDTH / 2
        );
    }
    ctx.lineTo(c2[0], c2[1]);

    // 3. 아래쪽 변 (c2 -> c3)
    if (piece.spine_dir[2] !== 0) {
        const midX = (c2[0] + c3[0]) / 2;
        const midY = (c2[1] + c3[1]) / 2;
        ctx.lineTo(midX + SPINE_WIDTH / 2, midY);
        ctx.bezierCurveTo(
            midX + SPINE_WIDTH / 2 + SPINE_OFFSET, midY + SPINE_HEIGHT * piece.spine_dir[2],
            midX - SPINE_WIDTH / 2 - SPINE_OFFSET, midY + SPINE_HEIGHT * piece.spine_dir[2],
            midX - SPINE_WIDTH / 2, midY
        );
    }
    ctx.lineTo(c3[0], c3[1]);

    // 4. 왼쪽 변 (c3 -> c0)
    if (piece.spine_dir[3] !== 0) {
        const midX = (c3[0] + c0[0]) / 2;
        const midY = (c3[1] + c0[1]) / 2;
        ctx.lineTo(midX, midY + SPINE_WIDTH / 2);
        ctx.bezierCurveTo(
            midX - SPINE_HEIGHT * piece.spine_dir[3], midY + SPINE_WIDTH / 2 + SPINE_OFFSET,
            midX - SPINE_HEIGHT * piece.spine_dir[3], midY - SPINE_WIDTH / 2 - SPINE_OFFSET,
            midX, midY - SPINE_WIDTH / 2
        );
    }
    ctx.lineTo(c0[0], c0[1]);
    
    ctx.closePath();

    ctx.translate(-half - padding, -half - padding);
    
}