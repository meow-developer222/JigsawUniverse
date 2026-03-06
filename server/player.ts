export class Player
{
    
    id: string;
    nickname: string;


    toJson(): any {
      return {id: this.id, nickname: this.nickname};
    }
    

    constructor(id: string, nickname: string)
    {
        this.id = id;
        this.nickname = nickname;
    }
}