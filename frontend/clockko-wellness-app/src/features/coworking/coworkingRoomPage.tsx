import { useEffect, useState } from "react";
import { fetchRooms } from "./api";
import { coworkingService } from "./coworkingService";
import type { RoomSummary } from "../../types/typesGlobal";
import RoomView from "./roomView";
import { Button } from "../../components/ui/button";
import Poses from '../../assets/images/KoPoses.png'
import { Skeleton } from "@/components/ui/skeleton";
import toast from 'react-hot-toast';

export default function CoWorkingRoomsPage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetchRooms().then((data) => {
      const processedRooms = data.map(room => ({
        ...room,
        count: room.status && room.status.toLowerCase() === "active" ? room.count : 0,
      }));
      
      setTimeout(() => {
        if (isMounted) {
          setRooms(processedRooms);
          setLoading(false);
        }
      }, 3000); // 3 seconds skeleton loading
    });

    // Listen for room count updates
    const handleRoomCountUpdate = ({ roomId, count }: { roomId: string, count: number }) => {
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, count } : room
      ));
    };

    coworkingService.on('roomCountUpdated', handleRoomCountUpdate);

    return () => { 
      isMounted = false;
      coworkingService.off('roomCountUpdated', handleRoomCountUpdate);
    };
  }, []);

  const handleJoinRoom = async (room: RoomSummary) => {
    try {
      const joinedRoom = await coworkingService.joinRoom(room.id);
      if (joinedRoom) {
        setSelectedRoom(room);
        toast.success(`Joined ${room.name}!`);
      } else {
        toast.error('Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    }
  };

  if (selectedRoom) {
    // Pass selected room data for correct name and leave handler
    return <RoomView roomId={selectedRoom.id} roomName={selectedRoom.name} onLeaveRoom={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="min-h-screen bg-powderBlue px-4 py-4">
      <div className="bg-white rounded-2xl px-8 py-10 flex items-center gap-6 mb-6 shadow">
        <img src={Poses} alt="Koala mascot" className="w-32 h-32" />
        <div>
          <h1 className="text-2xl font-bold">Co-working rooms</h1>
          <div className="text-gray-600">Work together, stay focused</div>
        </div>
      </div>
      <div className="font-semibold text-lg mb-3">Available Rooms</div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="rounded-2xl px-6 py-8 bg-grayBlue shadow-lg h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.length === 0 ? (
            // Show skeleton if no rooms after loading
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="rounded-2xl px-6 py-8 bg-grayBlue shadow-lg h-32" />
            ))
          ) : (
            rooms.map((room) => (
              <div key={room.id} className={`rounded-3xl p-6 shadow flex flex-col justify-between ${room.color}`}>
                <div>
                  <div className="font-bold text-xl">{room.name}</div>
                  <div className="text-gray-500 mb-2">{room.description}</div>
                </div>
                {/* button and active room */}
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 text-sm">{room.count} {room.status}</div>
                  <Button className="mt-4 bg-blue1 hover:bg-blue-800/70" onClick={() => handleJoinRoom(room)}>
                    Join
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}