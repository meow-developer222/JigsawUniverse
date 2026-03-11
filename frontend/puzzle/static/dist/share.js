export const initKakao = () => {
    if (!Kakao.isInitialized()) {
        Kakao.init('b33d2894eee50533bba850169ecb1175'); // 복사한 키 입력
    }
};
export const shareToKakao = () => {
    const roomId = location.href.split("/")[location.href.split("/").length - 1];
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: 'Jigsaw Universe 협동 요청!',
            description: `퍼즐을 같이 완성해요! 혼자서는 너무 많아요.`,
            imageUrl: 'https://jigsaw.meowdev.co.kr/static/images/test2.png', // 퍼즐 미리보기 이미지
            link: {
                mobileWebUrl: `https://jigsaw.meowdev.co.kr/multi_play/${roomId}`,
                webUrl: `https://jigsaw.meowdev.co.kr/multi_play/${roomId}`,
            },
        },
        buttons: [
            {
                title: '지금 바로 돕기',
                link: {
                    mobileWebUrl: `https://jigsaw.meowdev.co.kr/multi_play/${roomId}`,
                    webUrl: `https://jigsaw.meowdev.co.kr/multi_play/${roomId}`,
                },
            },
        ],
    });
};
initKakao();
document.getElementById("share-kakao").onclick = shareToKakao;
//# sourceMappingURL=share.js.map