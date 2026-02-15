import asyncio
import websockets


import json

from .room import Room

rooms = {}
nextUserID = 1

async def handler(websocket):
    global nextUserID
    
    try:
        current_room = None
        userID = nextUserID
        nextUserID += 1
        async for message in websocket:
            data = json.loads(message)
            if data["command"] == "join":
                if data["roomID"] in rooms:
                    current_room = rooms[data["roomID"]]
                    print("New player")
                    await websocket.send(json.dumps({"command": "code", "code": 200}))
                    del data["command"]
                    await current_room.join(userID, websocket, data)
                else:
                    current_room = Room("/static/images/test2.png", 20, 20, data["roomID"])
                    rooms[data['roomID']] = current_room
                    print("New player")
                    await websocket.send(json.dumps({"command": "code", "code": 200}))
                    del data["command"]
                    await current_room.join(userID, websocket, data)
                    
                
            elif current_room:
                await current_room.message(userID, data)
    except websockets.exceptions.ConnectionClosed:
        print("close")
        
        # await websocket.close()
    finally:
        print("ASDF")
        current_room.disconnect(userID)

async def start():
    async with websockets.serve(handler, "0.0.0.0", 6767, ping_interval = 1, ping_timeout=1) as socket:

            await socket.serve_forever()

if __name__ == "__main__":
    asyncio.run(start())