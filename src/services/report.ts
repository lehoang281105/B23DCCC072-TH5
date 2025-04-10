import axios from '@/utils/axios';
import type { ReportData } from '@/models/report';

// Mock API URL - Replace this with the actual API endpoint when available
const REPORT_API_URL = 'https://67f72b6542d6c71cca643b99.mockapi.io/reports';

export const getClubReports = async (): Promise<ReportData[]> => {
	try {
		const response = await axios.get(REPORT_API_URL);
		return response.data;
	} catch (error) {
		console.error('Error fetching reports:', error);
		throw error;
	}
};

export const getClubReport = async (id: string): Promise<ReportData> => {
	try {
		const response = await axios.get(`${REPORT_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching report with id ${id}:`, error);
		throw error;
	}
};

export const getReportsByClubId = async (clubId: string): Promise<ReportData[]> => {
	try {
		const response = await axios.get(REPORT_API_URL);
		return response.data.filter((report: ReportData) => report.clubId === clubId);
	} catch (error) {
		console.error(`Error fetching reports for club ${clubId}:`, error);
		throw error;
	}
};

export const addClubReport = async (report: Omit<ReportData, 'id'>): Promise<ReportData> => {
	try {
		const response = await axios.post(REPORT_API_URL, report, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error('Error adding report:', error);
		throw error;
	}
};

export const updateClubReport = async (id: string, report: Partial<ReportData>): Promise<ReportData> => {
	try {
		const response = await axios.put(`${REPORT_API_URL}/${id}`, report, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error(`Error updating report with id ${id}:`, error);
		throw error;
	}
};

export const deleteClubReport = async (id: string): Promise<void> => {
	try {
		await axios.delete(`${REPORT_API_URL}/${id}`);
	} catch (error) {
		console.error(`Error deleting report with id ${id}:`, error);
		throw error;
	}
};

// Helper function to convert file to base64
const getBase64 = (file: File): Promise<string> =>
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

// Utility function for handling image uploads
export const processImages = async (files: File[]): Promise<string[]> => {
	try {
		const imagePromises = files.map((file) => getBase64(file));
		return Promise.all(imagePromises);
	} catch (error) {
		console.error('Error processing images:', error);
		throw error;
	}
};
