import axios from '@/utils/axios';
import type { MemberData } from '@/models/member';

const MEMBER_API_URL = 'https://67f74a7a42d6c71cca64966c.mockapi.io/students';

export const getMembers = async (): Promise<MemberData[]> => {
	try {
		const response = await axios.get(MEMBER_API_URL);
		return response.data;
	} catch (error) {
		console.error('Error fetching members:', error);
		throw error;
	}
};

export const getMember = async (id: string): Promise<MemberData> => {
	try {
		const response = await axios.get(`${MEMBER_API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching member with id ${id}:`, error);
		throw error;
	}
};

export const getMembersByClubId = async (clubId: string): Promise<MemberData[]> => {
	try {
		const response = await axios.get(MEMBER_API_URL);
		return response.data.filter((member: MemberData) => member.club === clubId && member.status === 'Approved');
	} catch (error) {
		console.error(`Error fetching members for club ${clubId}:`, error);
		throw error;
	}
};

export const addMember = async (member: Omit<MemberData, 'id'>): Promise<MemberData> => {
	try {
		const response = await axios.post(MEMBER_API_URL, member, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error('Error adding member:', error);
		throw error;
	}
};

export const updateMember = async (id: string, member: Partial<MemberData>): Promise<MemberData> => {
	try {
		const response = await axios.put(`${MEMBER_API_URL}/${id}`, member, {
			headers: { 'Content-Type': 'application/json' },
		});
		return response.data;
	} catch (error) {
		console.error(`Error updating member with id ${id}:`, error);
		throw error;
	}
};

export const updateMemberStatus = async (
	id: string,
	status: 'Approved' | 'Rejected',
	note?: string,
): Promise<MemberData> => {
	try {
		const timestamp = new Date().toLocaleString();
		const historyEntry = `Admin đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} vào lúc ${timestamp} ${
			note ? `với lý do: ${note}` : ''
		}`;

		const response = await axios.put(
			`${MEMBER_API_URL}/${id}`,
			{ status, note, history: historyEntry },
			{ headers: { 'Content-Type': 'application/json' } },
		);
		return response.data;
	} catch (error) {
		console.error(`Error updating member status with id ${id}:`, error);
		throw error;
	}
};

export const deleteMember = async (id: string): Promise<void> => {
	try {
		await axios.delete(`${MEMBER_API_URL}/${id}`);
	} catch (error) {
		console.error(`Error deleting member with id ${id}:`, error);
		throw error;
	}
};
