import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getMembers, addMember, updateMember, deleteMember, updateMemberStatus } from '@/services/member';
import { ClubData } from './club';

export interface MemberData {
	id: string;
	name: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	club: string;
	reason: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	note?: string;
	history?: string[];
}

export default () => {
	const [members, setMembers] = useState<MemberData[]>([]);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewMode, setIsViewMode] = useState(false);
	const [editingMember, setEditingMember] = useState<MemberData | null>(null);
	const [refresh, setRefresh] = useState(false);
	const [clubs, setClubs] = useState<ClubData[]>([]);
	const [selectedClubId, setSelectedClubId] = useState<string>('');
	const [selectedClubMembers, setSelectedClubMembers] = useState<MemberData[]>([]);

	const fetchMembers = async () => {
		try {
			const data = await getMembers();
			setMembers(data);
		} catch (err) {
			console.error('Error fetching members:', err);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, [refresh]);

	const getMembersByClub = (clubId: string) => {
		const filteredMembers = members.filter((member) => member.club === clubId && member.status === 'Approved');
		setSelectedClubId(clubId);
		setSelectedClubMembers(filteredMembers);
	};

	const handleApprove = async (id: string) => {
		try {
			await updateMemberStatus(id, 'Approved');
			setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, status: 'Approved' } : member)));
			message.success('Đã duyệt đơn đăng ký!');
		} catch (err) {
			console.error('Error approving member:', err);
			message.error('Có lỗi xảy ra khi duyệt đơn!');
		}
	};

	const handleReject = async (id: string, note: string) => {
		try {
			await updateMemberStatus(id, 'Rejected', note);
			setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, status: 'Rejected', note } : member)));
			message.success('Đã từ chối đơn đăng ký!');
		} catch (err) {
			console.error('Error rejecting member:', err);
			message.error('Có lỗi xảy ra khi từ chối đơn!');
		}
	};

	const handleDelete = async (id: string) => {
		const member = members.find((m) => m.id === id);

		if (member?.status === 'Approved') {
			setMembers((prev) => prev.filter((m) => m.id !== id));
			message.success('Đã xóa đơn đăng ký khỏi bảng nhưng giữ lại dữ liệu sinh viên đã được duyệt!');
			return;
		}

		try {
			await deleteMember(id);
			setMembers((prev) => prev.filter((m) => m.id !== id));
			message.success('Xóa đơn đăng ký thành công!');
		} catch (err) {
			console.error('Error deleting member:', err);
			message.error('Có lỗi xảy ra khi xóa đơn!');
		}
	};

	const handleSave = async (values: any) => {
		try {
			if (editingMember) {
				await updateMember(editingMember.id, values);
				message.success('Cập nhật đơn đăng ký thành công!');
			} else {
				const newMember = { ...values, status: 'Pending' };
				await addMember(newMember);
				message.success('Thêm mới đơn đăng ký thành công!');
			}

			setRefresh(!refresh);
			resetState();
		} catch (err) {
			console.error('Error saving member:', err);
			message.error('Có lỗi xảy ra khi lưu đơn đăng ký!');
		}
	};

	const resetState = () => {
		setEditingMember(null);
		setIsModalOpen(false);
	};

	const handleViewDetails = (member: MemberData) => {
		setEditingMember(member);
		setIsViewMode(true);
		setIsModalOpen(true);
	};

	const handleEdit = (member: MemberData) => {
		setEditingMember(member);
		setIsViewMode(false);
		setIsModalOpen(true);
	};

	return {
		members,
		selectedRows,
		isModalOpen,
		isViewMode,
		editingMember,
		refresh,
		clubs,
		selectedClubId,
		selectedClubMembers,
		setMembers,
		setSelectedRows,
		setIsModalOpen,
		setIsViewMode,
		setEditingMember,
		setRefresh,
		setClubs,
		setSelectedClubId,
		setSelectedClubMembers,
		fetchMembers,
		getMembersByClub,
		handleApprove,
		handleReject,
		handleDelete,
		handleSave,
		resetState,
		handleViewDetails,
		handleEdit,
	};
};
