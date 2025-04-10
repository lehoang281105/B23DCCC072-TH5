import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getClubs, addClub, updateClub, deleteClub } from '@/services/club';

export interface ClubData {
	id: string;
	avatar: string;
	name: string;
	description: string;
	chuNhiem: string;
	active: boolean;
}

export default () => {
	const [clubs, setClubs] = useState<ClubData[]>([]);
	const [editingClub, setEditingClub] = useState<ClubData | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [avatarImage, setAvatarImage] = useState('');
	const [selectedClubId, setSelectedClubId] = useState<string>('');

	const fetchClubs = async () => {
		try {
			const data = await getClubs();
			setClubs(data);
		} catch (err) {
			console.error('Error fetching clubs:', err);
		}
	};

	useEffect(() => {
		fetchClubs();
	}, [refresh]);

	const handleDelete = async (id: string) => {
		try {
			await deleteClub(id);
			setClubs((prev) => prev.filter((c) => c.id !== id));
			message.success('Xóa CLB thành công!');
		} catch (err) {
			console.error('Error deleting club:', err);
			message.error('Có lỗi xảy ra khi xóa CLB!');
		}
	};

	const handleEdit = (club: ClubData) => {
		// Batch state updates using setTimeout to avoid React queue issues
		setTimeout(() => {
			setEditingClub(club);
			setPreviewImage(club.avatar || '');
			setAvatarImage(club.avatar || '');
			setIsModalOpen(true);
		}, 0);
	};

	const handleSave = async (values: any) => {
		try {
			if (!avatarImage && !values.avatar) {
				message.error('Vui lòng tải lên ảnh đại diện!');
				return;
			}

			const avatarToSave = avatarImage || values.avatar || '';

			if (avatarToSave.length > 524288) {
				message.error('Ảnh quá lớn! Vui lòng chọn ảnh có kích thước nhỏ hơn.');
				return;
			}

			const dataToSave = {
				...values,
				avatar: avatarToSave,
			};

			if (editingClub) {
				await updateClub(editingClub.id, dataToSave);
				message.success('Cập nhật câu lạc bộ thành công!');
			} else {
				await addClub(dataToSave);
				message.success('Thêm câu lạc bộ mới thành công!');
			}

			setRefresh(!refresh);
			resetState();
		} catch (error) {
			console.error('Error saving club:', error);
			message.error('Có lỗi xảy ra khi lưu câu lạc bộ!');
		}
	};

	const resetState = () => {
		setEditingClub(null);
		setPreviewImage('');
		setAvatarImage('');
		setIsModalOpen(false);
	};

	return {
		clubs,
		editingClub,
		isModalOpen,
		isMemberModalOpen,
		refresh,
		imageLoading,
		previewImage,
		avatarImage,
		selectedClubId,
		setClubs,
		setEditingClub,
		setIsModalOpen,
		setIsMemberModalOpen,
		setRefresh,
		setImageLoading,
		setPreviewImage,
		setAvatarImage,
		setSelectedClubId,
		fetchClubs,
		handleDelete,
		handleEdit,
		handleSave,
		resetState,
	};
};
