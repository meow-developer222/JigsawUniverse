export function shuffle(array: any[]) {
  // 원본 배열을 수정하지 않으려면 복사본을 만듭니다.
  const arr = [...array]; 
  for (let i = arr.length - 1; i > 0; i--) {
    // 0 이상 i 이하의 무작위 인덱스 생성
    const j = Math.floor(Math.random() * (i + 1));
    // 구조 분해 할당을 사용하여 요소 교환 (swap)
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function range(l: number) {
	let i = -1;
    let res = [];
    while (++i < l) {
    	res.push(i);
    }
   	return res;
};