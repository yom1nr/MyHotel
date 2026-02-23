import { getToken } from './authService'
import type {
  ApiResponse,
  Room,
  RoomCreateInput,
  RoomUpdateInput,
} from '../types/room'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/api/rooms`, {
    headers: authHeaders(),
  })

  const json = await parseJson<Room[]>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load rooms')
  }

  return json.data
}

export async function getPublicRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/api/public/rooms`)

  const json = await parseJson<Room[]>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load public rooms')
  }

  return json.data
}

export async function createRoom(input: RoomCreateInput): Promise<Room> {
  const res = await fetch(`${BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  })

  const json = await parseJson<Room>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create room')
  }

  return json.data
}

export async function updateRoom(id: number, input: RoomUpdateInput): Promise<Room> {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  })

  const json = await parseJson<Room>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update room')
  }

  return json.data
}

export async function deleteRoom(id: number): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  const json = await parseJson<{ id: number }>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete room')
  }

  return json.data
}
