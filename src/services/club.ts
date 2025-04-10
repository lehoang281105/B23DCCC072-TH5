import axios from '@/utils/axios';
import type { ClubData } from '@/models/club';

const CLUB_API_URL = 'https://67f72b6542d6c71cca643b99.mockapi.io/Clb';

export const getClubs = async (): Promise<ClubData[]> => {
	try {
		const response = await axios.get(CLUB_API_URL);
		return response.data;
	} catch (error) {
		console.error('Error fetching clubs:', error);
		throw error;
	}
};

export const getClub = async (id: string): Promise<ClubData> => {
	try {
		const response = await axios.get(`${CLUB_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching club with id ${id}:`, error);
		throw error;
	}
};

export const addClub = async (club: Omit<ClubData, 'id'>): Promise<ClubData> => {
	try {
		const response = await axios.post(CLUB_API_URL, club, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error('Error adding club:', error);
		throw error;
	}
};

export const updateClub = async (id: string, club: Partial<ClubData>): Promise<ClubData> => {
	try {
		const response = await axios.put(`${CLUB_API_URL}/${id}`, club, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error(`Error updating club with id ${id}:`, error);
		throw error;
	}
};

export const deleteClub = async (id: string): Promise<void> => {
	try {
		await axios.delete(`${CLUB_API_URL}/${id}`);
	} catch (error) {
		console.error(`Error deleting club with id ${id}:`, error);
		throw error;
	}
};

export const getBase64 = (file: File | Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const img = document.createElement('img');
			img.src = reader.result as string;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const MAX_WIDTH = 800;
				const MAX_HEIGHT = 600;
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > MAX_WIDTH) {
						height *= MAX_WIDTH / width;
						width = MAX_WIDTH;
					}
				} else {
					if (height > MAX_HEIGHT) {
						width *= MAX_HEIGHT / height;
						height = MAX_HEIGHT;
					}
				}
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx?.drawImage(img, 0, 0, width, height);
				const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
				resolve(dataUrl);
			};
			img.onerror = () => {
				reject(new Error('Không thể tải hình ảnh'));
			};
		};
		reader.onerror = (error) => reject(error);
	});
